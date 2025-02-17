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

// Get all services
router.get('/list', async (req, res) => {
  try {
    const [services] = await db.query(
      'SELECT * FROM services ORDER BY created_at DESC'
    );
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services'
    });
  }
});

// Create service
router.post('/create', async (req, res) => {
  try {
    const { name, price, unit } = req.body;
    const [result] = await db.query(
      'INSERT INTO services (name, price, unit) VALUES (?, ?, ?)',
      [name, price, unit]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        name,
        price,
        unit
      }
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service'
    });
  }
});

// Update service
router.put('/:id', async (req, res) => {
  try {
    const { name, price, unit } = req.body;
    await db.query(
      'UPDATE services SET name = ?, price = ?, unit = ? WHERE id = ?',
      [name, price, unit, req.params.id]
    );

    res.json({
      success: true,
      data: {
        id: req.params.id,
        name,
        price,
        unit
      }
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service'
    });
  }
});

// Delete service
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM services WHERE id = ?', [req.params.id]);
    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service'
    });
  }
});

export default router;
