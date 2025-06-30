const pool = require('../config/db');

exports.getSalesGrouped = async (req, res) => {
  const { startDate, endDate, region, groupBy } = req.query;
  let groupSQL = "";
  let labelSQL = "";
  switch (groupBy) {
    case "week":
      groupSQL = "EXTRACT(YEAR FROM d.date), EXTRACT(WEEK FROM d.date)";
      labelSQL = "TO_CHAR(d.date, 'IYYY-\"W\"IW')";
      break;
    case "month":
      groupSQL = "EXTRACT(YEAR FROM d.date), EXTRACT(MONTH FROM d.date)";
      labelSQL = "TO_CHAR(d.date, 'YYYY-MM')";
      break;
    case "quarter":
      groupSQL = "EXTRACT(YEAR FROM d.date), EXTRACT(QUARTER FROM d.date)";
      labelSQL = "TO_CHAR(d.date, 'YYYY') || '-Q' || EXTRACT(QUARTER FROM d.date)::TEXT";
      break;
    case "semester":
      groupSQL = "EXTRACT(YEAR FROM d.date), CEIL(EXTRACT(MONTH FROM d.date)/6)";
      labelSQL = "TO_CHAR(d.date, 'YYYY') || '-S' || CEIL(EXTRACT(MONTH FROM d.date)/6)::TEXT";
      break;
    case "year":
      groupSQL = "EXTRACT(YEAR FROM d.date)";
      labelSQL = "TO_CHAR(d.date, 'YYYY')";
      break;
    default:
      groupSQL = "d.date";
      labelSQL = "TO_CHAR(d.date, 'YYYY-MM-DD')";
      break;
  }

  try {
    let query = `
      SELECT ${labelSQL} as label, SUM(f.sales_amount) as sales_amount
      FROM sales_facts f
      JOIN dim_date d ON f.date_id = d.id
      JOIN dim_region r ON f.region_id = r.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (region && region !== "All") {
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

    query += ` GROUP BY ${labelSQL}`;
    query += ` ORDER BY MIN(d.date)`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching grouped sales" });
  }
};

exports.getSales = async (req, res) => {
  const { startDate, endDate, region } = req.query;
  try {
    let query = `
      SELECT d.date, SUM(f.sales_amount) AS sales_amount
      FROM sales_facts f
      JOIN dim_date d ON f.date_id = d.id
      JOIN dim_region r ON f.region_id = r.id
      WHERE d.date BETWEEN $1 AND $2
    `;
    const params = [startDate, endDate];
    if (region && region !== "All") {
      query += " AND r.name = $3";
      params.push(region);
    }
    query += " GROUP BY d.date ORDER BY d.date";
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching sales" });
  }
};
