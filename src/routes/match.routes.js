const express = require('express');
const router = express.Router();
const matchController = require('../controllers/match.controller');

router.get('/tenant/:tenantId', matchController.getTenantMatches);
router.post('/run', matchController.matchPropertys);

module.exports = router;