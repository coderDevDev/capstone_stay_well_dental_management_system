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
        start, 
        end, 
        status_id, 
        service_fee,
        number_of_teeth
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        patientId,
        serviceId,
        startDateTime,
        endDateTime,
        status_id,
        serviceFee,
        numberOfTeeth
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: { appointment_id: result.insertId }
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
  const { status, start, end, patientId, serviceId, date, numberOfTeeth } =
    req.body;

  console.log('Dex');
  // Define the Philippine Timezone
  const timeZone = 'Asia/Manila';

  // Format the date from frontend
  const dateStr = format(new Date(date), 'yyyy-MM-dd');

  // Combine date with time strings
  const startPHT = `${dateStr} ${start}`;
  const endPHT = `${dateStr} ${end}`;

  try {
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

    // Update the appointment
    const [result] = await db.query(
      `UPDATE appointments SET status_id = ?, start = ?, end = ?, service_id = ?, number_of_teeth = ? WHERE id = ?`,
      [status_id, startPHT, endPHT, serviceId, numberOfTeeth, appointment_id]
    );

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully'
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Error updating appointment' });
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
  const { user_id, role } = req.user; // Assuming authenticated user info

  let patient_id = req.user.patient_id;

  try {
    const query = `
SELECT
    a.*,
    p.first_name AS patient_first_name,
    p.last_name AS patient_last_name,
    s.name AS service_name,
    aps.status_name AS appointment_status
FROM appointments a
INNER JOIN appointment_statuses aps ON aps.id = a.status_id
INNER JOIN patients p ON a.patient_id = p.patient_id
INNER JOIN services s ON a.service_id = s.id



    ${role === 'patient' ? `WHERE a.patient_id = ${patient_id}` : ''}

    
    `;

    console.log(query);

    const [appointments] = await db.query(query);

    const transformedAppointments = appointments.map(appointment => {
      return {
        id: appointment.id,
        patientId: appointment.patient_id,
        serviceId: appointment.service_id,
        date: format(new Date(appointment.start), 'yyyy-MM-dd'),
        start: new Date(appointment.start),
        end: new Date(appointment.end),
        status: appointment.appointment_status,
        ...appointment
      };
    });

    res.status(200).json({
      success: true,
      data: transformedAppointments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching all appointments' });
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
