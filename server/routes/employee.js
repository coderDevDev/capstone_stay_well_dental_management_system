import express from 'express';
import config from '../config.js';

const router = express.Router();
const db = config.mySqlDriver;

const queries = {
  getAllEmployees: `
    SELECT e.*, u.email, u.role_id, r.role_name
    FROM employees e
    INNER JOIN users u ON e.user_id = u.user_id
    INNER JOIN roles r ON u.role_id = r.role_id
  `,
  getEmployeeById: `
    SELECT e.*, u.email, u.role_id, r.role_name
    FROM employees e
    INNER JOIN users u ON e.user_id = u.user_id
    INNER JOIN roles r ON u.role_id = r.role_id
    WHERE e.id = ?
  `,
  createEmployee: `
    INSERT INTO employees (
      name, position, salary, salary_basis, 
      working_hours, category, sss_contribution,
      pagibig_contribution, philhealth_contribution,
      withholding_tax
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  updateEmployee: `
    UPDATE employees 
    SET name=?, position=?, salary=?, 
        salary_basis=?, working_hours=?, category=?,
        sss_contribution=?, pagibig_contribution=?,
        philhealth_contribution=?, withholding_tax=?
    WHERE id=?
  `,
  deleteEmployee: `DELETE FROM employees WHERE id = ?`
};

// Get all employees with branch info
router.get('/', async (req, res) => {
  try {
    const [employees] = await db.query(`
      SELECT 
        e.*,
        u.email,
        u.role_id,
        r.role_name,
        b.name as branch_name,
        b.id as branch_id
      FROM employees e
      INNER JOIN users u ON e.user_id = u.user_id
      INNER JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN dental_branches b ON e.branch_id = b.id
      ORDER BY e.created_at DESC
    `);

    res.status(200).json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const [employees] = await db.query(queries.getEmployeeById, [
      parseInt(req.params.id)
    ]);

    if (!employees[0]) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const emp = employees[0];
    const formattedEmployee = {
      id: emp.id,
      name: emp.name,
      email: emp.email,
      role_id: emp.role_id,
      role_name: emp.role_name,
      position: emp.position,
      salary: emp.salary,
      salaryBasis: emp.salary_basis,
      workingHours: emp.working_hours,
      category: emp.category,
      sssContribution: emp.sss_contribution,
      pagibigContribution: emp.pagibig_contribution,
      philhealthContribution: emp.philhealth_contribution,
      withholdingTax: emp.withholding_tax
    };
    res.json(formattedEmployee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Create employee
router.post('/create', async (req, res) => {
  const {
    name,
    email,
    roleId,
    salary,
    salaryBasis,
    workingHours,
    category,
    sssContribution,
    pagibigContribution,
    philhealthContribution,
    withholdingTax,
    branch_id // Added branch_id
  } = req.body;

  try {
    // Start transaction
    await db.query('START TRANSACTION');

    // Validate if branch exists and is active
    if (branch_id) {
      const [branch] = await db.query(
        'SELECT * FROM dental_branches WHERE id = ? AND status = "Active"',
        [branch_id]
      );

      if (!branch[0]) {
        await db.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Selected branch is not available'
        });
      }
    }

    // Check if email already exists
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      await db.query('ROLLBACK');
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Create user account
    const [userResult] = await db.query(
      'INSERT INTO users (email, password, role_id) VALUES (?, ?, ?)',
      [email, 'defaultpassword', roleId]
    );

    // Create employee record with branch_id
    const [employeeResult] = await db.query(
      `INSERT INTO employees (
        user_id, name, salary, salary_basis, working_hours,
        category, sss_contribution, pagibig_contribution,
        philhealth_contribution, withholding_tax, branch_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userResult.insertId,
        name,
        salary,
        salaryBasis,
        workingHours,
        category,
        sssContribution,
        pagibigContribution,
        philhealthContribution,
        withholdingTax,
        branch_id
      ]
    );

    await db.query('COMMIT');

    // Get the created employee with all related info
    const [newEmployee] = await db.query(
      `SELECT 
        e.*,
        u.email,
        u.role_id,
        r.role_name,
        b.name as branch_name
      FROM employees e
      INNER JOIN users u ON e.user_id = u.user_id
      INNER JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN dental_branches b ON e.branch_id = b.id
      WHERE e.id = ?`,
      [employeeResult.insertId]
    );

    res.status(201).json({
      success: true,
      data: newEmployee[0]
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    roleId,
    salary,
    salaryBasis,
    workingHours,
    category,
    sssContribution,
    pagibigContribution,
    philhealthContribution,
    withholdingTax,
    branch_id // Added branch_id
  } = req.body;

  try {
    await db.query('START TRANSACTION');

    // Validate branch if provided
    if (branch_id) {
      const [branch] = await db.query(
        'SELECT * FROM dental_branches WHERE id = ? AND status = "Active"',
        [branch_id]
      );

      if (!branch[0]) {
        await db.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Selected branch is not available'
        });
      }
    }

    // Update employee record with branch_id
    await db.query(
      `UPDATE employees 
       SET name = ?, salary = ?, salary_basis = ?, 
           working_hours = ?, category = ?, 
           sss_contribution = ?, pagibig_contribution = ?,
           philhealth_contribution = ?, withholding_tax = ?,
           branch_id = ?
       WHERE id = ?`,
      [
        name,
        salary,
        salaryBasis,
        workingHours,
        category,
        sssContribution,
        pagibigContribution,
        philhealthContribution,
        withholdingTax,
        branch_id,
        id
      ]
    );

    // Update user email and role if provided
    const [employee] = await db.query(
      'SELECT user_id FROM employees WHERE id = ?',
      [id]
    );

    if (email || roleId) {
      await db.query(
        'UPDATE users SET email = COALESCE(?, email), role_id = COALESCE(?, role_id) WHERE user_id = ?',
        [email, roleId, employee[0].user_id]
      );
    }

    await db.query('COMMIT');

    // Get updated employee with all related info
    const [updatedEmployee] = await db.query(
      `SELECT 
        e.*,
        u.email,
        u.role_id,
        r.role_name,
        b.name as branch_name
      FROM employees e
      INNER JOIN users u ON e.user_id = u.user_id
      INNER JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN dental_branches b ON e.branch_id = b.id
      WHERE e.id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: updatedEmployee[0]
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    await db.query(queries.deleteEmployee, [parseInt(req.params.id)]);

    // Emit event for real-time updates
    global.io.emit('employeeDeleted', parseInt(req.params.id));

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

router.get('/dentists/all', async (req, res) => {
  try {
    const [dentists] = await db.query(`
      SELECT 
        e.id as id,
        e.name as full_name
      FROM employees e
      INNER JOIN users u ON e.user_id = u.user_id
      INNER JOIN roles r ON u.role_id = r.role_id
      WHERE r.role_name = 'dentist'
    `);

    res.json({
      success: true,
      data: dentists.map(dentist => ({
        id: dentist.id.toString(),
        full_name: dentist.full_name
      }))
    });
  } catch (error) {
    console.error('Error fetching dentists:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dentists'
    });
  }
});

// Update employee salary rate
router.put('/:id/rate', async (req, res) => {
  const { id } = req.params;
  const { rate_per_hour, working_hours } = req.body;

  try {
    // Get the employee
    const [employee] = await db.query(`SELECT * FROM employees WHERE id = ?`, [
      id
    ]);

    if (!employee[0]) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Calculate new salary based on rate and hours
    let newSalary;
    if (employee[0].salary_basis === 'Hourly') {
      newSalary = rate_per_hour;
    } else {
      // For monthly salary, calculate based on 4 weeks
      newSalary = rate_per_hour * working_hours * 4;
    }

    // Update employee rate
    await db.query(
      `UPDATE employees 
       SET salary = ?,
           working_hours = ?,
           rate_per_hour = ?
       WHERE id = ?`,
      [newSalary, working_hours, rate_per_hour, id]
    );

    // Emit socket event for real-time updates
    global.io.emit('employeeUpdated');

    res.json({
      success: true,
      message: 'Salary rate updated successfully',
      data: {
        id,
        salary: newSalary,
        rate_per_hour,
        working_hours
      }
    });
  } catch (error) {
    console.error('Error updating salary rate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update salary rate'
    });
  }
});

export default router;
