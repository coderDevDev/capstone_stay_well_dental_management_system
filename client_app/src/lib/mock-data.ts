import {
  parseISO,
  addHours,
  addDays,
  setHours,
  setMinutes,
  format
} from 'date-fns';

import { v4 as uuidv4 } from 'uuid';

export interface Employee {
  id: string;
  name: string;
  position: string;
  salary: number;
  salaryBasis: 'daily' | 'weekly' | 'monthly';
  workingHours: number;
  category: 'Dentist' | 'Assistant' | 'Receptionist';
  sssContribution: number;
  pagibigContribution: number;
  philhealthContribution: number;
  withholdingTax: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day';
}

export let employees: Employee[] = [
  {
    id: uuidv4(),
    name: 'Dr. John Doe',
    position: 'Senior Dentist',
    salary: 50000,
    salaryBasis: 'monthly',
    workingHours: 40,
    category: 'Dentist',
    sssContribution: 1125, // Example SSS contribution for this salary bracket
    pagibigContribution: 100, // Standard Pag-IBIG contribution
    philhealthContribution: 675, // Example PhilHealth contribution for this salary bracket
    withholdingTax: 5000 // Example withholding tax
  },
  {
    id: uuidv4(),
    name: 'Jane Smith',
    position: 'Dental Hygienist',
    salary: 1000,
    salaryBasis: 'daily',
    workingHours: 35,
    category: 'Assistant',
    sssContribution: 500, // Example SSS contribution for this salary bracket
    pagibigContribution: 100, // Standard Pag-IBIG contribution
    philhealthContribution: 300, // Example PhilHealth contribution for this salary bracket
    withholdingTax: 2000 // Example withholding tax
  },
  {
    id: uuidv4(),
    name: 'Mike Johnson',
    position: 'Receptionist',
    salary: 4000,
    salaryBasis: 'weekly',
    workingHours: 40,
    category: 'Receptionist',
    sssContribution: 750, // Example SSS contribution for this salary bracket
    pagibigContribution: 100, // Standard Pag-IBIG contribution
    philhealthContribution: 450, // Example PhilHealth contribution for this salary bracket
    withholdingTax: 1500 // Example withholding tax
  }
];

export let attendanceRecords: AttendanceRecord[] = [];

// Generate attendance records for the last 30 days
const generateAttendanceRecords = () => {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  const statuses: ('Present' | 'Absent' | 'Late' | 'Half Day')[] = [
    'Present',
    'Absent',
    'Late',
    'Half Day'
  ];

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    employees.forEach(employee => {
      records.push({
        id: uuidv4(),
        employeeId: employee.id,
        date: date.toISOString().split('T')[0],
        status: statuses[Math.floor(Math.random() * statuses.length)]
      });
    });
  }

  return records;
};

attendanceRecords = generateAttendanceRecords();

// Generate attendance records for February 3-6
const generateFebruaryAttendance = () => {
  const records: AttendanceRecord[] = [];
  const startDate = new Date('2024-02-03');
  const endDate = new Date('2024-02-06');

  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    employees.forEach(employee => {
      records.push({
        id: uuidv4(),
        employeeId: employee.id,
        date: date.toISOString().split('T')[0],
        status: 'Present'
      });
    });
  }

  return records;
};

// Add February attendance to the existing records
attendanceRecords = [...attendanceRecords, ...generateFebruaryAttendance()];

export const addEmployee = (employee: Omit<Employee, 'id'>) => {
  const newEmployee = { ...employee, id: uuidv4() };
  employees.push(newEmployee);
  return newEmployee;
};

export const updateEmployee = (updatedEmployee: Employee) => {
  employees = employees.map(emp =>
    emp.id === updatedEmployee.id ? updatedEmployee : emp
  );
  return updatedEmployee;
};

export const deleteEmployee = (id: string) => {
  employees = employees.filter(emp => emp.id !== id);
  attendanceRecords = attendanceRecords.filter(
    record => record.employeeId !== id
  );
};

export const getEmployeeAttendance = (
  employeeId: string,
  startDate: string,
  endDate: string
) => {
  return attendanceRecords.filter(
    record =>
      record.employeeId === employeeId &&
      record.date >= startDate &&
      record.date <= endDate
  );
};

export const addAttendanceRecord = (record: Omit<AttendanceRecord, 'id'>) => {
  const newRecord = { ...record, id: uuidv4() };
  attendanceRecords.push(newRecord);
  return newRecord;
};

export const updateAttendanceRecord = (updatedRecord: AttendanceRecord) => {
  attendanceRecords = attendanceRecords.map(record =>
    record.id === updatedRecord.id ? updatedRecord : record
  );
  return updatedRecord;
};

export const deleteAttendanceRecord = (id: string) => {
  attendanceRecords = attendanceRecords.filter(record => record.id !== id);
};

