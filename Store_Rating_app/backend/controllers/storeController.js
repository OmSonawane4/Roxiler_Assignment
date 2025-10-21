const pool = require('../config/database');

const storeController = {
    // Create a store
    createStore: async (req, res) => {
        try {
            const { name, description, address, contact } = req.body;
            const userId = req.user.id;

            const [result] = await pool.query(
                'INSERT INTO stores (name, description, address, contact, owner_id) VALUES (?, ?, ?, ?, ?)',
                [name, description, address, contact, userId]
            );

            res.status(201).json({
                status: 'success',
                data: {
                    id: result.insertId,
                    name,
                    description,
                    address,
                    contact,
                    owner_id: userId
                }
            });
        } catch (error) {
            console.error('Create store error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error creating store'
            });
        }
    },

    // Update a store
    updateStore: async (req, res) => {
        try {
            const { name, description, address, contact } = req.body;
            const { id } = req.params;
            const userId = req.user.id;

            // Check if store exists and belongs to user or user is admin
            const [store] = await pool.query(
                `SELECT * FROM stores 
                 WHERE id = ? 
                 AND (owner_id = ? OR ? IN (SELECT id FROM users WHERE role = 'admin'))`,
                [id, userId, userId]
            );

            if (store.length === 0) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Store not found or unauthorized'
                });
            }

            await pool.query(
                'UPDATE stores SET name = ?, description = ?, address = ?, contact = ? WHERE id = ?',
                [name, description, address, contact, id]
            );

            res.json({
                status: 'success',
                message: 'Store updated successfully'
            });
        } catch (error) {
            console.error('Update store error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error updating store'
            });
        }
    },

    // Delete a store
    deleteStore: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Check if store exists and belongs to user or user is admin
            const [result] = await pool.query(
                `DELETE FROM stores 
                 WHERE id = ? 
                 AND (owner_id = ? OR ? IN (SELECT id FROM users WHERE role = 'admin'))`,
                [id, userId, userId]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Store not found or unauthorized'
                });
            }

            res.json({
                status: 'success',
                message: 'Store deleted successfully'
            });
        } catch (error) {
            console.error('Delete store error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error deleting store'
            });
        }
    },

    // Get all stores with their average ratings
    getAllStores: async (req, res) => {
        try {
            const [stores] = await pool.query(
                `SELECT s.*, 
                        u.name as owner_name,
                        COUNT(r.id) as rating_count,
                        ROUND(AVG(r.rating), 1) as average_rating
                 FROM stores s
                 LEFT JOIN ratings r ON s.id = r.store_id
                 JOIN users u ON s.owner_id = u.id
                 GROUP BY s.id
                 ORDER BY s.created_at DESC`
            );

            res.json({
                status: 'success',
                data: stores
            });
        } catch (error) {
            console.error('Get stores error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error fetching stores'
            });
        }
    },

    // Get store by ID with ratings
    getStoreById: async (req, res) => {
        try {
            const { id } = req.params;

            const [stores] = await pool.query(
                `SELECT s.*, 
                        u.name as owner_name,
                        COUNT(r.id) as rating_count,
                        ROUND(AVG(r.rating), 1) as average_rating
                 FROM stores s
                 LEFT JOIN ratings r ON s.id = r.store_id
                 JOIN users u ON s.owner_id = u.id
                 WHERE s.id = ?
                 GROUP BY s.id`,
                [id]
            );

            if (stores.length === 0) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Store not found'
                });
            }

            res.json({
                status: 'success',
                data: stores[0]
            });
        } catch (error) {
            console.error('Get store error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error fetching store'
            });
        }
    },

    // Get stores by owner
    getStoresByOwner: async (req, res) => {
        try {
            const userId = req.user.id;

            const [stores] = await pool.query(
                `SELECT s.*, 
                        COUNT(r.id) as rating_count,
                        ROUND(AVG(r.rating), 1) as average_rating
                 FROM stores s
                 LEFT JOIN ratings r ON s.id = r.store_id
                 WHERE s.owner_id = ?
                 GROUP BY s.id
                 ORDER BY s.created_at DESC`,
                [userId]
            );

            res.json({
                status: 'success',
                data: stores
            });
        } catch (error) {
            console.error('Get owner stores error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error fetching stores'
            });
        }
    }
};

module.exports = storeController;