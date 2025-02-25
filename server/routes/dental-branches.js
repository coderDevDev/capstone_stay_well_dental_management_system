import express from 'express';
import config from '../config.js';

const router = express.Router();
const db = config.mySqlDriver;

const queries = {
  getAllBranches: `
    SELECT * FROM dental_branches
  `,
  getBranchById: `
    SELECT * FROM dental_branches WHERE id = ?
  `,
  createBranch: `
    INSERT INTO dental_branches (
      name, address, contact_number, manager, 
      operating_hours, status
    ) VALUES (?, ?, ?, ?, ?, ?)
  `,
  updateBranch: `
    UPDATE dental_branches 
    SET name=?, address=?, contact_number=?, 
        manager=?, operating_hours=?, status=?
    WHERE id=?
  `,
  deleteBranch: `
    DELETE FROM dental_branches WHERE id = ?
  `
};

// Get all branches
router.get('/branches', async (req, res) => {
  try {
    const [branches] = await db.query(queries.getAllBranches);
    res.json({
      success: true,
      data: branches
    });
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch branches'
    });
  }
});

// Get branch by ID
router.get('/branches/:id', async (req, res) => {
  try {
    const [branches] = await db.query(queries.getBranchById, [req.params.id]);

    if (!branches[0]) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    res.json({
      success: true,
      data: branches[0]
    });
  } catch (error) {
    console.error('Error fetching branch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch branch'
    });
  }
});

// Create new branch
router.post('/branches', async (req, res) => {
  const { name, address, contact_number, manager, operating_hours, status } =
    req.body;

  try {
    const [result] = await db.query(queries.createBranch, [
      name,
      address,
      contact_number,
      manager,
      operating_hours,
      status
    ]);

    const newBranch = {
      id: result.insertId,
      name,
      address,
      contact_number: contact_number,
      manager,
      operating_hours: operating_hours,
      status
    };

    // Emit event for real-time updates
    global.io.emit('branchUpdated', newBranch);

    res.status(201).json({
      success: true,
      data: newBranch
    });
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create branch'
    });
  }
});

// Update branch
router.put('/branches/:id', async (req, res) => {
  const { name, address, contact_number, manager, operating_hours, status } =
    req.body;

  try {
    const [result] = await db.query(queries.updateBranch, [
      name,
      address,
      contact_number,
      manager,
      operating_hours,
      status,
      req.params.id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    const updatedBranch = {
      id: req.params.id,
      name,
      address,
      contact_number: contact_number,
      manager,
      operating_hours: operating_hours,
      status
    };

    // Emit event for real-time updates
    global.io.emit('branchUpdated', updatedBranch);

    res.json({
      success: true,
      data: updatedBranch
    });
  } catch (error) {
    console.error('Error updating branch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update branch'
    });
  }
});

// Delete branch
router.delete('/branches/:id', async (req, res) => {
  try {
    const [result] = await db.query(queries.deleteBranch, [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    // Emit event for real-time updates
    global.io.emit('branchDeleted', req.params.id);

    res.json({
      success: true,
      message: 'Branch deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting branch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete branch'
    });
  }
});

export default router;