export const calculatePayroll = (
  employeeId: string,
  startDate: string,
  endDate: string
) => {
  const employee = employees.find(emp => emp.id === employeeId);
  if (!employee) return null;

  const attendance = getEmployeeAttendance(employeeId, startDate, endDate);
  const workDays = attendance.filter(
    record => record.status === 'Present' || record.status === 'Late'
  ).length;
  const halfDays = attendance.filter(
    record => record.status === 'Half Day'
  ).length;

  let grossPay = 0;
  switch (employee.salaryBasis) {
    case 'daily':
      grossPay = employee.salary * workDays + employee.salary * 0.5 * halfDays;
      break;
    case 'weekly':
      const weeks = Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          (7 * 24 * 60 * 60 * 1000)
      );
      grossPay = employee.salary * weeks;
      break;
    case 'monthly':
      const months = Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          (30 * 24 * 60 * 60 * 1000)
      );
      grossPay = employee.salary * months;
      break;
  }

  const sssDeduction = employee.sssContribution;
  const pagibigDeduction = employee.pagibigContribution;
  const philhealthDeduction = employee.philhealthContribution;
  const withholdingTax = employee.withholdingTax;

  const totalDeductions =
    sssDeduction + pagibigDeduction + philhealthDeduction + withholdingTax;
  const netPay = grossPay - totalDeductions;

  return {
    employee,
    workDays,
    halfDays,
    grossPay,
    sssDeduction,
    pagibigDeduction,
    philhealthDeduction,
    withholdingTax,
    totalDeductions,
    netPay
  };
};

export const dentalServices = [
  { id: 1, name: 'Cleaning', duration: 60 },
  { id: 2, name: 'Filling', duration: 90 },
  { id: 3, name: 'Extraction', duration: 45 },
  { id: 4, name: 'Root Canal', duration: 120 }
];

export const appointmentStatuses = [
  'Pending',
  'Confirmed',
  'Rescheduled',
  'Cancelled',
  'No-Show',
  'In Progress',
  'Completed',
  'Missed',
  'On Hold',
  'Follow-Up Required'
];

export const mockPatients = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com' }
];

export const mockAppointments = [
  {
    id: 1,
    patientId: 1,
    serviceId: 1,
    date: '2025-02-10',
    start: '2025-02-10T02:00:00.000Z',
    end: '2025-02-10T03:00:00.000Z',
    status: 'Confirmed',
    patient_id: 1,
    dentist_id: 1,
    service_id: 1,
    status_id: 2,
    patient_first_name: 'John',
    patient_last_name: 'Doe',
    service_name: 'Cleaning',
    appointment_status: 'Confirmed'
  },
  {
    id: 4,
    patientId: 1,
    serviceId: 4,
    date: '2025-02-13',
    start: '2025-02-13T01:00:00.000Z',
    end: '2025-02-13T03:00:00.000Z',
    status: 'Rescheduled',
    patient_id: 1,
    dentist_id: 2,
    service_id: 4,
    status_id: 3,
    patient_first_name: 'John',
    patient_last_name: 'Doe',
    service_name: 'Root Canal',
    appointment_status: 'Rescheduled'
  },
  {
    id: 2,
    patientId: 2,
    serviceId: 2,
    date: '2025-02-11',
    start: '2025-02-11T06:30:00.000Z',
    end: '2025-02-11T08:00:00.000Z',
    status: 'Pending',
    patient_id: 2,
    dentist_id: 2,
    service_id: 2,
    status_id: 1,
    patient_first_name: 'Jane',
    patient_last_name: 'Smith',
    service_name: 'Filling',
    appointment_status: 'Pending'
  },
  {
    id: 3,
    patientId: 3,
    serviceId: 3,
    date: '2025-02-12',
    start: '2025-02-12T03:00:00.000Z',
    end: '2025-02-12T03:45:00.000Z',
    status: 'Confirmed',
    patient_id: 3,
    dentist_id: 1,
    service_id: 3,
    status_id: 2,
    patient_first_name: 'Bob',
    patient_last_name: 'Johnson',
    service_name: 'Extraction',
    appointment_status: 'Confirmed'
  }
].map(other => {
  // const phDateStart = addHours(parseISO(other.start), 8);
  // const phDateEnd = addHours(parseISO(other.end), 8);

  // let options = { timeZone: 'Asia/Manila', timeZoneName: 'long' };

  return {
    ...other,
    start: new Date(other.start),
    end: new Date(other.end)
  };
});

console.log({ mockAppointments });
export const mockTreatments = [
  {
    id: 1,
    appointmentId: 1,
    patientId: 1,
    description: 'Regular cleaning performed',
    date: new Date()
  },
  {
    id: 2,
    appointmentId: 2,
    patientId: 2,
    description: 'Cavity filled on upper right molar',
    date: addDays(new Date(), -7)
  }
];

export const availableTimeSlots = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00'
];
