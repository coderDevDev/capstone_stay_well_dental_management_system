// Inventory Queries
export const inventoryQueries = {
  getAllInventory: `
    SELECT * FROM inventory 
    LEFT JOIN suppliers ON inventory.supplier_id = suppliers.id
  `,
  getInventoryById: `
    SELECT * FROM inventory 
    LEFT JOIN suppliers ON inventory.supplier_id = suppliers.id 
    WHERE inventory.id = ?
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
  deleteInventory: `DELETE FROM inventory WHERE id = ?`
};

// Order Queries
export const orderQueries = {
  getAllOrders: `
    SELECT orders.*, inventory.name as item_name, suppliers.name as supplier_name 
    FROM orders 
    LEFT JOIN inventory ON orders.item_id = inventory.id
    LEFT JOIN suppliers ON orders.supplier_id = suppliers.id
  `,
  getOrderById: `
    SELECT orders.*, inventory.name as item_name, suppliers.name as supplier_name 
    FROM orders 
    LEFT JOIN inventory ON orders.item_id = inventory.id
    LEFT JOIN suppliers ON orders.supplier_id = suppliers.id
    WHERE orders.id = ?
  `,
  createOrder: `
    INSERT INTO orders (
      supplier_id, item_id, quantity, order_date, status, notes
    ) VALUES (?, ?, ?, ?, ?, ?)
  `,
  updateOrderStatus: `
    UPDATE orders SET status = ? WHERE id = ?
  `,
  deleteOrder: `DELETE FROM orders WHERE id = ?`
};

// Supplier Queries
export const supplierQueries = {
  getAllSuppliers: `SELECT * FROM suppliers`,
  getSupplierById: `SELECT * FROM suppliers WHERE id = ?`,
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
