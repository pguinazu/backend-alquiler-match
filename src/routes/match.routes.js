const express = require('express');
const router = express.Router();
const matchController = require('../controllers/match.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get(
    '/tenant',
    authMiddleware,
    matchController.findMatchesForTenant
);
router.post(
    '/landlord',
    authMiddleware,
    matchController.findMatchesForLandlord
);

module.exports = router;