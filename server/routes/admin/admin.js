import express from 'express';
const router = express.Router();
import config from '../../config.js';

let db = config.mySqlDriver;

// Create a new admin account
router.post('/', async (req, res) => {
  const {
    admin_id,
    name,
    department,
    contact_number,
    email,
    username,
    password
  } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO admin_account (admin_id, name, department, contact_number, email, username, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [admin_id, name, department, contact_number, email, username, password]
    );
    res
      .status(201)
      .json({ success: true, id: result.insertId, admin_id, name });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all admins
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM admin_account');
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get an admin by ID
router.get('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'SELECT * FROM admin_account WHERE admin_id = ?',
      [req.params.id]
    );
    if (result.length === 0)
      return res
        .status(404)
        .json({ success: false, message: 'Admin not found' });
    res.status(200).json({ success: true, data: result[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update an admin account
router.put('/:id', async (req, res) => {
  const { name, department, contact_number, email, username, password } =
    req.body;
  try {
    const [result] = await db.query(
      'UPDATE admin_account SET name = ?, department = ?, contact_number = ?, email = ?, username = ?, password = ? WHERE admin_id = ?',
      [
        name,
        department,
        contact_number,
        email,
        username,
        password,
        req.params.id
      ]
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: 'Admin not found' });
    res.status(200).json({ success: true, message: 'Admin account updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete an admin account
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM admin_account WHERE admin_id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: 'Admin not found' });
    res.status(200).json({ success: true, message: 'Admin account deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
