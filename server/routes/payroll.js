import express from 'express';
import config from '../config.js';

const router = express.Router();
const db = config.mySqlDriver;

// Calculate payroll
router.post('/calculate', async (req, res) => {
  const { employeeId, startDate, endDate } = req.body;

  try {
    // Get employees
    let employees;
    if (employeeId) {
      const [result] = await db.query(
        `SELECT e.*, u.email, u.role_id, r.role_name
         FROM employees e
         INNER JOIN users u ON e.user_id = u.user_id
         INNER JOIN roles r ON u.role_id = r.role_id
         WHERE e.id = ?`,
        [employeeId]
      );
      employees = result;
    } else {
      const [result] = await db.query(
        `SELECT e.*, u.email, u.role_id, r.role_name
         FROM employees e
         INNER JOIN users u ON e.user_id = u.user_id
         INNER JOIN roles r ON u.role_id = r.role_id`
      );
      employees = result;
    }

    // Calculate payroll for each employee
    const payrollCalculations = await Promise.all(
      employees.map(async employee => {
        console.log({ employee });
        // Get attendance records for the period
        const [attendance] = await db.query(
          `SELECT * FROM attendance 
           WHERE employee_id = ? 
           AND date BETWEEN ? AND ?`,
          [employee.id, startDate, endDate]
        );

        // Calculate work days and half days
        const workDays = attendance.filter(
          record => record.status === 'Present' || record.status === 'Late'
        ).length;
        const halfDays = attendance.filter(
          record => record.status === 'Half Day'
        ).length;

        console.log({ startDate, endDate, attendance, workDays, halfDays });

        if (workDays === 0) {
          return {
            employee: {
              id: employee.id,
              name: employee.name,
              position: employee.position,
              email: employee.email,
              role_id: employee.role_id,
              role_name: employee.role_name,
              salaryBasis: employee.salary_basis,
              category: employee.category
            },
            workDays: 0,
            halfDays: 0,
            grossPay: '0.00',
            sssDeduction: '0.00',
            pagibigDeduction: '0.00',
            philhealthDeduction: '0.00',
            withholdingTax: '0.00',
            totalDeductions: '0.00',
            netPay: '0.00'
          };
        }

        // Calculate gross pay based on salary basis
        let grossPay = 0;
        switch (employee.salary_basis) {
          case 'daily':
            grossPay =
              employee.salary * workDays + employee.salary * 0.5 * halfDays;
            break;
          case 'weekly':
            const weeks = Math.ceil(
              (new Date(endDate) - new Date(startDate)) /
                (7 * 24 * 60 * 60 * 1000)
            );
            grossPay = employee.salary * weeks;
            break;
          case 'monthly':
            const months = Math.ceil(
              (new Date(endDate) - new Date(startDate)) /
                (30 * 24 * 60 * 60 * 1000)
            );
            grossPay = employee.salary * months;
            break;
        }

        // Get deductions from employee record
        const sssDeduction = Number(employee.sss_contribution).toFixed(2);
        const pagibigDeduction = Number(employee.pagibig_contribution).toFixed(
          2
        );
        const philhealthDeduction = Number(
          employee.philhealth_contribution
        ).toFixed(2);
        const withholdingTax = Number(employee.withholding_tax).toFixed(2);

        const totalDeductions = (
          parseFloat(sssDeduction) +
          parseFloat(pagibigDeduction) +
          parseFloat(philhealthDeduction) +
          parseFloat(withholdingTax)
        ).toFixed(2);
        const netPay = (grossPay - parseFloat(totalDeductions)).toFixed(2);

        console.log({ netPay, totalDeductions });
        return {
          employee: {
            id: employee.id,
            name: employee.name,
            position: employee.position,
            email: employee.email,
            role_id: employee.role_id,
            role_name: employee.role_name,
            salaryBasis: employee.salary_basis,
            category: employee.category
          },
          workDays,
          halfDays,
          grossPay,
          sssDeduction,
          pagibigDeduction,
          philhealthDeduction,
          withholdingTax,
          totalDeductions: totalDeductions,
          netPay: netPay || 0
        };
      })
    );

    res.json(payrollCalculations);
  } catch (error) {
    console.error('Error calculating payroll:', error);
    res.status(500).json({ error: 'Failed to calculate payroll' });
  }
});

// Add other payroll routes (history, save, get payslip) here...

export default router;
