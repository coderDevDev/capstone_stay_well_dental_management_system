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

router.get('/inventory', async (req, res) => {
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

router.get('/inventory/:id', async (req, res) => {
  try {
    const [items] = await db.query(queries.getInventoryById, [
      parseInt(req.params.id)
    ]);
    if (!items[0]) return res.status(404).json({ error: 'Item not found' });

    const item = items[0];
    const formattedItem = {
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
    };
    res.json(formattedItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

router.post('/inventory', async (req, res) => {
  try {
    const {
      name,
      category,
      quantity,
      supplierId,
      minQuantity,
      batchNumber,
      location,
      expirationDate,
      notes
    } = req.body;

    const [result] = await db.query(queries.createInventory, [
      name,
      category,
      quantity,
      supplierId,
      minQuantity,
      batchNumber,
      location,
      expirationDate,
      notes
    ]);

    const newItem = { id: result.insertId, ...req.body };

    // Emit event for real-time updates
    global.io.emit('inventoryUpdated');

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
});

router.put('/inventory/:id', async (req, res) => {
  try {
    await db.query('START TRANSACTION');

    // Get current quantity before update
    const [currentItem] = await db.query(
      'SELECT quantity FROM inventory WHERE id = ?',
      [parseInt(req.params.id)]
    );

    const previousQuantity = currentItem[0]?.quantity || 0;

    // Update inventory
    await db.query(queries.updateInventory, [
      req.body.name,
      req.body.category,
      req.body.quantity,
      req.body.supplierId,
      req.body.minQuantity,
      req.body.batchNumber,
      req.body.location,
      req.body.expirationDate,
      req.body.notes,
      parseInt(req.params.id)
    ]);

    // Record the inventory change with more details
    await db.query(queries.recordInventoryHistory, [
      parseInt(req.params.id),
      req.body.quantity,
      previousQuantity,
      'update',
      `Manual update: ${previousQuantity} → ${req.body.quantity}`
    ]);

    await db.query('COMMIT');

    // Emit events
    global.io.emit('inventoryUpdated');

    res.json({ id: parseInt(req.params.id), ...req.body });
  } catch (error) {
    console.error('Error updating inventory:', error);
    await db.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to update item' });
  }
});

router.delete('/inventory/:id', async (req, res) => {
  try {
    await db.query(queries.deleteInventory, [parseInt(req.params.id)]);

    // Emit event for real-time updates
    global.io.emit('inventoryUpdated');

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

router.get('/inventory/history', async (req, res) => {
  try {
    const [history] = await db.query(queries.getDailyInventoryLevels);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory history' });
  }
});

// Add a route to get inventory history for a specific item
router.get('/inventory/:id/history', async (req, res) => {
  try {
    const [history] = await db.query(
      `
      SELECT 
        ih.*,
        i.name,
        i.category
      FROM inventory_history ih
      JOIN inventory i ON ih.inventory_id = i.id
      WHERE ih.inventory_id = ?
      ORDER BY ih.recorded_at DESC
      LIMIT 100
    `,
      [parseInt(req.params.id)]
    );

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory history' });
  }
});

router.put('/inventory/update-quantities/updateEachItem', async (req, res) => {
  const { medications } = req.body;

  try {
    await db.query('START TRANSACTION');

    for (const med of medications) {
      const [currentItem] = await db.query(
        'SELECT quantity FROM inventory WHERE id = ?',
        [med.id]
      );
      if (!currentItem[0]) {
        throw new Error(`Inventory item with ID ${med.id} not found`);
      }

      const newQuantity = currentItem[0].quantity - med.quantity;
      if (newQuantity < 0) {
        throw new Error(`Insufficient stock for item ID ${med.id}`);
      }

      await db.query('UPDATE inventory SET quantity = ? WHERE id = ?', [
        newQuantity,
        med.id
      ]);

      // Record the inventory change
      await db.query(queries.recordInventoryHistory, [
        med.id,
        newQuantity,
        currentItem[0].quantity,
        'prescription',
        `Prescribed ${med.quantity} units`
      ]);
    }

    await db.query('COMMIT');
    res.status(200).json({ message: 'Inventory updated successfully' });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error updating inventory quantities:', error);
    res.status(500).json({ error: 'Failed to update inventory quantities' });
  }
});

// Add this new endpoint for recording item usage
router.post('/inventory/use', async (req, res) => {
  const { itemId, quantity, notes } = req.body;

  if (!itemId || !quantity || quantity <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid item ID or quantity'
    });
  }

  try {
    await db.query('START TRANSACTION');

    // Get current quantity
    const [currentItem] = await db.query(
      'SELECT quantity, name FROM inventory WHERE id = ?',
      [itemId]
    );

    if (!currentItem[0]) {
      await db.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    const previousQuantity = currentItem[0].quantity;
    const newQuantity = previousQuantity - quantity;

    // Check if we have enough in stock
    if (newQuantity < 0) {
      await db.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Insufficient quantity in stock'
      });
    }

    // Update the inventory
    await db.query('UPDATE inventory SET quantity = ? WHERE id = ?', [
      newQuantity,
      itemId
    ]);

    // Record the inventory usage with detailed change type
    await db.query(queries.recordInventoryHistory, [
      itemId,
      newQuantity,
      previousQuantity,
      'adjustment',
      notes || `Used ${quantity} units`
    ]);

    await db.query('COMMIT');

    // Emit event for real-time updates
    global.io.emit('inventoryUpdated');

    res.status(200).json({
      success: true,
      message: `Successfully used ${quantity} units of ${currentItem[0].name}`,
      data: {
        id: itemId,
        name: currentItem[0].name,
        previousQuantity,
        newQuantity,
        quantityUsed: quantity
      }
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error recording inventory usage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record inventory usage'
    });
  }
});

export default router;
