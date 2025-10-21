const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const userController = {
    // Register a new user
    register: async (req, res) => {
        try {
            const { name, email, password, address, role } = req.body;

            // Check if email already exists
            const [existingUsers] = await pool.query(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            if (existingUsers.length > 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Email already registered'
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert user
            const [result] = await pool.query(
                'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
                [name, email, hashedPassword, address, role || 'user']
            );

            // Generate token
            const token = jwt.sign(
                { id: result.insertId, role: role || 'user' },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({
                status: 'success',
                data: {
                    id: result.insertId,
                    name,
                    email,
                    role: role || 'user',
                    token
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error registering user'
            });
        }
    },

    // Login user
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Get user
            const [users] = await pool.query(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            if (users.length === 0) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid email or password'
                });
            }

            const user = users[0];

            // Check password
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid email or password'
                });
            }

            // Generate token
            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                status: 'success',
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error logging in'
            });
        }
    },

    // Update user profile
    updateProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const { name, address, currentPassword, newPassword } = req.body;

            // If changing password, verify current password
            if (currentPassword && newPassword) {
                const [user] = await pool.query(
                    'SELECT password FROM users WHERE id = ?',
                    [userId]
                );

                const validPassword = await bcrypt.compare(currentPassword, user[0].password);
                if (!validPassword) {
                    return res.status(401).json({
                        status: 'error',
                        message: 'Current password is incorrect'
                    });
                }
            }

            // Update user
            if (name || address) {
                const updates = [];
                const values = [];

                if (name) {
                    updates.push('name = ?');
                    values.push(name);
                }
                if (address) {
                    updates.push('address = ?');
                    values.push(address);
                }
                if (newPassword) {
                    updates.push('password = ?');
                    values.push(await bcrypt.hash(newPassword, 10));
                }

                values.push(userId);

                await pool.query(
                    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
                    values
                );
            }

            res.json({
                status: 'success',
                message: 'Profile updated successfully'
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error updating profile'
            });
        }
    },

    // Get user profile
    getProfile: async (req, res) => {
        try {
            const [user] = await pool.query(
                'SELECT id, name, email, address, role FROM users WHERE id = ?',
                [req.user.id]
            );

            if (user.length === 0) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }

            res.json({
                status: 'success',
                data: user[0]
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error fetching profile'
            });
        }
    }
};

module.exports = userController;