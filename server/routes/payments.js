import express from 'express';
import config from '../config.js';
import { authenticateUserMiddleware } from './../middleware/authMiddleware.js';
const router = express.Router();
const db = config.mySqlDriver;

const queries = {
  getAllInventory: `
    SELECT 
      i.*,
      s.name as supplier_name,
      s.contact as supplier_contact,
      s.phone as supplier_phone
    FROM inventory i
    INNER JOIN suppliers s ON i.supplier_id = s.id
  `,
  getInventoryById: `
    SELECT 
      i.*,
      s.name as supplier_name,
      s.contact as supplier_contact,
      s.phone as supplier_phone
    FROM inventory i
    INNER JOIN suppliers s ON i.supplier_id = s.id
    WHERE i.id = ?
  `,
  createInventory: `
    INSERT INTO inventory (
      name, category, quantity, supplier_id, min_quantity, 
      batch_number, location, expiration_date, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  updateInventory: `
    UPDATE inventory 
    SET name=?, category=?, quantity=?, supplier_id=?, 
        min_quantity=?, batch_number=?, location=?, 
        expiration_date=?, notes=?
    WHERE id=?
  `,
  deleteInventory: `DELETE FROM inventory WHERE id = ?`,
  recordInventoryHistory: `
    INSERT INTO inventory_history (
      inventory_id, 
      quantity, 
      previous_quantity, 
      change_type, 
      notes
    ) VALUES (?, ?, ?, ?, ?)
  `,
  getDailyInventoryLevels: `
    SELECT 
      i.name,
      i.category,
      ih.quantity,
      ih.previous_quantity,
      ih.change_type,
      ih.notes,
      ih.recorded_at,
      i.min_quantity
    FROM inventory_history ih
    JOIN inventory i ON ih.inventory_id = i.id
    WHERE ih.recorded_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    ORDER BY ih.recorded_at DESC
  `
};

router.get('/payments', async (req, res) => {
  try {
    const [inventory] = await db.query(queries.getAllInventory);
    const formattedInventory = inventory.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      minQuantity: item.min_quantity,
      supplierId: item.supplier_id,
      batchNumber: item.batch_number,
      location: item.location,
      expirationDate: item.expiration_date,
      notes: item.notes,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      supplier_name: item.supplier_name,
      supplier_contact: item.supplier_contact,
      supplier_phone: item.supplier_phone
    }));
    res.json(formattedInventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Create payment
router.post('/create', async (req, res) => {
  const {
    appointmentId,
    payment_method,
    transaction_id,
    amount,
    status,
    branch_id,
    receipt_url,
    approved_by
  } = req.body;

  try {
    // Validate if appointment exists and get branch info
    const [appointment] = await db.query(
      `SELECT a.*, b.id as branch_id, b.name as branch_name 
       FROM appointments a 
       LEFT JOIN dental_branches b ON a.branch_id = b.id 
       WHERE a.id = ?`,
      [appointmentId]
    );

    if (!appointment[0]) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Use branch_id from request or from appointment
    const finalBranchId = branch_id || appointment[0].branch_id;

    // Create payment record
    const [result] = await db.query(
      `INSERT INTO payments (
        appointmentId, 
        payment_method, 
        transaction_id, 
        amount, 
        status,
        branch_id,
        receipt_url,
        approved_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        appointmentId,
        payment_method,
        transaction_id,
        amount,
        status,
        finalBranchId,
        receipt_url,
        approved_by
      ]
    );

    await db.query('UPDATE appointments SET status_id = ? WHERE id = ?', [
      2,
      appointmentId
    ]);

    // Emit payment event
    global.io.emit('paymentCreated', {
      appointmentId,
      status: 'completed'
    });

    // Get the created payment with related data
    const [newPayment] = await db.query(
      `SELECT 
        p.*,
        a.start as appointment_date,
        pat.first_name as patient_first_name,
        pat.last_name as patient_last_name,
        s.name as service_name,
        aps.status_name as appointment_status,
        b.name as branch_name
      FROM payments p
      INNER JOIN appointments a ON p.appointmentId  = a.id
      INNER JOIN patients pat ON a.patient_id = pat.patient_id
      INNER JOIN services s ON a.service_id = s.id
      INNER JOIN appointment_statuses aps ON a.status_id = aps.id
      LEFT JOIN dental_branches b ON p.branch_id = b.id
      WHERE p.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: newPayment[0]
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment'
    });
  }
});

// Get payment by appointment ID
router.get('/appointment/:id', async (req, res) => {
  try {
    const [payments] = await db.query(
      'SELECT * FROM payments WHERE appointmentId = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment'
    });
  }
});

// Update the GET /list endpoint to handle both appointment-based and manual cash payments
router.get('/list', authenticateUserMiddleware, async (req, res) => {
  try {
    const { role, user_id, patient_id, branch_id } = req.query;

    let query = `
      SELECT 
        p.*,
        COALESCE(pat.first_name, p.patient_first_name) as patient_first_name,
        COALESCE(pat.last_name, p.patient_last_name) as patient_last_name,
        COALESCE(s.name, p.service_name) as service_name,
        COALESCE(aps.status_name, 'Completed') as appointment_status,
        COALESCE(b.name, 'Main Branch') as branch_name
      FROM payments p
      LEFT JOIN appointments a ON p.appointmentId = a.id
      LEFT JOIN patients pat ON a.patient_id = pat.patient_id
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN appointment_statuses aps ON a.status_id = aps.id
      LEFT JOIN dental_branches b ON p.branch_id = b.id
    `;

    let params = [];
    let conditions = [];

    // Apply branch filter
    if (branch_id) {
      conditions.push(`p.branch_id = ?`);
      params.push(branch_id);
    }

    // Apply role-based filtering
    if (role === 'patient') {
      conditions.push(`(a.patient_id = ? OR p.patient_id = ?)`);
      params.push(patient_id, patient_id);
    }

    // Append conditions to query
    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY p.created_at DESC`;
    console.log({ query, params });

    const [payments] = await db.query(query, params);

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments'
    });
  }
});

