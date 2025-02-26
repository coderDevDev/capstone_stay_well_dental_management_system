import express from 'express';

import config from '../config.js';
import { format, isSunday, setHours, setMinutes } from 'date-fns';
import { formatInTimeZone, format as dateFNSFormat } from 'date-fns-tz';
import { parseISO } from 'date-fns';

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

// CREATE
router.post('/create', async (req, res) => {
  const {
    status,
    patientId,
    serviceId,
    branch_id,
    start,
    end,
    serviceFee,
    date,
    numberOfTeeth
  } = req.body;

  try {
    // Format the date from frontend
    const dateStr = format(new Date(date), 'yyyy-MM-dd');

    // Combine date with time strings
    const startDateTime = `${dateStr} ${start}`;
    const endDateTime = `${dateStr} ${end}`;

    // Validate branch if provided
    if (branch_id) {
      const [branch] = await db.query(
        'SELECT * FROM dental_branches WHERE id = ? AND status = "Active"',
        [branch_id]
      );

      if (!branch[0]) {
        return res.status(400).json({
          success: false,
          message: 'Selected branch is not available'
        });
      }
    }

    // Get status ID
    const [statusResult] = await db.query(
      `SELECT id from appointment_statuses WHERE status_name = ?`,
      [status]
    );
    const status_id = statusResult[0].id;

    const [result] = await db.query(
      `
      INSERT INTO appointments (
        patient_id, 
        service_id,
        branch_id, 
        start, 
        end, 
        status_id, 
        service_fee,
        number_of_teeth
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        patientId,
        serviceId,
        branch_id,
        startDateTime,
        endDateTime,
        status_id,
        serviceFee,
        numberOfTeeth
      ]
    );

    // Get the created appointment with branch info
    const [newAppointment] = await db.query(
      `SELECT 
        a.*,
        s.name as service_name,
        p.first_name,
        p.last_name,
        aps.status_name as status,
        db.name as branch_name
      FROM appointments a
      INNER JOIN services s ON a.service_id = s.id
      INNER JOIN patients p ON a.patient_id = p.patient_id
      INNER JOIN appointment_statuses aps ON a.status_id = aps.id
      LEFT JOIN dental_branches db ON a.branch_id = db.id
      WHERE a.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: {
        appointment_id: result.insertId,
        ...newAppointment[0]
      }
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating appointment',
      error: error.message
    });
  }
});

// READ

router.get('/', authenticateUserMiddleware, async (req, res) => {
  const { user_id, role } = req.user; // Extract user ID and role from authenticated user

  try {
    let query = `
      SELECT a.*, p.first_name AS patient_first_name, p.last_name AS patient_last_name, 
             s.name AS service_name, r.role_name 
      FROM appointments a
      INNER JOIN patients p ON a.patient_id = p.id
      INNER JOIN services s ON a.service_id = s.id
      INNER JOIN roles r ON p.role_id = r.id
      WHERE 1=1
    `;
    let params = [];

    // Adjust query based on user role
    if (role === 'patient') {
      query += ` AND a.patient_id = ?`; // Patient can only see their own appointments
      params.push(user_id);
    } else if (role === 'dentist') {
      // Dentists can view appointments where their service is being provided
      query += ` AND s.dentist_id = ?`; // Assuming dentist_id is stored in the services table
      params.push(user_id);
    } else if (role === 'secretary' || role === 'admin') {
      // Admins and secretaries can view all appointments
      // No filtering on the user ID
    }

    const [appointments] = await db.query(query, params);

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching appointments' });
  }
});

//UPDATE

