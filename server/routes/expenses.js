import express from 'express';
import config from '../config.js';
import { authenticateUserMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
const db = config.mySqlDriver;

// Get all expenses with optional filters
router.get('/', authenticateUserMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    let query = `
      SELECT e.*, b.name as branch_name
      FROM expenses e
      LEFT JOIN dental_branches b ON e.branch_id = b.id
      WHERE 1=1
    `;

    const params = [];

    if (startDate) {
      query += ' AND e.date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND e.date <= ?';
      params.push(endDate);
    }

    if (category) {
      query += ' AND e.category = ?';
      params.push(category);
    }

    query += ' ORDER BY e.date DESC';

    const [expenses] = await db.query(query, params);

    res.json({
      success: true,
      data: expenses
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expenses'
    });
  }
});

// Get expense categories
router.get('/categories', authenticateUserMiddleware, async (req, res) => {
  try {
    const [categories] = await db.query(`
      SELECT DISTINCT category FROM expenses
      ORDER BY category ASC
    `);

    res.json({
      success: true,
      data: categories.map(c => c.category)
    });
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense categories'
    });
  }
});

// Get expense totals
router.get('/totals', authenticateUserMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = `
      SELECT 
        SUM(amount) as total,
        category,
        COUNT(*) as count
      FROM expenses
      WHERE 1=1
    `;

    const params = [];

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    query += ' GROUP BY category';

    const [totals] = await db.query(query, params);
    const [overallTotal] = await db.query(
      `
      SELECT SUM(amount) as grand_total FROM expenses
      WHERE 1=1 ${startDate ? ' AND date >= ?' : ''} ${
        endDate ? ' AND date <= ?' : ''
      }
    `,
      params
    );

    res.json({
      success: true,
      data: {
        categoryTotals: totals,
        grandTotal: overallTotal[0].grand_total || 0
      }
    });
  } catch (error) {
    console.error('Error fetching expense totals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense totals'
    });
  }
});

// Create a new expense
router.post('/', authenticateUserMiddleware, async (req, res) => {
  try {
    const { description, amount, category, date, branch_id, notes } = req.body;

    console.log({ deX: req.user });
    if (!description || !amount || !category || !date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO expenses (description, amount, category, date, branch_id, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        description,
        amount,
        category,
        date,
        branch_id || null,
        notes || null,
        req.user.user_id
      ]
    );

    const [newExpense] = await db.query(
      `
      SELECT e.*, b.name as branch_name
      FROM expenses e
      LEFT JOIN dental_branches b ON e.branch_id = b.id
      WHERE e.id = ?
    `,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: newExpense[0]
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create expense'
    });
  }
});

// Update an expense
router.put('/:id', authenticateUserMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, category, date, branch_id, notes } = req.body;

    if (!description || !amount || !category || !date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    await db.query(
      `
      UPDATE expenses
      SET description = ?, amount = ?, category = ?, date = ?, branch_id = ?, notes = ?, updated_at = NOW()
      WHERE id = ?
    `,
      [
        description,
        amount,
        category,
        date,
        branch_id || null,
        notes || null,
        id
      ]
    );

    const [updatedExpense] = await db.query(
      `
      SELECT e.*, b.name as branch_name
      FROM expenses e
      LEFT JOIN dental_branches b ON e.branch_id = b.id
      WHERE e.id = ?
    `,
      [id]
    );

    if (!updatedExpense[0]) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      data: updatedExpense[0]
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update expense'
    });
  }
});

// Delete an expense
router.delete('/:id', authenticateUserMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [expense] = await db.query('SELECT * FROM expenses WHERE id = ?', [
      id
    ]);

    if (!expense[0]) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    await db.query('DELETE FROM expenses WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete expense'
    });
  }
});

export default router;
