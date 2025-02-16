'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { format } from 'date-fns';

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  payrollData: any;
  selectedMonth: string;
}

export default function PayslipModal({
  isOpen,
  onClose,
  payrollData,
  selectedMonth
}: PayslipModalProps) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(getPayslipHTML());
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getPayslipHTML = () => {
    const monthName = format(new Date(`2024-${selectedMonth}-01`), 'MMMM yyyy');

    return `
      <html>
        <head>
          <title>Payslip - ${payrollData.employee.name}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .payslip {
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 24px;
              background: #fff;
            }
            .header {
              text-align: center;
              margin-bottom: 24px;
              padding-bottom: 16px;
              border-bottom: 2px solid #e2e8f0;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #1a365d;
              margin: 0;
            }
            .payslip-title {
              font-size: 18px;
              color: #4a5568;
              margin: 8px 0;
            }
            .period {
              color: #718096;
              font-size: 14px;
            }
            .section {
              margin-bottom: 24px;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              color: #2d3748;
              margin-bottom: 12px;
              padding-bottom: 4px;
              border-bottom: 1px solid #e2e8f0;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            .label {
              color: #4a5568;
              font-weight: 500;
            }
            .value {
              color: #2d3748;
              font-weight: 600;
            }
            .total {
              margin-top: 24px;
              padding-top: 16px;
              border-top: 2px solid #e2e8f0;
            }
            .total .info-row {
              font-size: 18px;
            }
            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="payslip">
            <div class="header">
              <h1 class="company-name">Dental Clinic</h1>
              <div class="payslip-title">Payslip</div>
              <div class="period">Pay Period: ${monthName}</div>
            </div>

            <div class="section">
              <div class="section-title">Employee Information</div>
              <div class="grid">
                <div>
                  <div class="info-row">
                    <span class="label">Name:</span>
                    <span class="value">${payrollData.employee.name}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Position:</span>
                    <span class="value">${payrollData.employee.role_name}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Email:</span>
                    <span class="value">${payrollData.employee.email}</span>
                  </div>
                </div>
                <div>
                  <div class="info-row">
                    <span class="label">Category:</span>
                    <span class="value">${payrollData.employee.category}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Salary Basis:</span>
                    <span class="value">${
                      payrollData.employee.salaryBasis
                    }</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Attendance Summary</div>
              <div class="grid">
                <div class="info-row">
                  <span class="label">Work Days:</span>
                  <span class="value">${payrollData.workDays}</span>
                </div>
                <div class="info-row">
                  <span class="label">Half Days:</span>
                  <span class="value">${payrollData.halfDays}</span>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Earnings & Deductions</div>
              <div class="grid">
                <div>
                  <div class="info-row">
                    <span class="label">Gross Pay:</span>
                    <span class="value">₱${Number(
                      payrollData.grossPay
                    ).toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <div class="info-row">
                    <span class="label">SSS:</span>
                    <span class="value">₱${Number(
                      payrollData.sssDeduction
                    ).toLocaleString()}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Pag-IBIG:</span>
                    <span class="value">₱${Number(
                      payrollData.pagibigDeduction
                    ).toLocaleString()}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">PhilHealth:</span>
                    <span class="value">₱${Number(
                      payrollData.philhealthDeduction
                    ).toLocaleString()}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Withholding Tax:</span>
                    <span class="value">₱${Number(
                      payrollData.withholdingTax
                    ).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="total">
              <div class="info-row">
                <span class="label">Total Deductions:</span>
                <span class="value">₱${Number(
                  payrollData.totalDeductions
                ).toLocaleString()}</span>
              </div>
              <div class="info-row">
                <span class="label">Net Pay:</span>
                <span class="value">₱${Number(
                  payrollData.netPay
                ).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Payslip Preview</DialogTitle>
          <Button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white">
            <Printer className="mr-2 h-4 w-4" />
            Print Payslip
          </Button>
        </DialogHeader>
        <div
          className="mt-4 w-full"
          dangerouslySetInnerHTML={{ __html: getPayslipHTML() }}
        />
      </DialogContent>
    </Dialog>
  );
}
