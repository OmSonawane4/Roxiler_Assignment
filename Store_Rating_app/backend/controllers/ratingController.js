const pool = require('../config/database');

const ratingController = {
    submitRating: async (req, res) => { // Submit a rating with sentiment analysis, photos, and helpful tracking
        try {
            const { rating, comment, photos, sentiment } = req.body;
            const storeId = req.params.storeId;
            const userId = req.user.id;

            // Check if store exists
            const [stores] = await pool.query(
                'SELECT * FROM stores WHERE id = ?',
                [storeId]
            );

            if (stores.length === 0) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Store not found'
                });
            }

            // Check if user has already rated
            const [existingRating] = await pool.query(
                'SELECT * FROM ratings WHERE store_id = ? AND user_id = ?',
                [storeId, userId]
            );

            if (existingRating.length > 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'You have already rated this store'
                });
            }

            // Analyze sentiment if not provided
            let analyzedSentiment = sentiment;
            if (!analyzedSentiment && comment) {
                // Enhanced sentiment analysis with weighted scoring
                const sentimentDict = {
                    positive: {
                        words: ['great', 'good', 'excellent', 'amazing', 'fantastic', 'wonderful', 'best', 'love', 'perfect', 'awesome'],
                        weight: 1.5
                    },
                    negative: {
                        words: ['bad', 'poor', 'terrible', 'worst', 'horrible', 'awful', 'disappointing', 'hate', 'mediocre', 'unpleasant'],
                        weight: 1.2
                    }
                };
                
                const words = comment.toLowerCase().split(/\W+/);
                let sentimentScore = 0;

                words.forEach(word => {
                    if (sentimentDict.positive.words.includes(word)) {
                        sentimentScore += sentimentDict.positive.weight;
                    } else if (sentimentDict.negative.words.includes(word)) {
                        sentimentScore -= sentimentDict.negative.weight;
                    }
                });
                
                analyzedSentiment = sentimentScore > 0 ? 'positive' : 
                                  sentimentScore < 0 ? 'negative' : 'neutral';
            }

            let connection;
            try {
                connection = await pool.getConnection();
                await connection.beginTransaction();

                // Submit rating with metadata
                const [result] = await connection.query(
                    `INSERT INTO ratings 
                     (store_id, user_id, rating, comment, sentiment, verified_purchase, helpful_count) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [storeId, userId, rating, comment, analyzedSentiment, true, 0]
                );

                // Save photos if provided
                if (photos && Array.isArray(photos)) {
                    for (const photo of photos) {
                        await connection.query(
                            'INSERT INTO rating_photos (rating_id, photo_url) VALUES (?, ?)',
                            [result.insertId, photo]
                        );
                    }
                }

                await connection.commit();
                
                res.status(201).json({
                    status: 'success',
                    data: {
                        id: result.insertId,
                        store_id: storeId,
                        user_id: userId,
                        rating,
                        comment
                    }
                });
            } catch (error) {
                if (connection) {
                    await connection.rollback();
                }
                throw error;
            } finally {
                if (connection) {
                    connection.release();
                }
            }
        } catch (error) {
            console.error('Submit rating error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error submitting rating'
            });
        }
    },

    // Update a rating
    updateRating: async (req, res) => {
        try {
            const { rating, comment } = req.body;
            const { id } = req.params;
            const userId = req.user.id;

            // Check if rating exists and belongs to user
            const [existingRating] = await pool.query(
                'SELECT * FROM ratings WHERE id = ? AND user_id = ?',
                [id, userId]
            );

            if (existingRating.length === 0) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Rating not found or unauthorized'
                });
            }

            // Update rating
            await pool.query(
                'UPDATE ratings SET rating = ?, comment = ? WHERE id = ?',
                [rating, comment, id]
            );

            res.json({
                status: 'success',
                message: 'Rating updated successfully'
            });
        } catch (error) {
            console.error('Update rating error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error updating rating'
            });
        }
    },

    // Delete a rating
    deleteRating: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Check if rating exists and belongs to user or user is admin
            const [result] = await pool.query(
                `DELETE FROM ratings 
                 WHERE id = ? 
                 AND (user_id = ? OR ? IN (SELECT id FROM users WHERE role = 'admin'))`,
                [id, userId, userId]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Rating not found or unauthorized'
                });
            }

            res.json({
                status: 'success',
                message: 'Rating deleted successfully'
            });
        } catch (error) {
            console.error('Delete rating error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error deleting rating'
            });
        }
    },

    // Get ratings for a store
    getStoreRatings: async (req, res) => {
        try {
            const { storeId } = req.params;

            const [ratings] = await pool.query(
                `SELECT r.*, u.name as user_name
                 FROM ratings r
                 JOIN users u ON r.user_id = u.id
                 WHERE r.store_id = ?
                 ORDER BY r.created_at DESC`,
                [storeId]
            );

            res.json({
                status: 'success',
                data: ratings
            });
        } catch (error) {
            console.error('Get store ratings error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error fetching ratings'
            });
        }
    },

    // Get ratings by a user
    getUserRatings: async (req, res) => {
        try {
            const userId = req.user.id;

            const [ratings] = await pool.query(
                `SELECT r.*, s.name as store_name
                 FROM ratings r
                 JOIN stores s ON r.store_id = s.id
                 WHERE r.user_id = ?
                 ORDER BY r.created_at DESC`,
                [userId]
            );

            res.json({
                status: 'success',
                data: ratings
            });
        } catch (error) {
            console.error('Get user ratings error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error fetching ratings'
            });
        }
    }
};

module.exports = ratingController;