const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validation');
const { submitRatingSchema, updateRatingSchema } = require('../validations/ratingValidation');

// Enhanced rating routes with advanced features
router.post('/store/:storeId', auth(), validate(submitRatingSchema), ratingController.submitRating);
router.put('/:id', auth(), validate(updateRatingSchema), ratingController.updateRating);
router.delete('/:id', auth(), ratingController.deleteRating);

// Advanced rating retrieval with filtering and statistics
router.get('/store/:storeId/stats', ratingController.getRatingStats);
router.get('/store/:storeId', ratingController.getStoreRatings);
router.get('/user/ratings', auth(), ratingController.getUserRatings);

// Social features
router.post('/:id/helpful', auth(), ratingController.markRatingHelpful);

module.exports = router;