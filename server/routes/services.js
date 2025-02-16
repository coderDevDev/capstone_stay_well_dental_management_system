import express from 'express';

import config from '../config.js';

let db = config.mySqlDriver;

const router = express.Router();

router.get('/list', async (req, res) => {
  try {
    // Query to fetch all patients with their details
    const [services] = await db.query(`


      SELECT * FROM services

      ORDER BY name DESC


   
    `);

    res.status(200).json({
      success: true,
      data: services
    });
  } catch (err) {
    // Handle errors
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

export default router;
