const express = require('express');
const router = express.Router();
const matchController = require('../controllers/match.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get(
    '/tenant/:tenantId',
    authMiddleware,
    matchController.getTenantMatches
);
router.post(
    '/run',
    authMiddleware,
    matchController.matchPropertys
);

module.exports = router;