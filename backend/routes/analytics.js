const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { salesByProduct, salesByRegion, kpis, getProducts } = require('../controllers/analyticsController');

router.get('/by-product', auth, salesByProduct);
router.get('/by-region', auth, salesByRegion);
router.get('/kpis', auth, kpis);
router.get('/products', auth, getProducts);

module.exports = router;
