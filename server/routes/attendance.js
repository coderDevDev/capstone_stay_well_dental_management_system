import express from 'express';
import config from '../config.js';

const router = express.Router();
const db = config.mySqlDriver;

const queries = {
  getAllAttendance: `
    SELECT * FROM attendance
  `,
  getAttendanceById: `
    SELECT * FROM attendance WHERE id = ?
  `,
  createAttendance: `
    INSERT INTO attendance (employee_id, date, status)
    VALUES (?, ?, ?)
  `,
  updateAttendance: `
    UPDATE attendance
    SET employee_id=?, date=?, status=?
    WHERE id=?
  `,
  deleteAttendance: `DELETE FROM attendance WHERE id = ?`
};

// Get all attendance records with employee names
router.get('/attendance', async (req, res) => {
  try {
    const [records] = await db.query(
      `SELECT a.*, e.name as employeeName 
       FROM attendance a
       INNER JOIN employees e ON a.employee_id = e.id`
    );
    res.json(records);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

// Get attendance by ID
router.get('/attendance/:id', async (req, res) => {
  try {
    const [records] = await db.query(
      `SELECT a.*, e.name as employeeName 
       FROM attendance a
       INNER JOIN employees e ON a.employee_id = e.id
       WHERE a.id = ?`,
      [req.params.id]
    );

    if (!records[0]) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    res.json(records[0]);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance record' });
  }
});

// Create attendance record
router.post('/attendance', async (req, res) => {
  const { employee_id, date, status } = req.body;

  try {
    // Check if employee exists
    const [employee] = await db.query('SELECT * FROM employees WHERE id = ?', [
      employee_id
    ]);

    if (!employee[0]) {
      return res.status(400).json({ error: 'Employee not found' });
    }

    // Check for duplicate attendance
    const [existing] = await db.query(
      'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
      [employee_id, date]
    );

    if (existing[0]) {
      return res
        .status(400)
        .json({ error: 'Attendance already exists for this date' });
    }

    const [result] = await db.query(
      'INSERT INTO attendance (employee_id, date, status) VALUES (?, ?, ?)',
      [employee_id, date, status]
    );

    const [newRecord] = await db.query(
      `SELECT a.*, e.name as employeeName 
       FROM attendance a
       INNER JOIN employees e ON a.employee_id = e.id
       WHERE a.id = ?`,
      [result.insertId]
    );

    res.status(201).json(newRecord[0]);
  } catch (error) {
    console.error('Error creating attendance:', error);
    res.status(500).json({ error: 'Failed to create attendance record' });
  }
});

// Update attendance record
router.put('/attendance/:id', async (req, res) => {
  const { employee_id, date, status } = req.body;

  try {
    // Check if attendance exists
    const [existing] = await db.query('SELECT * FROM attendance WHERE id = ?', [
      req.params.id
    ]);

    if (!existing[0]) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    // Check for duplicate if date or employee_id changed
    if (date !== existing[0].date || employee_id !== existing[0].employee_id) {
      const [duplicate] = await db.query(
        'SELECT * FROM attendance WHERE employee_id = ? AND date = ? AND id != ?',
        [employee_id, date, req.params.id]
      );

      if (duplicate[0]) {
        return res
          .status(400)
          .json({ error: 'Attendance already exists for this date' });
      }
    }

    await db.query(
      'UPDATE attendance SET employee_id = ?, date = ?, status = ? WHERE id = ?',
      [employee_id, date, status, req.params.id]
    );

    const [updatedRecord] = await db.query(
      `SELECT a.*, e.name as employeeName 
       FROM attendance a
       INNER JOIN employees e ON a.employee_id = e.id
       WHERE a.id = ?`,
      [req.params.id]
    );

    res.json(updatedRecord[0]);
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ error: 'Failed to update attendance record' });
  }
});

// Delete attendance record
router.delete('/attendance/:id', async (req, res) => {
  try {
    await db.query(queries.deleteAttendance, [parseInt(req.params.id)]);
    global.io.emit('attendanceDeleted', parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ error: 'Failed to delete attendance' });
  }
});

export default router;
