'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import {
  FileText,
  Calendar as CalendarIcon,
  Download,
  Printer
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import html2pdf from 'html2pdf.js';

interface DTRReportProps {
  employees: any[];
  branches: any[];
}

export default function DTRReport({ employees, branches }: DTRReportProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Fetch attendance records for the selected employee and month
  const fetchDTR = async () => {
    if (!selectedEmployeeId) {
      toast.error('Please select an employee');
      return;
    }

    try {
      setIsLoading(true);
      const startDate = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');

      const response = await axios.get('/attendance', {
        params: {
          employee_id: selectedEmployeeId,
          start_date: startDate,
          end_date: endDate
        }
      });

      setAttendance(response.data);
    } catch (error) {
      console.error('Error fetching DTR:', error);
      toast.error('Failed to fetch attendance records');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate printable DTR
  const generateDTR = () => {
    if (!selectedEmployeeId || attendance.length === 0) {
      toast.error('No data available to generate DTR');
      return;
    }

    const employee = employees.find(
      e => e.id.toString() === selectedEmployeeId
    );
    if (!employee) return;

    // Create date range for the month
    const days = eachDayOfInterval({
      start: startOfMonth(selectedMonth),
      end: endOfMonth(selectedMonth)
    });

    const tableRows = days.map(day => {
      const record = attendance.find(
        a =>
          a.date === format(day, 'yyyy-MM-dd') &&
          a.employee_id.toString() === selectedEmployeeId
      );

      return `
        <tr>
          <td>${format(day, 'EEE')}</td>
          <td>${format(day, 'MMM dd, yyyy')}</td>
          <td>${record ? record.status : 'No Record'}</td>
        </tr>
      `;
    });

    // Count statistics
    const totalPresent = attendance.filter(a => a.status === 'Present').length;
    const totalLate = attendance.filter(a => a.status === 'Late').length;
    const totalAbsent = attendance.filter(a => a.status === 'Absent').length;
    const totalLeave = attendance.filter(a => a.status === 'Leave').length;
    const totalHalfDay = attendance.filter(a => a.status === 'Half Day').length;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="margin-bottom: 5px;">DAILY TIME RECORD (DTR)</h1>
          <h2 style="margin-top: 0;">${format(selectedMonth, 'MMMM yyyy')}</h2>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p><strong>Employee:</strong> ${employee.name}</p>
          <p><strong>Position:</strong> ${employee.position || 'N/A'}</p>
          <p><strong>Period:</strong> ${format(
            startOfMonth(selectedMonth),
            'MMMM 1'
          )} - ${format(endOfMonth(selectedMonth), 'MMMM dd, yyyy')}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Day</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Date</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows.join('')}
          </tbody>
        </table>
        
        <div style="margin-top: 20px;">
          <h3>Summary</h3>
          <table style="width: 50%; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px;"><strong>Present:</strong></td>
              <td style="padding: 4px;">${totalPresent} days</td>
            </tr>
            <tr>
              <td style="padding: 4px;"><strong>Late:</strong></td>
              <td style="padding: 4px;">${totalLate} days</td>
            </tr>
            <tr>
              <td style="padding: 4px;"><strong>Half Day:</strong></td>
              <td style="padding: 4px;">${totalHalfDay} days</td>
            </tr>
            <tr>
              <td style="padding: 4px;"><strong>Absent:</strong></td>
              <td style="padding: 4px;">${totalAbsent} days</td>
            </tr>
            <tr>
              <td style="padding: 4px;"><strong>Leave:</strong></td>
              <td style="padding: 4px;">${totalLeave} days</td>
            </tr>
          </table>
        </div>
        
        <div style="margin-top: 30px; display: flex; justify-content: space-between;">
          <div style="width: 45%;">
            <p style="margin-bottom: 30px;">Certified Correct by:</p>
            <div style="border-top: 1px solid #000; padding-top: 5px;">
              <p style="margin: 0; text-align: center;">Administrator</p>
            </div>
          </div>
          
          <div style="width: 45%;">
            <p style="margin-bottom: 30px;">Received by:</p>
            <div style="border-top: 1px solid #000; padding-top: 5px;">
              <p style="margin: 0; text-align: center;">${employee.name}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = html;
    document.body.appendChild(element);

    html2pdf(element, {
      margin: 10,
      filename: `DTR_${employee.name}_${format(selectedMonth, 'MMM_yyyy')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).then(() => {
      document.body.removeChild(element);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Daily Time Record (DTR)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="employee-select">Select Employee</Label>
            <Select
              value={selectedEmployeeId || ''}
              onValueChange={setSelectedEmployeeId}>
              <SelectTrigger id="employee-select">
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(employee => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Label>Select Month</Label>
            <Popover open={showCalendar} onOpenChange={setShowCalendar}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedMonth, 'MMMM yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedMonth}
                  onSelect={date => {
                    setSelectedMonth(date || new Date());
                    setShowCalendar(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-end space-x-2">
            <Button
              variant="outline"
              onClick={fetchDTR}
              disabled={isLoading || !selectedEmployeeId}>
              <FileText className="mr-2 h-4 w-4" />
              {isLoading ? 'Loading...' : 'View DTR'}
            </Button>

            <Button
              onClick={generateDTR}
              disabled={isLoading || attendance.length === 0}>
              <Printer className="mr-2 h-4 w-4" />
              Print DTR
            </Button>
          </div>
        </div>

        {attendance.length > 0 && (
          <div className="border rounded-md overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-100">
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Day</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {eachDayOfInterval({
                  start: startOfMonth(selectedMonth),
                  end: endOfMonth(selectedMonth)
                }).map(day => {
                  const record = attendance.find(
                    a =>
                      a.date === format(day, 'yyyy-MM-dd') &&
                      a.employee_id.toString() === selectedEmployeeId
                  );

                  return (
                    <tr key={format(day, 'yyyy-MM-dd')} className="border-t">
                      <td className="px-4 py-2">
                        {format(day, 'MMMM dd, yyyy')}
                      </td>
                      <td className="px-4 py-2">{format(day, 'EEEE')}</td>
                      <td className="px-4 py-2">
                        <span
                          className={
                            record
                              ? record.status === 'Present'
                                ? 'text-green-600 font-medium'
                                : record.status === 'Late'
                                ? 'text-yellow-600 font-medium'
                                : record.status === 'Absent'
                                ? 'text-red-600 font-medium'
                                : record.status === 'Half Day'
                                ? 'text-orange-600 font-medium'
                                : record.status === 'Leave'
                                ? 'text-blue-600 font-medium'
                                : ''
                              : 'text-gray-400 italic'
                          }>
                          {record ? record.status : 'No Record'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
