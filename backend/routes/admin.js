const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  addProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  // Nuevos controladores para ventas por día:
  getSalesByDate,
  setSalesByDate,
  deleteSalesByDate
} = require('../controllers/adminController');

// CRUD de productos
router.get('/products', auth, getProducts);
router.post('/product', auth, addProduct);
router.put('/product/:id', auth, updateProduct);
router.delete('/product/:id', auth, deleteProduct);

// CRUD de ventas diarias (reporte del día)
router.get('/sales', auth, getSalesByDate);           // GET /api/admin/sales?date=YYYY-MM-DD
router.post('/sales', auth, setSalesByDate);          // POST /api/admin/sales { date, sales: [...] }
router.delete('/sales/:date', auth, deleteSalesByDate); // DELETE /api/admin/sales/2024-06-30

module.exports = router;
