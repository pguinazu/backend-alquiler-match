const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/property.controller');
const authMiddleware = require('../middlewares/auth.middleware'); // Your JWT middleware
// const restrictTo = require('../middleware/restrictTo');

// Route to add a new property
router.post(
    '/',
    authMiddleware,
    propertyController.addProperty
);

module.exports = router;