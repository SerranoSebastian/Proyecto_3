const pool = require('../config/db');

exports.salesByProduct = async (req, res) => {
  const { startDate, endDate, region } = req.query;
  try {
    let query = `
      SELECT p.name as product, SUM(f.sales_amount) as total_sales
      FROM sales_facts f
      JOIN dim_product p ON f.product_id = p.id
      JOIN dim_date d ON f.date_id = d.id
      JOIN dim_region r ON f.region_id = r.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (region && region !== 'All') {
      query += ` AND r.name = $${idx++}`;
      params.push(region);
    }
    if (startDate) {
      query += ` AND d.date >= $${idx++}`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND d.date <= $${idx++}`;
      params.push(endDate);
    }

    query += ' GROUP BY p.name ORDER BY total_sales DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sales by product' });
  }
};

exports.salesByRegion = async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    let query = `
      SELECT r.name as region, SUM(f.sales_amount) as total_sales
      FROM sales_facts f
      JOIN dim_region r ON f.region_id = r.id
      JOIN dim_date d ON f.date_id = d.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (startDate) {
      query += ` AND d.date >= $${idx++}`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND d.date <= $${idx++}`;
      params.push(endDate);
    }

    query += ' GROUP BY r.name ORDER BY total_sales DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sales by region' });
  }
};

exports.kpis = async (req, res) => {
  const { startDate, endDate, region } = req.query;
  try {
    let query = `
      SELECT SUM(f.sales_amount) as total, AVG(f.sales_amount) as avg, MAX(f.sales_amount) as max, MIN(f.sales_amount) as min
      FROM sales_facts f
      JOIN dim_date d ON f.date_id = d.id
      JOIN dim_region r ON f.region_id = r.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (region && region !== 'All') {
      query += ` AND r.name = $${idx++}`;
      params.push(region);
    }
    if (startDate) {
      query += ` AND d.date >= $${idx++}`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND d.date <= $${idx++}`;
      params.push(endDate);
    }

    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching KPIs' });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM dim_product ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products" });
  }
};
