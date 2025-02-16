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

// Get all employees
router.get('/', async (req, res) => {
  try {
    const [employees] = await db.query(queries.getAllEmployees);
    const formattedEmployees = employees.map(emp => ({
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
    }));
    res.json(formattedEmployees);
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

// Create a new employee
router.post('/create', async (req, res) => {
  const {
    name,
    position,
    salary,
    salaryBasis,
    workingHours,
    category,
    sssContribution,
    pagibigContribution,
    philhealthContribution,
    withholdingTax,
    email,
    roleId
  } = req.body;

  try {
    // Check if email already exists
    const emailCheck = await db.query('SELECT * FROM users WHERE email = ?', [
      email
    ]);
    if (emailCheck[0].length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // First create the user
    const [userResult] = await db.query(
      'INSERT INTO users (email, password, role_id) VALUES (?, ?, ?)',
      [email, 'defaultpassword', roleId]
    );

    // Then create the employee with the user_id
    const [employeeResult] = await db.query(
      `INSERT INTO employees (
        user_id, name, position, salary, salary_basis, 
        working_hours, category, sss_contribution,
        pagibig_contribution, philhealth_contribution,
        withholding_tax
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userResult.insertId,
        name,
        position, // This will be the role_name
        salary,
        salaryBasis,
        workingHours,
        category,
        sssContribution,
        pagibigContribution,
        philhealthContribution,
        withholdingTax
      ]
    );

    res.status(201).json({
      message: 'Employee created successfully',
      employeeId: employeeResult.insertId
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      position,
      salary,
      salaryBasis,
      workingHours,
      category,
      sssContribution,
      pagibigContribution,
      philhealthContribution,
      withholdingTax,
      email,
      roleId
    } = req.body;

    // First check if the email exists for any other user
    const [emailCheck] = await db.query(
      'SELECT u.user_id FROM users u INNER JOIN employees e ON u.user_id = e.user_id WHERE u.email = ? AND e.id != ?',
      [email, parseInt(req.params.id)]
    );

    if (emailCheck.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Get the user_id for this employee
    const [employeeData] = await db.query(
      'SELECT user_id FROM employees WHERE id = ?',
      [parseInt(req.params.id)]
    );

    if (!employeeData[0]) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Start a transaction
    await db.query('START TRANSACTION');

    try {
      // Update user email and role
      await db.query(
        'UPDATE users SET email = ?, role_id = ? WHERE user_id = ?',
        [email, roleId, employeeData[0].user_id]
      );

      // Update employee details
      await db.query(
        `UPDATE employees 
         SET name = ?, position = ?, salary = ?, 
             salary_basis = ?, working_hours = ?, category = ?,
             sss_contribution = ?, pagibig_contribution = ?,
             philhealth_contribution = ?, withholding_tax = ?
         WHERE id = ?`,
        [
          name,
          position,
          salary,
          salaryBasis,
          workingHours,
          category,
          sssContribution,
          pagibigContribution,
          philhealthContribution,
          withholdingTax,
          parseInt(req.params.id)
        ]
      );

      await db.query('COMMIT');

      const updatedEmployee = {
        id: parseInt(req.params.id),
        ...req.body
      };

      global.io.emit('employeeUpdated', updatedEmployee);
      res.json(updatedEmployee);
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
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

export default router;
