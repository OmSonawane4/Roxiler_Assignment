const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validation');
const { createStoreSchema, updateStoreSchema } = require('../validations/storeValidation');

// Public routes
router.get('/', storeController.getAllStores);
router.get('/:id', storeController.getStoreById);

// Protected routes (store owners and admins)
router.post('/', auth('store_owner', 'admin'), validate(createStoreSchema), storeController.createStore);
router.put('/:id', auth('store_owner', 'admin'), validate(updateStoreSchema), storeController.updateStore);
router.delete('/:id', auth('store_owner', 'admin'), storeController.deleteStore);

// Store owner routes
router.get('/owner/stores', auth('store_owner'), storeController.getStoresByOwner);

module.exports = router;