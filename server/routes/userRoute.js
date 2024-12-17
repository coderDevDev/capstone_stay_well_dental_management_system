import express from 'express';

import config from '../config.js';

let db = config.mySqlDriver;

const router = express.Router();

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const [result] = await db.query('SELECT * FROM users WHERE user_id  = ?', [
      req.params.id
    ]);
    if (result.length === 0)
      return res
        .status(404)
        .json({ success: false, message: 'Role not found' });
    res.status(200).json({ success: true, data: result[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create a new role
router.post('/', async (req, res) => {
  const { role_id, role_name } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO user_role (role_id, role_name) VALUES (?, ?)',
      [role_id, role_name]
    );
    res
      .status(201)
      .json({ success: true, id: result.insertId, role_id, role_name });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all roles
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM user_role');
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update a role
router.put('/:id', async (req, res) => {
  const { role_name } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE user_role SET role_name = ? WHERE role_id = ?',
      [role_name, req.params.id]
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: 'Role not found' });
    res.status(200).json({ success: true, message: 'Role updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete a role
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM user_role WHERE role_id = ?', [
      req.params.id
    ]);
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: 'Role not found' });
    res.status(200).json({ success: true, message: 'Role deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
