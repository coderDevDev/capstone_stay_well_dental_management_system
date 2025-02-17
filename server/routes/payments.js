import express from 'express';
import config from '../config.js';

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
router.post('/', async (req, res) => {
  const {
    appointmentId,
    payment_method,
    transaction_id,
    amount,
    status,
    receipt_url,
    approved_by
  } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO payments (
        appointmentId, payment_method, transaction_id, 
        amount, status, receipt_url, approved_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        appointmentId,
        payment_method,
        transaction_id,
        amount,
        status,
        receipt_url,
        approved_by
      ]
    );

    // Update appointment status
    await db.query('UPDATE appointments SET status_id = ? WHERE id = ?', [
      2,
      appointmentId
    ]);

    // Emit payment event
    global.io.emit('paymentCreated', {
      appointmentId,
      status: 'completed'
    });

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        ...req.body
      }
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

// GET all payments with related data
router.get('/list', async (req, res) => {
  try {
    const [payments] = await db.query(`
      SELECT 
        p.*,
        a.start as appointment_date,
        a.service_fee,
        pat.first_name as patient_first_name,
        pat.last_name as patient_last_name,
        s.name as service_name,
        aps.status_name as appointment_status
      FROM payments p
      INNER JOIN appointments a ON p.appointmentId = a.id
      INNER JOIN patients pat ON a.patient_id = pat.patient_id
      INNER JOIN services s ON a.service_id = s.id
      INNER JOIN appointment_statuses aps ON a.status_id = aps.id
      ORDER BY p.created_at DESC
    `);

    console.log({ payments });

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

export default router;
