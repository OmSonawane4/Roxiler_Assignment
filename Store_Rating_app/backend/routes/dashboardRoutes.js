const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

// Admin dashboard route
router.get('/admin', auth('admin'), dashboardController.getAdminDashboard);

// Store owner dashboard route
router.get('/store-owner', auth('store_owner'), dashboardController.getStoreOwnerDashboard);

// User dashboard route
router.get('/user', auth(), dashboardController.getUserDashboard);

module.exports = router;