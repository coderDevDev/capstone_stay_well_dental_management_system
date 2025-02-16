const express = require('express');
const router = express.Router();
const db = require('../db');

// Create a new employee
router.post('/', async (req, res) => {
  const { employeeName, email, roleId } = req.body;

  try {
    // Check if email already exists
    const emailCheck = await db.query('SELECT * FROM users WHERE email = $1', [
      email
    ]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Insert into users table
    const userResult = await db.query(
      'INSERT INTO users (email, password, role_id) VALUES ($1, $2, $3) RETURNING user_id',
      [email, 'defaultpassword', roleId]
    );

    const userId = userResult.rows[0].user_id;

    // Insert into employees table
    await db.query('INSERT INTO employees (user_id, name) VALUES ($1, $2)', [
      userId,
      employeeName
    ]);

    res.status(201).json({ message: 'Employee created successfully' });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

module.exports = router;
