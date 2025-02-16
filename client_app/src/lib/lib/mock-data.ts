import { v4 as uuidv4 } from "uuid"

export interface Employee {
  id: string
  name: string
  position: string
  salary: number
  salaryBasis: "daily" | "weekly" | "monthly"
  workingHours: number
  category: "Dentist" | "Assistant" | "Receptionist"
  sssContribution: number
  pagibigContribution: number
  philhealthContribution: number
  withholdingTax: number
}

export interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  status: "Present" | "Absent" | "Late" | "Half Day"
}

export let employees: Employee[] = [
  {
    id: uuidv4(),
    name: "Dr. John Doe",
    position: "Senior Dentist",
    salary: 50000,
    salaryBasis: "monthly",
    workingHours: 40,
    category: "Dentist",
    sssContribution: 1125, // Example SSS contribution for this salary bracket
    pagibigContribution: 100, // Standard Pag-IBIG contribution
    philhealthContribution: 675, // Example PhilHealth contribution for this salary bracket
    withholdingTax: 5000, // Example withholding tax
  },
  {
    id: uuidv4(),
    name: "Jane Smith",
    position: "Dental Hygienist",
    salary: 1000,
    salaryBasis: "daily",
    workingHours: 35,
    category: "Assistant",
    sssContribution: 500, // Example SSS contribution for this salary bracket
    pagibigContribution: 100, // Standard Pag-IBIG contribution
    philhealthContribution: 300, // Example PhilHealth contribution for this salary bracket
    withholdingTax: 2000, // Example withholding tax
  },
  {
    id: uuidv4(),
    name: "Mike Johnson",
    position: "Receptionist",
    salary: 4000,
    salaryBasis: "weekly",
    workingHours: 40,
    category: "Receptionist",
    sssContribution: 750, // Example SSS contribution for this salary bracket
    pagibigContribution: 100, // Standard Pag-IBIG contribution
    philhealthContribution: 450, // Example PhilHealth contribution for this salary bracket
    withholdingTax: 1500, // Example withholding tax
  },
]

export let attendanceRecords: AttendanceRecord[] = []

// Generate attendance records for the last 30 days
const generateAttendanceRecords = () => {
  const records: AttendanceRecord[] = []
  const today = new Date()
  const statuses: ("Present" | "Absent" | "Late" | "Half Day")[] = ["Present", "Absent", "Late", "Half Day"]

  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    employees.forEach((employee) => {
      records.push({
        id: uuidv4(),
        employeeId: employee.id,
        date: date.toISOString().split("T")[0],
        status: statuses[Math.floor(Math.random() * statuses.length)],
      })
    })
  }

  return records
}

attendanceRecords = generateAttendanceRecords()

// Generate attendance records for February 3-6
const generateFebruaryAttendance = () => {
  const records: AttendanceRecord[] = []
  const startDate = new Date("2024-02-03")
  const endDate = new Date("2024-02-06")

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    employees.forEach((employee) => {
      records.push({
        id: uuidv4(),
        employeeId: employee.id,
        date: date.toISOString().split("T")[0],
        status: "Present",
      })
    })
  }

  return records
}

// Add February attendance to the existing records
attendanceRecords = [...attendanceRecords, ...generateFebruaryAttendance()]

export const addEmployee = (employee: Omit<Employee, "id">) => {
  const newEmployee = { ...employee, id: uuidv4() }
  employees.push(newEmployee)
  return newEmployee
}

export const updateEmployee = (updatedEmployee: Employee) => {
  employees = employees.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp))
  return updatedEmployee
}

export const deleteEmployee = (id: string) => {
  employees = employees.filter((emp) => emp.id !== id)
  attendanceRecords = attendanceRecords.filter((record) => record.employeeId !== id)
}

export const getEmployeeAttendance = (employeeId: string, startDate: string, endDate: string) => {
  return attendanceRecords.filter(
    (record) => record.employeeId === employeeId && record.date >= startDate && record.date <= endDate,
  )
}

export const addAttendanceRecord = (record: Omit<AttendanceRecord, "id">) => {
  const newRecord = { ...record, id: uuidv4() }
  attendanceRecords.push(newRecord)
  return newRecord
}

export const updateAttendanceRecord = (updatedRecord: AttendanceRecord) => {
  attendanceRecords = attendanceRecords.map((record) => (record.id === updatedRecord.id ? updatedRecord : record))
  return updatedRecord
}

export const deleteAttendanceRecord = (id: string) => {
  attendanceRecords = attendanceRecords.filter((record) => record.id !== id)
}

export const calculatePayroll = (employeeId: string, startDate: string, endDate: string) => {
  const employee = employees.find((emp) => emp.id === employeeId)
  if (!employee) return null

  const attendance = getEmployeeAttendance(employeeId, startDate, endDate)
  const workDays = attendance.filter((record) => record.status === "Present" || record.status === "Late").length
  const halfDays = attendance.filter((record) => record.status === "Half Day").length

  let grossPay = 0
  switch (employee.salaryBasis) {
    case "daily":
      grossPay = employee.salary * workDays + employee.salary * 0.5 * halfDays
      break
    case "weekly":
      const weeks = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (7 * 24 * 60 * 60 * 1000))
      grossPay = employee.salary * weeks
      break
    case "monthly":
      const months = Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) / (30 * 24 * 60 * 60 * 1000),
      )
      grossPay = employee.salary * months
      break
  }

  const sssDeduction = employee.sssContribution
  const pagibigDeduction = employee.pagibigContribution
  const philhealthDeduction = employee.philhealthContribution
  const withholdingTax = employee.withholdingTax

  const totalDeductions = sssDeduction + pagibigDeduction + philhealthDeduction + withholdingTax
  const netPay = grossPay - totalDeductions

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
    netPay,
  }
}

