const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    console.log('Intento de login:', username, password);

    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }
    const user = result.rows[0];
    if (password !== user.password) {
      return res.status(400).json({ message: 'Contrasena incorrecta' });
    }
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        username: user.username
      }
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '4h' });

    res.json({
      token,
      role: user.role,
      username: user.username
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
