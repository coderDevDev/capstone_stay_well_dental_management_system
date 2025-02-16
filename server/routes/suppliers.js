import express from 'express';
import config from '../config.js';

const router = express.Router();
const db = config.mySqlDriver;

const queries = {
  getAllSuppliers: `
    SELECT 
      s.*,
      COUNT(DISTINCT i.id) as inventory_count,
      COUNT(DISTINCT o.id) as order_count
    FROM suppliers s
    LEFT JOIN inventory i ON s.id = i.supplier_id
    LEFT JOIN orders o ON s.id = o.supplier_id
    GROUP BY s.id
  `,
  getSupplierById: `
    SELECT 
      s.*,
      i.id as inventory_id,
      i.name as inventory_name,
      i.quantity as inventory_quantity,
      o.id as order_id,
      o.status as order_status,
      o.quantity as order_quantity
    FROM suppliers s
    LEFT JOIN inventory i ON s.id = i.supplier_id
    LEFT JOIN orders o ON s.id = o.supplier_id
    WHERE s.id = ?
  `,
  createSupplier: `
    INSERT INTO suppliers (name, contact, phone, address) 
    VALUES (?, ?, ?, ?)
  `,
  updateSupplier: `
    UPDATE suppliers 
    SET name=?, contact=?, phone=?, address=? 
    WHERE id=?
  `,
  deleteSupplier: `DELETE FROM suppliers WHERE id = ?`
};

router.get('/suppliers', async (req, res) => {
  try {
    const [suppliers] = await db.query(queries.getAllSuppliers);
    const formattedSuppliers = suppliers.map(supplier => ({
      id: supplier.id,
      name: supplier.name,
      contact: supplier.contact,
      phone: supplier.phone,
      address: supplier.address,
      stats: {
        inventoryCount: parseInt(supplier.inventory_count),
        orderCount: parseInt(supplier.order_count)
      }
    }));
    res.json(formattedSuppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

router.get('/suppliers/:id', async (req, res) => {
  try {
    const [suppliers] = await db.query(queries.getSupplierById, [
      parseInt(req.params.id)
    ]);
    if (!suppliers[0])
      return res.status(404).json({ error: 'Supplier not found' });

    const supplier = suppliers[0];
    const formattedSupplier = {
      id: supplier.id,
      name: supplier.name,
      contact: supplier.contact,
      phone: supplier.phone,
      address: supplier.address,
      stats: {
        inventoryCount: parseInt(supplier.inventory_count),
        orderCount: parseInt(supplier.order_count)
      }
    };
    res.json(formattedSupplier);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
});

router.post('/suppliers', async (req, res) => {
  try {
    const { name, contact, phone, address } = req.body;
    const [result] = await db.query(queries.createSupplier, [
      name,
      contact,
      phone,
      address
    ]);

    const newSupplier = { id: result.insertId, ...req.body };

    // Emit event for real-time updates
    global.io.emit('supplierUpdated');

    res.status(201).json(newSupplier);
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});

router.put('/suppliers/:id', async (req, res) => {
  try {
    const { name, contact, phone, address } = req.body;
    const [updatedSupplier] = await db.query(queries.updateSupplier, [
      name,
      contact,
      phone,
      address,
      parseInt(req.params.id)
    ]);

    // Emit event for real-time updates
    global.io.emit('supplierUpdated');

    res.json({ id: parseInt(req.params.id), ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update supplier' });
  }
});

router.delete('/suppliers/:id', async (req, res) => {
  try {
    await db.query(queries.deleteSupplier, [parseInt(req.params.id)]);

    // Emit event for real-time updates
    global.io.emit('supplierUpdated');

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
});

export default router;
