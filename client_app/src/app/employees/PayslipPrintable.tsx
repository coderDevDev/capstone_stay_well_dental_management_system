import { format } from 'date-fns';

interface PayslipPrintableProps {
  payslipData: any;
  employee: any;
}

export function PayslipPrintable({
  payslipData,
  employee
}: PayslipPrintableProps) {
  if (!payslipData || !employee) return null;

  // Convert numeric values
  const basicSalary = Number(payslipData.basic_salary);
  const ratePerHour = Number(payslipData.rate_per_hour);
  const hoursWorked = Number(payslipData.hours_worked);
  const overtimeHours = Number(payslipData.overtime_hours);
  const overtimePay = Number(payslipData.overtime_pay);
  const allowances = Number(payslipData.allowances);
  const sssContribution = Number(payslipData.sss_contribution);
  const philhealthContribution = Number(payslipData.philhealth_contribution);
  const pagibigContribution = Number(payslipData.pagibig_contribution);
  const tax = Number(payslipData.tax);
  const deductions = Number(payslipData.deductions);
  const netPay = Number(payslipData.net_pay);

  return (
    <div className="p-8 bg-white">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-1">PAYSLIP</h1>
        <h3 className="text-gray-600">Stay Well Dental Management System</h3>
      </div>

      <div className="border border-gray-300 p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p>
              <strong>Employee:</strong> {employee.name}
            </p>
            <p>
              <strong>Position:</strong>{' '}
              {employee.position || employee.role_name || 'N/A'}
            </p>
            <p>
              <strong>Employee ID:</strong> {employee.id}
            </p>
          </div>
          <div>
            <p>
              <strong>Pay Period:</strong> {payslipData.periodStart} to{' '}
              {payslipData.periodEnd}
            </p>
            <p>
              <strong>Payment Date:</strong>{' '}
              {format(new Date(), 'MMMM dd, yyyy')}
            </p>
            <p>
              <strong>Payment Method:</strong> Direct Deposit
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Earnings Section */}
        <div>
          <h3 className="font-semibold border-b pb-2 mb-2">Earnings</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Basic Salary</span>
              <span>
                ₱
                {basicSalary.toLocaleString(undefined, {
                  minimumFractionDigits: 2
                })}
              </span>
            </div>
            {overtimePay > 0 && (
              <div className="flex justify-between">
                <span>Overtime Pay</span>
                <span>
                  ₱
                  {overtimePay.toLocaleString(undefined, {
                    minimumFractionDigits: 2
                  })}
                </span>
              </div>
            )}
            {allowances > 0 && (
              <div className="flex justify-between">
                <span>Allowances</span>
                <span>
                  ₱
                  {allowances.toLocaleString(undefined, {
                    minimumFractionDigits: 2
                  })}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 font-medium">
              <span>Gross Pay</span>
              <span>
                ₱
                {(basicSalary + overtimePay + allowances).toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2 }
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Deductions Section */}
        <div>
          <h3 className="font-semibold border-b pb-2 mb-2">Deductions</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>SSS</span>
              <span>
                ₱
                {sssContribution.toLocaleString(undefined, {
                  minimumFractionDigits: 2
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>PhilHealth</span>
              <span>
                ₱
                {philhealthContribution.toLocaleString(undefined, {
                  minimumFractionDigits: 2
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Pag-IBIG</span>
              <span>
                ₱
                {pagibigContribution.toLocaleString(undefined, {
                  minimumFractionDigits: 2
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>
                ₱{tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 font-medium">
              <span>Total Deductions</span>
              <span>
                ₱
                {deductions.toLocaleString(undefined, {
                  minimumFractionDigits: 2
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Net Pay Section */}
      <div className="bg-gray-100 p-4 border border-gray-300 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">NET PAY</span>
          <span className="text-lg font-bold">
            ₱{netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="mb-8">
        <h3 className="font-semibold border-b pb-2 mb-2">Attendance Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p>
              <strong>Hours Worked:</strong> {hoursWorked.toFixed(1)} hrs
            </p>
            <p>
              <strong>Rate per Hour:</strong> ₱
              {ratePerHour.toLocaleString(undefined, {
                minimumFractionDigits: 2
              })}
              /hr
            </p>
            {overtimeHours > 0 && (
              <p>
                <strong>Overtime Hours:</strong> {overtimeHours.toFixed(1)} hrs
              </p>
            )}
          </div>
          <div>
            <p>Present Days: {payslipData.attendance?.presentDays || 'N/A'}</p>
            <p>Absent Days: {payslipData.attendance?.absentDays || 'N/A'}</p>
            <p>Late Days: {payslipData.attendance?.lateDays || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="mt-12 grid grid-cols-2 gap-8">
        <div>
          <p className="mb-8">Prepared by:</p>
          <div className="border-t border-black pt-1">
            <p className="text-center">HR Manager</p>
          </div>
        </div>
        <div>
          <p className="mb-8">Received by:</p>
          <div className="border-t border-black pt-1">
            <p className="text-center">{employee.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
