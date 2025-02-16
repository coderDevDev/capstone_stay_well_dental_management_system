import express from 'express';
import config from '../config.js'; // Adjust the path as needed

const router = express.Router();
const db = config.mySqlDriver;

// Get all roles
router.get('/roles', async (req, res) => {
  try {
    console.log('Dex');
    const [roles] = await db.query('SELECT * FROM roles');
    res.status(201).json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

export default router;
