import express from 'express';

import config from '../config.js';

import {
  authenticateUserMiddleware,
  auditTrailMiddleware
} from '../middleware/authMiddleware.js';

let db = config.mySqlDriver;
import { v4 as uuidv4 } from 'uuid';
const router = express.Router();

import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });
let firebaseStorage = config.firebaseStorage;
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

router.post('/list', authenticateUserMiddleware, async (req, res) => {
  let { user_id } = req.user;

  try {
    const [result] = await db.query(
      `
      SELECT 
        a.*,
        a.appointment_id,
        a.appointment_date,
        a.status,
        a.remarks,
        
        p.first_name AS patient_first_name,
        p.last_name AS patient_last_name,
                p.phone_number AS phone_number,
        d.full_name AS dentist_full_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      JOIN users d ON a.dentist_id = d.user_id
    ORDER BY a.start DESC
      
      `,
      [req.params.id]
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error fetching loan list with borrower details' });
  }
});

router.get('/appointments/:id', async (req, res) => {
  try {
    // SQL Query to get appointment details with related patient and dentist info
    const [result] = await db.query(
      `
      SELECT 
        a.appointment_id,
        a.appointment_date,
        a.status,
        a.remarks,
        p.first_name AS patient_first_name,
        p.last_name AS patient_last_name,
        p.phone_number AS phone_number,
        d.first_name AS dentist_first_name,
        d.last_name AS dentist_last_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      JOIN users d ON a.dentist_id = d.user_id
      WHERE a.appointment_id = ?`,
      [req.params.id]
    );

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/update', async (req, res) => {
  try {
    const data = req.body;

    let { appointment_id, status } = data;

    // Update the appointment status
    const [result] = await db.query(
      'UPDATE appointments SET status = ? WHERE appointment_id = ?',
      [status, appointment_id]
    );

    // Check if the appointment was updated

    res.status(200).json({
      success: true,
      message: 'Appointment status updated successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
