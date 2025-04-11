import express from 'express';
import config from '../config.js';
import { authenticateUserMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
const db = config.mySqlDriver;

// Get all payroll records
router.get('/', authenticateUserMiddleware, async (req, res) => {
  try {
    const [payrolls] = await db.query(`
      SELECT p.*, e.name as employee_name
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      ORDER BY p.created_at DESC
    `);

    res.json(payrolls);
  } catch (error) {
    console.error('Error fetching payroll records:', error);
    res.status(500).json({ error: 'Failed to fetch payroll records' });
  }
});

// Get payroll by employee ID
router.get('/employee/:id', authenticateUserMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [payrolls] = await db.query(
      `
      SELECT p.*, e.name as employee_name
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      WHERE p.employee_id = ?
      ORDER BY p.created_at DESC
    `,
      [id]
    );

    res.json(payrolls);
  } catch (error) {
    console.error('Error fetching employee payroll records:', error);
    res.status(500).json({ error: 'Failed to fetch employee payroll records' });
  }
});

// Generate payroll record
router.post('/', authenticateUserMiddleware, async (req, res) => {
  const {
    employee_id,
    pay_period_start,
    pay_period_end,
    basic_salary,
    rate_per_hour,
    hours_worked,
    overtime_hours,
    overtime_pay,
    allowances,
    deductions,
    sss_contribution,
    philhealth_contribution,
    pagibig_contribution,
    tax,
    net_pay,
    status
  } = req.body;

  // Validate required fields
  const requiredFields = [
    'employee_id',
    'pay_period_start',
    'pay_period_end',
    'basic_salary',
    'rate_per_hour',
    'hours_worked',
    'deductions',
    'sss_contribution',
    'philhealth_contribution',
    'pagibig_contribution',
    'tax',
    'net_pay'
  ];

  const missingFields = requiredFields.filter(
    field => req.body[field] === null || req.body[field] === undefined
  );

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: `Missing required fields: ${missingFields.join(', ')}`
    });
  }

  try {
    // Get the employee name for the record
    const [employee] = await db.query(
      `SELECT name, role_name FROM employees e 
       JOIN users u ON e.user_id = u.user_id
       JOIN roles r ON u.role_id = r.role_id
       WHERE e.id = ?`,
      [employee_id]
    );

    if (!employee[0]) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Get the current user as the creator
    const created_by = req.user?.id || '1'; // Default to admin ID if not available

    // Create the payroll record
    const [result] = await db.query(
      `INSERT INTO payroll (
        employee_id, pay_period_start, pay_period_end,
        basic_salary, rate_per_hour, hours_worked,
        overtime_hours, overtime_pay, allowances,
        deductions, sss_contribution, philhealth_contribution,
        pagibig_contribution, tax, net_pay,
        status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employee_id,
        pay_period_start,
        pay_period_end,
        basic_salary,
        rate_per_hour,
        hours_worked,
        overtime_hours || 0,
        overtime_pay || 0,
        allowances || 0,
        deductions,
        sss_contribution,
        philhealth_contribution,
        pagibig_contribution,
        tax,
        net_pay,
        status || 'Pending',
        created_by
      ]
    );

    const [payroll] = await db.query(
      `SELECT p.*, e.name as employee_name, r.role_name
       FROM payroll p
       JOIN employees e ON p.employee_id = e.id
       JOIN users u ON e.user_id = u.user_id
       JOIN roles r ON u.role_id = r.role_id
       WHERE p.id = ?`,
      [result.insertId]
    );

    res.json(payroll[0]);
  } catch (error) {
    console.error('Error creating payroll record:', error);
    res.status(500).json({ error: 'Failed to create payroll record' });
  }
});

// Update payroll status (e.g., mark as paid)
router.put('/:id/status', authenticateUserMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Update status
    await db.query(
      `
      UPDATE payroll SET status = ? WHERE id = ?
    `,
      [status, id]
    );

    // Get updated record
    const [updated] = await db.query(
      `
      SELECT p.*, e.name as employee_name
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      WHERE p.id = ?
    `,
      [id]
    );

    if (!updated[0]) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }

    // Emit socket event for real-time updates
    global.io.emit('payrollUpdated');

    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating payroll status:', error);
    res.status(500).json({ error: 'Failed to update payroll status' });
  }
});

// Update employee salary rate
router.put(
  '/employees/:id/rate',
  authenticateUserMiddleware,
  async (req, res) => {
    const { id } = req.params;
    const { rate_per_hour, working_hours } = req.body;

    try {
      // Get the employee
      const [employee] = await db.query(
        `
      SELECT * FROM employees WHERE id = ?
    `,
        [id]
      );

      if (!employee[0]) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      // Calculate new salary based on rate and hours
      let newSalary;
      if (employee[0].salary_basis === 'Hourly') {
        newSalary = rate_per_hour;
      } else {
        // For monthly salary, calculate based on 4 weeks
        newSalary = rate_per_hour * working_hours * 4;
      }

      // Update employee
      await db.query(
        `
      UPDATE employees 
      SET salary = ?, 
          working_hours = ?
      WHERE id = ?
    `,
        [newSalary, working_hours, id]
      );

      // Emit socket event for real-time updates
      global.io.emit('employeeUpdated');

      res.json({
        success: true,
        message: 'Salary rate updated successfully'
      });
    } catch (error) {
      console.error('Error updating salary rate:', error);
      res.status(500).json({ error: 'Failed to update salary rate' });
    }
  }
);

// Calculate payroll for preview
router.post('/calculate', authenticateUserMiddleware, async (req, res) => {
  try {
    const { employee_id, pay_period_start, pay_period_end } = req.body;

    // Get employee details
    const [employee] = await db.query(
      `
      SELECT e.*, r.name as role_name
      FROM employees e
      LEFT JOIN roles r ON e.role_id = r.id
      WHERE e.id = ?
    `,
      [employee_id]
    );

    if (!employee[0]) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Get attendance records for the period
    const [attendanceRecords] = await db.query(
      `
      SELECT * FROM attendance
      WHERE employee_id = ? 
      AND date BETWEEN ? AND ?
    `,
      [employee_id, pay_period_start, pay_period_end]
    );

    // Count working days
    const presentDays = attendanceRecords.filter(
      rec => rec.status === 'Present'
    ).length;

    const lateDays = attendanceRecords.filter(
      rec => rec.status === 'Late'
    ).length;

    const halfDays = attendanceRecords.filter(
      rec => rec.status === 'Half Day'
    ).length;

    // Calculate total hours worked
    const workingHoursPerDay = employee[0].working_hours / 5; // Assuming 5-day work week
    const hoursWorked =
      presentDays * workingHoursPerDay +
      lateDays * workingHoursPerDay * 0.9 + // 10% deduction for late
      halfDays * workingHoursPerDay * 0.5; // 50% for half days

    // Calculate salary
    const ratePerHour =
      employee[0].salary_basis === 'Hourly'
        ? employee[0].salary
        : employee[0].salary / (employee[0].working_hours * 4); // Monthly to hourly conversion

    const basicSalary =
      employee[0].salary_basis === 'Monthly'
        ? employee[0].salary
        : ratePerHour * hoursWorked;

    // Calculate deductions (simplified versions)
    const sssContribution = Math.min(basicSalary * 0.045, 900);
    const philhealthContribution = Math.min(basicSalary * 0.03, 900);
    const pagibigContribution = Math.min(basicSalary * 0.02, 100);

    // Tax calculation
    const taxableIncome =
      basicSalary -
      (sssContribution + philhealthContribution + pagibigContribution);
    let tax = 0;

    if (taxableIncome <= 20833) {
      tax = 0;
    } else if (taxableIncome <= 33332) {
      tax = (taxableIncome - 20833) * 0.15;
    } else if (taxableIncome <= 66666) {
      tax = 1875 + (taxableIncome - 33332) * 0.2;
    } else if (taxableIncome <= 166666) {
      tax = 8541.8 + (taxableIncome - 66666) * 0.25;
    } else if (taxableIncome <= 666666) {
      tax = 33541.8 + (taxableIncome - 166666) * 0.3;
    } else {
      tax = 183541.8 + (taxableIncome - 666666) * 0.35;
    }

    const totalDeductions =
      sssContribution + philhealthContribution + pagibigContribution + tax;
    const netPay = basicSalary - totalDeductions;

    res.json({
      employee: {
        id: employee[0].id,
        name: employee[0].name,
        position: employee[0].role_name
      },
      payPeriod: {
        start: pay_period_start,
        end: pay_period_end
      },
      attendance: {
        presentDays,
        lateDays,
        halfDays,
        absentDays: 0, // Would need to calculate based on expected work days
        totalDays: presentDays + lateDays + halfDays
      },
      earnings: {
        basicSalary,
        ratePerHour,
        hoursWorked,
        overtimeHours: 0, // Not calculated in this example
        overtimePay: 0,
        allowances: 0
      },
      deductions: {
        sssContribution,
        philhealthContribution,
        pagibigContribution,
        tax,
        totalDeductions
      },
      netPay
    });
  } catch (error) {
    console.error('Error calculating payroll:', error);
    res.status(500).json({ error: 'Failed to calculate payroll' });
  }
});

// Get payslip
router.get('/:id/payslip', authenticateUserMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Get payroll record with employee details
    const [payroll] = await db.query(
      `
      SELECT p.*, e.name as employee_name, r.name as role_name
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      LEFT JOIN roles r ON e.role_id = r.id
      WHERE p.id = ?
    `,
      [id]
    );

    if (!payroll[0]) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }

    // Get attendance for the period
    const [attendance] = await db.query(
      `
      SELECT * FROM attendance
      WHERE employee_id = ?
      AND date BETWEEN ? AND ?
    `,
      [
        payroll[0].employee_id,
        payroll[0].pay_period_start,
        payroll[0].pay_period_end
      ]
    );

    // Format payslip data
    const payslipData = {
      payrollId: payroll[0].id,
      employeeId: payroll[0].employee_id,
      employeeName: payroll[0].employee_name,
      position: payroll[0].role_name,
      payPeriod: {
        start: payroll[0].pay_period_start,
        end: payroll[0].pay_period_end
      },
      earnings: {
        basicSalary: payroll[0].basic_salary,
        ratePerHour: payroll[0].rate_per_hour,
        hoursWorked: parseFloat(payroll[0].hours_worked),
        overtimeHours: payroll[0].overtime_hours,
        overtimePay: payroll[0].overtime_pay,
        allowances: payroll[0].allowances,
        grossPay:
          payroll[0].basic_salary +
          payroll[0].overtime_pay +
          payroll[0].allowances
      },
      deductions: {
        sssContribution: payroll[0].sss_contribution,
        philhealthContribution: payroll[0].philhealth_contribution,
        pagibigContribution: payroll[0].pagibig_contribution,
        tax: payroll[0].tax,
        totalDeductions: payroll[0].deductions
      },
      netPay: payroll[0].net_pay,
      status: payroll[0].status,
      attendance: {
        presentDays: attendance.filter(a => a.status === 'Present').length,
        lateDays: attendance.filter(a => a.status === 'Late').length,
        halfDays: attendance.filter(a => a.status === 'Half Day').length,
        absentDays: attendance.filter(a => a.status === 'Absent').length,
        leaveDays: attendance.filter(a => a.status === 'Leave').length
      },
      createdAt: payroll[0].created_at
    };

    res.json(payslipData);
  } catch (error) {
    console.error('Error fetching payslip:', error);
    res.status(500).json({ error: 'Failed to fetch payslip' });
  }
});

export default router;
