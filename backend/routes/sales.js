const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getSales, getSalesGrouped } = require('../controllers/salesController');
router.get('/', auth, getSales);
router.get('/grouped', auth, getSalesGrouped);


module.exports = router;