// Update payment
router.put('/:id', async (req, res) => {
  const { payment_method, transaction_id, amount, status, branch_id } =
    req.body;

  try {
    // Update payment record
    const [result] = await db.query(
      `UPDATE payments 
       SET payment_method = ?,
           transaction_id = ?,
           amount = ?,
           status = ?,
           branch_id = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [payment_method, transaction_id, amount, status, branch_id, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Get updated payment with related data
    const [updatedPayment] = await db.query(
      `SELECT 
        p.*,
        a.start as appointment_date,
        pat.first_name as patient_first_name,
        pat.last_name as patient_last_name,
        s.name as service_name,
        aps.status_name as appointment_status,
        b.name as branch_name
      FROM payments p
      INNER JOIN appointments a ON p.appointment_id = a.id
      INNER JOIN patients pat ON a.patient_id = pat.patient_id
      INNER JOIN services s ON a.service_id = s.id
      INNER JOIN appointment_statuses aps ON a.status_id = aps.id
      LEFT JOIN dental_branches b ON p.branch_id = b.id
      WHERE p.id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: updatedPayment[0]
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment'
    });
  }
});

// Add endpoint for manual cash payments
router.post('/manual', authenticateUserMiddleware, async (req, res) => {
  try {
    const {
      patient_id,
      patient_first_name,
      patient_last_name,
      service_name,
      amount,
      payment_method,
      status,
      transaction_id,
      notes,
      payment_date
    } = req.body;

    // Validate required fields
    if (!amount || !payment_method) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Insert the payment record
    const [result] = await db.query(
      `INSERT INTO payments (
        patient_id, 
        patient_first_name,
        patient_last_name,
        service_name,
        amount, 
        payment_method, 
        status, 
        transaction_id,
        notes,
        payment_date,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patient_id || 'manual',
        patient_first_name || '',
        patient_last_name || '',
        service_name || 'Cash Payment',
        amount,
        payment_method,
        status || 'completed',
        transaction_id || `CASH-${Date.now()}`,
        notes || '',
        payment_date || new Date().toISOString().split('T')[0],
        req.user?.id || null
      ]
    );

    // Get the inserted payment
    const [payment] = await db.query('SELECT * FROM payments WHERE id = ?', [
      result.insertId
    ]);

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: payment[0]
    });
  } catch (error) {
    console.error('Error recording manual payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record payment'
    });
  }
});

export default router;