router.put('/:appointment_id', authenticateUserMiddleware, async (req, res) => {
  const { user_id, role } = req.user;
  const { appointment_id } = req.params;
  const {
    status,
    start,
    end,
    patientId,
    serviceId,
    date,
    numberOfTeeth,
    branch_id // Added branch_id
  } = req.body;

  // Define the Philippine Timezone
  const timeZone = 'Asia/Manila';

  // Format the date from frontend
  const dateStr = format(new Date(date), 'yyyy-MM-dd');

  // Combine date with time strings
  const startPHT = `${dateStr} ${start}`;
  const endPHT = `${dateStr} ${end}`;

  try {
    // Validate branch if provided
    if (branch_id) {
      const [branch] = await db.query(
        'SELECT * FROM dental_branches WHERE id = ? AND status = "Active"',
        [branch_id]
      );

      if (!branch[0]) {
        return res.status(400).json({
          success: false,
          message: 'Selected branch is not available'
        });
      }
    }

    // Check for conflicting appointments
    const [conflicts] = await db.query(
      `SELECT * FROM appointments 
       WHERE id != ? AND patient_id = ? AND (
         (start < ? AND end > ?) OR
         (start < ? AND end > ?) OR
         (start >= ? AND end <= ?)
       )`,
      [
        appointment_id,
        patientId,
        endPHT,
        startPHT,
        startPHT,
        endPHT,
        startPHT,
        endPHT
      ]
    );

    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          'The updated appointment time conflicts with an existing appointment.'
      });
    }

    // Get status ID
    const [statusResult] = await db.query(
      `SELECT id from appointment_statuses WHERE status_name = ?`,
      [status]
    );
    const status_id = statusResult[0].id;

    // Update the appointment with branch_id
    const [result] = await db.query(
      `UPDATE appointments 
       SET status_id = ?, 
           start = ?, 
           end = ?, 
           service_id = ?, 
           number_of_teeth = ?,
           branch_id = ?
       WHERE id = ?`,
      [
        status_id,
        startPHT,
        endPHT,
        serviceId,
        numberOfTeeth,
        branch_id,
        appointment_id
      ]
    );

    // Get the updated appointment with branch info
    const [updatedAppointment] = await db.query(
      `SELECT 
        a.*,
        s.name as service_name,
        p.first_name,
        p.last_name,
        aps.status_name as status,
        db.name as branch_name
      FROM appointments a
      INNER JOIN services s ON a.service_id = s.id
      INNER JOIN patients p ON a.patient_id = p.patient_id
      INNER JOIN appointment_statuses aps ON a.status_id = aps.id
      LEFT JOIN dental_branches db ON a.branch_id = db.id
      WHERE a.id = ?`,
      [appointment_id]
    );

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: updatedAppointment[0]
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating appointment',
      error: error.message
    });
  }
});

// DELETE

router.delete(
  '/:appointment_id',
  authenticateUserMiddleware,
  async (req, res) => {
    const { user_id, role } = req.user;
    const { appointment_id } = req.params;

    console.log({ appointment_id });

    try {
      // Fetch the existing appointment
      const [appointment] = await db.query(
        `SELECT * FROM appointments WHERE id = ?`,
        [appointment_id]
      );

      if (appointment.length === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      console.log({ appointment });

      // Delete the appointment
      const [result] = await db.query(`DELETE FROM appointments WHERE id = ?`, [
        appointment_id
      ]);

      res.status(200).json({
        success: true,
        message: 'Appointment deleted successfully'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error deleting appointment' });
    }
  }
);

router.get('/list', authenticateUserMiddleware, async (req, res) => {
  const { branchId } = req.query;
  const { user_id, role, patient_id } = req.user; // Assuming authenticated user info

  try {
    const conditions = [];
    const params = [];

    if (branchId) {
      conditions.push('a.branch_id = ?');
      params.push(branchId);
    }

    if (patient_id) {
      conditions.push('a.patient_id = ?');
      params.push(patient_id);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const query = `
      SELECT a.*, s.name as service_name, p.first_name, 
      p.last_name ,
      aps.status_name as status,
      b.name as branch_name
      FROM appointments a
      INNER JOIN services s ON a.service_id = s.id
      INNER JOIN patients p ON a.patient_id = p.patient_id
      INNER JOIN appointment_statuses aps ON a.status_id = aps.id
      LEFT JOIN dental_branches b ON a.branch_id = b.id
      ${whereClause}
      ORDER BY a.start DESC
    `;

    const [appointments] = await db.query(query, params);

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments'
    });
  }
});

// Add this route to get appointments by patient ID
router.get(
  '/patient/:patientId',
  authenticateUserMiddleware,
  async (req, res) => {
    try {
      const { patientId } = req.params;

      const query = `
      SELECT 
        a.*,
        s.name AS service_name,
        aps.status_name AS status
      FROM appointments a
      INNER JOIN services s ON a.service_id = s.id
      INNER JOIN appointment_statuses aps ON a.status_id = aps.id
      WHERE a.patient_id = ?
      ORDER BY a.start DESC
    `;

      const [appointments] = await db.query(query, [patientId]);

      res.status(200).json({
        success: true,
        data: appointments
      });
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch appointments'
      });
    }
  }
);

export default router;
