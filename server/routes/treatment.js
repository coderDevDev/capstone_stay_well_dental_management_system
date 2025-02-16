import express from 'express';
import config from '../config.js';

const router = express.Router();
const db = config.mySqlDriver;

const queries = {
  getAllOrders: `
    SELECT 
      o.*,
      i.name as item_name,
      i.category as item_category,
      i.batch_number,
      s.name as supplier_name,
      s.contact as supplier_contact,
      s.phone as supplier_phone
    FROM orders o
    INNER JOIN inventory i ON o.item_id = i.id
    INNER JOIN suppliers s ON o.supplier_id = s.id
  `,
  getOrderById: `
    SELECT 
      o.*,
      i.name as item_name,
      i.category as item_category,
      i.batch_number,
      s.name as supplier_name,
      s.contact as supplier_contact,
      s.phone as supplier_phone
    FROM orders o
    INNER JOIN inventory i ON o.item_id = i.id
    INNER JOIN suppliers s ON o.supplier_id = s.id
    WHERE o.id = ?
  `,
  createOrder: `
    INSERT INTO orders (
      supplier_id, item_id, quantity, order_date, status, notes
    ) VALUES (?, ?, ?, ?, ?, ?)
  `,
  updateOrderStatus: `
    UPDATE orders SET status = ? WHERE id = ?
  `,
  deleteOrder: `DELETE FROM orders WHERE id = ?`,
  updateInventoryQuantity: `
    UPDATE inventory 
    SET quantity = quantity + ? 
    WHERE id = ?
  `,
  getOrderStatus: `
    SELECT status FROM orders WHERE id = ?
  `,
  insertStatusHistory: `
    INSERT INTO order_status_history 
    (order_id, previous_status, new_status, inventory_updated) 
    VALUES (?, ?, ?, ?)
  `,
  getLastStatusChange: `
    SELECT * FROM order_status_history 
    WHERE order_id = ? 
    ORDER BY created_at DESC 
    LIMIT 1
  `
};

router.get('/orders', async (req, res) => {
  try {
    const [orders] = await db.query(queries.getAllOrders);
    const formattedOrders = orders.map(order => ({
      id: order.id,
      supplierId: order.supplier_id,
      itemId: order.item_id,
      quantity: order.quantity,
      date: order.order_date,
      status: order.status,
      notes: order.notes,
      item: {
        name: order.item_name,
        category: order.item_category,
        batchNumber: order.batch_number
      },
      supplier: {
        name: order.supplier_name,
        contact: order.supplier_contact,
        phone: order.supplier_phone
      }
    }));
    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const [orders] = await db.query(queries.getOrderById, [
      parseInt(req.params.id)
    ]);
    if (!orders[0]) return res.status(404).json({ error: 'Order not found' });

    const order = orders[0];
    const formattedOrder = {
      id: order.id,
      supplierId: order.supplier_id,
      itemId: order.item_id,
      quantity: order.quantity,
      date: order.order_date,
      status: order.status,
      notes: order.notes,
      item: {
        name: order.item_name,
        category: order.item_category,
        batchNumber: order.batch_number
      },
      supplier: {
        name: order.supplier_name,
        contact: order.supplier_contact,
        phone: order.supplier_phone
      }
    };
    res.json(formattedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

router.post('/orders', async (req, res) => {
  try {
    const { supplierId, itemId, quantity, date, notes } = req.body;
    const [result] = await db.query(queries.createOrder, [
      supplierId,
      itemId,
      quantity,
      date,
      'Pending',
      notes
    ]);

    const newOrder = { id: result.insertId, ...req.body, status: 'Pending' };

    // Emit events for real-time updates
    global.io.emit('orderStatusUpdated', newOrder);
    global.io.emit('inventoryUpdated');

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = parseInt(req.params.id);

    // Get current order details
    const [orderDetails] = await db.query(
      'SELECT quantity, item_id, status as previous_status FROM orders WHERE id = ?',
      [orderId]
    );

    if (!orderDetails[0]) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { quantity, item_id, previous_status } = orderDetails[0];

    // Start a transaction
    await db.query('START TRANSACTION');

    try {
      // Update order status
      await db.query(queries.updateOrderStatus, [status, orderId]);

      // Only update inventory when status changes to Delivered
      if (status === 'Delivered' && previous_status !== 'Delivered') {
        await db.query(queries.updateInventoryQuantity, [quantity, item_id]);
      }

      // Record the status change
      await db.query(queries.insertStatusHistory, [
        orderId,
        previous_status,
        status,
        status === 'Delivered'
      ]);

      // Commit the transaction
      await db.query('COMMIT');

      // Get the updated order with all details
      const [orders] = await db.query(queries.getOrderById, [orderId]);
      const order = orders[0];

      // Format and return the response
      const formattedOrder = {
        id: order.id,
        supplierId: order.supplier_id,
        itemId: order.item_id,
        quantity: order.quantity,
        date: order.order_date,
        status: order.status,
        notes: order.notes,
        item: {
          name: order.item_name,
          category: order.item_category,
          batchNumber: order.batch_number
        },
        supplier: {
          name: order.supplier_name,
          contact: order.supplier_contact,
          phone: order.supplier_phone
        }
      };

      // Emit websocket event for real-time updates
      global.io.emit('orderStatusUpdated', formattedOrder);
      global.io.emit('inventoryUpdated'); // Trigger inventory refresh

      res.json(formattedOrder);
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

router.delete('/orders/:id', async (req, res) => {
  try {
    await db.query(queries.deleteOrder, [parseInt(req.params.id)]);

    // Emit events for real-time updates
    global.io.emit('orderStatusUpdated');
    global.io.emit('inventoryUpdated');

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Add this route to get treatment by appointment ID
router.get(
  '/appointment/:appointmentId',
  authenticateUserMiddleware,
  async (req, res) => {
    try {
      const { appointmentId } = req.params;

      console.log({ appointmentId });
      const [treatment] = await db.query(
        `
      SELECT 
        t.*,
        e.first_name as dentist_first_name,
        e.last_name as dentist_last_name
      FROM treatments t
      LEFT JOIN employees e ON t.dentist_id = e.employee_id
      WHERE t.appointment_id = ?
    `,
        [appointmentId]
      );

      if (!treatment || treatment.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Treatment not found'
        });
      }

      const treatmentData = {
        ...treatment[0],
        dentist_name: `${treatment[0].dentist_first_name} ${treatment[0].dentist_last_name}`
      };

      res.status(200).json({
        success: true,
        data: treatmentData
      });
    } catch (error) {
      console.error('Error fetching treatment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch treatment'
      });
    }
  }
);

export default router;
