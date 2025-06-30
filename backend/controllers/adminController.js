const pool = require('../config/db');

// Agregar producto
exports.addProduct = async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query('INSERT INTO dim_product(name) VALUES($1) RETURNING *', [name]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al agregar producto' });
  }
};

// Eliminar producto
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM dim_product WHERE id = $1', [id]);
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
};

// Obtener productos (NECESARIO para tu AdminPanel)
exports.getProducts = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM dim_product');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

// Editar producto (opcional para tu panel, puedes agregarlo)
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    await pool.query('UPDATE dim_product SET name = $1 WHERE id = $2', [name, id]);
    res.json({ message: 'Producto actualizado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
};

// Obtener ventas por día
exports.getSalesByDate = async (req, res) => {
  const { date } = req.query;
  try {
    const result = await pool.query(`
      SELECT f.id, d.date, p.id as product_id, p.name as product, r.id as region_id, r.name as region, f.sales_amount, f.quantity
      FROM sales_facts f
      JOIN dim_date d ON f.date_id = d.id
      JOIN dim_product p ON f.product_id = p.id
      JOIN dim_region r ON f.region_id = r.id
      WHERE d.date = $1
      ORDER BY p.name, r.name
    `, [date]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener ventas del día' });
  }
};

// Guardar o actualizar ventas de un día (elimina las anteriores y agrega nuevas)
exports.setSalesByDate = async (req, res) => {
  const { date, sales } = req.body; // sales: [{product_id, region_id, sales_amount, quantity}]
  try {
    // Obtener id de la fecha
    const dateResult = await pool.query('SELECT id FROM dim_date WHERE date = $1', [date]);
    if (!dateResult.rows.length) return res.status(400).json({ message: 'Fecha inválida' });
    const date_id = dateResult.rows[0].id;
    // Borra ventas anteriores de ese día
    await pool.query('DELETE FROM sales_facts WHERE date_id = $1', [date_id]);
    // Inserta las nuevas ventas
    for (const row of sales) {
      await pool.query(
        'INSERT INTO sales_facts (date_id, product_id, region_id, sales_amount, quantity) VALUES ($1, $2, $3, $4, $5)',
        [date_id, row.product_id, row.region_id, row.sales_amount, row.quantity]
      );
    }
    res.json({ message: 'Ventas actualizadas para el día' });
  } catch (err) {
    res.status(500).json({ message: 'Error al guardar ventas del día' });
  }
};

// Eliminar todas las ventas de un día
exports.deleteSalesByDate = async (req, res) => {
  const { date } = req.params;
  try {
    // Obtener id de la fecha
    const dateResult = await pool.query('SELECT id FROM dim_date WHERE date = $1', [date]);
    if (!dateResult.rows.length) return res.status(400).json({ message: 'Fecha inválida' });
    const date_id = dateResult.rows[0].id;
    await pool.query('DELETE FROM sales_facts WHERE date_id = $1', [date_id]);
    res.json({ message: 'Ventas eliminadas para el día' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar ventas del día' });
  }
};
