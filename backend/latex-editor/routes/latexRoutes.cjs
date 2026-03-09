const express = require('express');
const router = express.Router();
const latexController = require('../controllers/latexController.cjs');

// POST /api/latex/compile
router.post('/compile', latexController.compile);

module.exports = router;
