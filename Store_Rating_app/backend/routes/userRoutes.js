const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validation');
const { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } = require('../validations/userValidation');

// Public routes
router.post('/register', validate(registerSchema), userController.register);
router.post('/login', validate(loginSchema), userController.login);

// Protected routes
router.get('/profile', auth(), userController.getProfile);
router.put('/profile', auth(), validate(updateProfileSchema), userController.updateProfile);
router.put('/change-password', auth(), validate(changePasswordSchema), userController.changePassword);

// Admin only routes
router.get('/users', auth('admin'), userController.getAllUsers);
router.delete('/users/:id', auth('admin'), userController.deleteUser);

module.exports = router;