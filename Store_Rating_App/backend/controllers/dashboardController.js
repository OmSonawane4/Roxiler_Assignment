const pool = require('../config/database');

const dashboardController = {
    // Admin Dashboard
    getAdminDashboard: async (req, res) => {
        try {
            const connection = await pool.getConnection();
            try {
                // Get total counts
                const [counts] = await connection.query(`
                    SELECT 
                        (SELECT COUNT(*) FROM users) as total_users,
                        (SELECT COUNT(*) FROM stores) as total_stores,
                        (SELECT COUNT(*) FROM ratings) as total_ratings,
                        (SELECT COUNT(*) FROM users WHERE role = 'store_owner') as store_owners
                `);

                // Get recent user registrations
                const [recentUsers] = await connection.query(`
                    SELECT id, name, email, role, created_at
                    FROM users
                    ORDER BY created_at DESC
                    LIMIT 10
                `);

                // Get recent store registrations
                const [recentStores] = await connection.query(`
                    SELECT s.*, u.name as owner_name
                    FROM stores s
                    JOIN users u ON s.owner_id = u.id
                    ORDER BY s.created_at DESC
                    LIMIT 10
                `);

                // Get stores with most ratings
                const [topRatedStores] = await connection.query(`
                    SELECT 
                        s.*, 
                        u.name as owner_name,
                        COUNT(r.id) as rating_count,
                        ROUND(AVG(r.rating), 1) as average_rating
                    FROM stores s
                    JOIN users u ON s.owner_id = u.id
                    LEFT JOIN ratings r ON s.id = r.store_id
                    GROUP BY s.id
                    HAVING rating_count > 0
                    ORDER BY average_rating DESC, rating_count DESC
                    LIMIT 10
                `);

                // Get system statistics
                const [statistics] = await connection.query(`
                    SELECT
                        (SELECT COUNT(*) FROM ratings WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as ratings_last_week,
                        (SELECT COUNT(*) FROM stores WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as new_stores_last_month,
                        (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as new_users_last_month,
                        (SELECT COUNT(*) FROM rating_photos) as total_photos
                `);

                res.json({
                    status: 'success',
                    data: {
                        counts: counts[0],
                        statistics: statistics[0],
                        recentUsers,
                        recentStores,
                        topRatedStores
                    }
                });
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Admin dashboard error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error fetching admin dashboard data'
            });
        }
    },

    // Store Owner Dashboard
    getStoreOwnerDashboard: async (req, res) => {
        try {
            const userId = req.user.id;
            const connection = await pool.getConnection();
            try {
                // Get store owner's stores
                const [stores] = await connection.query(`
                    SELECT s.*,
                        COUNT(DISTINCT r.id) as total_ratings,
                        ROUND(AVG(r.rating), 1) as average_rating,
                        COUNT(DISTINCT rp.id) as total_photos
                    FROM stores s
                    LEFT JOIN ratings r ON s.id = r.store_id
                    LEFT JOIN rating_photos rp ON r.id = rp.rating_id
                    WHERE s.owner_id = ?
                    GROUP BY s.id
                `, [userId]);

                // Get recent ratings for all owner's stores
                const [recentRatings] = await connection.query(`
                    SELECT r.*, s.name as store_name, u.name as user_name
                    FROM ratings r
                    JOIN stores s ON r.store_id = s.id
                    JOIN users u ON r.user_id = u.id
                    WHERE s.owner_id = ?
                    ORDER BY r.created_at DESC
                    LIMIT 10
                `, [userId]);

                // Get rating statistics per store
                const [storeStats] = await connection.query(`
                    SELECT 
                        s.id,
                        s.name,
                        COUNT(r.id) as total_ratings,
                        ROUND(AVG(r.rating), 1) as average_rating,
                        COUNT(CASE WHEN r.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as ratings_last_week,
                        COUNT(CASE WHEN r.sentiment = 'positive' THEN 1 END) as positive_ratings,
                        COUNT(CASE WHEN r.sentiment = 'negative' THEN 1 END) as negative_ratings
                    FROM stores s
                    LEFT JOIN ratings r ON s.id = r.store_id
                    WHERE s.owner_id = ?
                    GROUP BY s.id
                `, [userId]);

                // Get performance trends
                const [trends] = await connection.query(`
                    SELECT 
                        DATE(r.created_at) as date,
                        COUNT(*) as rating_count,
                        ROUND(AVG(r.rating), 1) as average_rating
                    FROM ratings r
                    JOIN stores s ON r.store_id = s.id
                    WHERE s.owner_id = ?
                    AND r.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                    GROUP BY DATE(r.created_at)
                    ORDER BY date
                `, [userId]);

                res.json({
                    status: 'success',
                    data: {
                        stores,
                        recentRatings,
                        storeStats,
                        trends
                    }
                });
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Store owner dashboard error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error fetching store owner dashboard data'
            });
        }
    },

    // User Dashboard
    getUserDashboard: async (req, res) => {
        try {
            const userId = req.user.id;
            const connection = await pool.getConnection();
            try {
                // Get user's rating activity
                const [userActivity] = await connection.query(`
                    SELECT 
                        COUNT(*) as total_ratings,
                        COUNT(DISTINCT store_id) as rated_stores,
                        ROUND(AVG(rating), 1) as average_rating_given,
                        (
                            SELECT COUNT(*)
                            FROM helpful_ratings hr
                            JOIN ratings r ON hr.rating_id = r.id
                            WHERE r.user_id = ?
                        ) as helpful_marks_received
                    FROM ratings
                    WHERE user_id = ?
                `, [userId, userId]);

                // Get user's recent ratings
                const [recentRatings] = await connection.query(`
                    SELECT r.*, s.name as store_name,
                        (SELECT COUNT(*) FROM helpful_ratings WHERE rating_id = r.id) as helpful_count
                    FROM ratings r
                    JOIN stores s ON r.store_id = s.id
                    WHERE r.user_id = ?
                    ORDER BY r.created_at DESC
                    LIMIT 10
                `, [userId]);

                // Get favorite stores (most rated or highly rated by user)
                const [favoriteStores] = await connection.query(`
                    SELECT s.*, 
                        COUNT(r.id) as rating_count,
                        MAX(r.rating) as user_rating
                    FROM stores s
                    JOIN ratings r ON s.id = r.store_id
                    WHERE r.user_id = ?
                    GROUP BY s.id
                    ORDER BY user_rating DESC, rating_count DESC
                    LIMIT 5
                `, [userId]);

                // Get contribution stats
                const [contributions] = await connection.query(`
                    SELECT 
                        COUNT(DISTINCT rp.id) as total_photos,
                        COUNT(DISTINCT hr.rating_id) as helpful_marks_given
                    FROM ratings r
                    LEFT JOIN rating_photos rp ON r.id = rp.rating_id
                    LEFT JOIN helpful_ratings hr ON hr.user_id = r.user_id
                    WHERE r.user_id = ?
                `, [userId]);

                res.json({
                    status: 'success',
                    data: {
                        userActivity: userActivity[0],
                        recentRatings,
                        favoriteStores,
                        contributions: contributions[0]
                    }
                });
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('User dashboard error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error fetching user dashboard data'
            });
        }
    }
};

module.exports = dashboardController;
