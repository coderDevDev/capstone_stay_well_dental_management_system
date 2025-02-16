import type {
  InventoryItem,
  Order,
  Supplier
} from '../app/inventory-supplier/InventoryManagement';
import axios from 'axios';

export const API_URL = 'http://localhost:5000/api';

// Inventory Services
export const inventoryService = {
  async getAll() {
    const response = await fetch(`${API_URL}/inventory`);
    if (!response.ok) throw new Error('Failed to fetch inventory');
    return response.json();
  },

  async getById(id: number) {
    const response = await fetch(`${API_URL}/inventory/${id}`);
    if (!response.ok) throw new Error('Failed to fetch inventory item');
    return response.json();
  },

  async create(data: Omit<InventoryItem, 'id'>) {
    const response = await fetch(`${API_URL}/inventory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create inventory item');
    }
    return response.json();
  },

  async update(id: number, data: Partial<InventoryItem>) {
    const response = await fetch(`${API_URL}/inventory/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update inventory item');
    }
    return response.json();
  },

  async delete(id: number) {
    const response = await fetch(`${API_URL}/inventory/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete inventory item');
    }
    return response.json();
  },

  updateInventoryQuantities: async medications => {
    try {
      const response = await axios.put(
        '/inventory/update-quantities/updateEachItem',
        {
          medications
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating inventory quantities:', error);
      throw error;
    }
  }
};

// Order Services
export const orderService = {
  async getAll() {
    const response = await fetch(`${API_URL}/orders`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },

  async getById(id: number) {
    const response = await fetch(`${API_URL}/orders/${id}`);
    if (!response.ok) throw new Error('Failed to fetch order');
    return response.json();
  },

  async create(data: Omit<Order, 'id' | 'status'>) {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...data, status: 'Pending' })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create order');
    }
    return response.json();
  },

  async updateStatus(id: number, status: Order['status']) {
    const response = await fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update order status');
    }
    return response.json();
  },

  async delete(id: number) {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete order');
    }
    return response.json();
  }
};

// Supplier Services
export const supplierService = {
  async getAll() {
    const response = await fetch(`${API_URL}/suppliers`);
    if (!response.ok) throw new Error('Failed to fetch suppliers');
    return response.json();
  },

  async getById(id: number) {
    const response = await fetch(`${API_URL}/suppliers/${id}`);
    if (!response.ok) throw new Error('Failed to fetch supplier');
    return response.json();
  },

  async create(data: Omit<Supplier, 'id'>) {
    const response = await fetch(`${API_URL}/suppliers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create supplier');
    }
    return response.json();
  },

  async update(id: number, data: Partial<Supplier>) {
    const response = await fetch(`${API_URL}/suppliers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update supplier');
    }
    return response.json();
  },

  async delete(id: number) {
    const response = await fetch(`${API_URL}/suppliers/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete supplier');
    }
    return response.json();
  }
};

export const userService = {
  async register(data: any) {
    try {
      const response = await axios.post(`${API_URL}/users/create`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error registering user:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to register user'
      );
    }
  },

  async resendVerification(email?: string) {
    try {
      // If email is not provided, try to get it from localStorage
      const userEmail =
        email || JSON.parse(localStorage.getItem('tempEmail') || '{}');

      const response = await axios.post(
        `${API_URL}/users/resend-verification`,
        {
          email: userEmail
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error resending verification:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to resend verification email'
      );
    }
  },

  async verifyEmail(token: string) {
    try {
      const response = await axios.get(
        `${API_URL}/users/verify-email/${token}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error verifying email:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to verify email'
      );
    }
  },

  async login(data: { email: string; password: string }) {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to login');
    }
    return response.json();
  },

  async getAllUsers() {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async deleteUser(patientId: number) {
    const response = await fetch(`${API_URL}/user/${patientId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete user');
    }
    return response.json();
  },

  async updateUser(patientId: number, data: any) {
    const response = await fetch(`${API_URL}/user/${patientId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update user');
    }
    return response.json();
  }
};

// Helper function to calculate age from date of birth
function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role_id: string;
  role_name: string;
  position: string;
  salary: number;
  salaryBasis: string;
  workingHours: number;
  category: string;
  sssContribution: number;
  pagibigContribution: number;
  philhealthContribution: number;
  withholdingTax: number;
}

export const employeeService = {
  getAll: async (): Promise<Employee[]> => {
    try {
      const response = await axios.get(`${API_URL}/employees`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      throw new Error(
        error.response?.data?.error || 'Failed to fetch employees'
      );
    }
  },

  getById: async (id: string): Promise<Employee> => {
    try {
      const response = await axios.get(`${API_URL}/employees/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching employee:', error);
      throw new Error(
        error.response?.data?.error || 'Failed to fetch employee'
      );
    }
  },

  create: async (data: Omit<Employee, 'id'>): Promise<Employee> => {
    try {
      const response = await axios.post(`${API_URL}/employees/create`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating employee:', error);
      throw new Error(
        error.response?.data?.error || 'Failed to create employee'
      );
    }
  },

  update: async (id: string, data: Partial<Employee>): Promise<Employee> => {
    try {
      const response = await axios.put(`${API_URL}/employees/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating employee:', error);
      throw new Error(
        error.response?.data?.error || 'Failed to update employee'
      );
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/employees/${id}`);
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      throw new Error(
        error.response?.data?.error || 'Failed to delete employee'
      );
    }
  },

  async getByRole(role: string): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await axios.get(`${API_URL}/employees/role/${role}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching employees by role:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch employees'
      );
    }
  },

  async getDentists() {
    try {
      const response = await axios.get(`${API_URL}/employees/dentists/all`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching dentists:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch dentists'
      );
    }
  }
};

export interface Attendance {
  id: string;
  employee_id: string;
  employeeName: string;
  date: string;
  status: string;
}

export const attendanceService = {
  getAll: async (): Promise<Attendance[]> => {
    try {
      const response = await axios.get(`${API_URL}/attendance`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching attendance:', error);
      throw new Error(
        error.response?.data?.error || 'Failed to fetch attendance'
      );
    }
  },

  getById: async (id: string): Promise<Attendance> => {
    try {
      const response = await axios.get(`${API_URL}/attendance/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching attendance record:', error);
      throw new Error(
        error.response?.data?.error || 'Failed to fetch attendance record'
      );
    }
  },

  create: async (
    data: Omit<Attendance, 'id' | 'employeeName'>
  ): Promise<Attendance> => {
    try {
      const response = await axios.post(`${API_URL}/attendance`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating attendance:', error);
      throw new Error(
        error.response?.data?.error || 'Failed to create attendance'
      );
    }
  },

  update: async (
    id: string,
    data: Partial<Omit<Attendance, 'employeeName'>>
  ): Promise<Attendance> => {
    try {
      const response = await axios.put(`${API_URL}/attendance/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating attendance:', error);
      throw new Error(
        error.response?.data?.error || 'Failed to update attendance'
      );
    }
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/attendance/${id}`);
  }
};

// Define the Role type
export type Role = {
  role_id: string;
  role_name: string;
};

// Role service to fetch roles
export const roleService = {
  getAll: async (): Promise<Role[]> => {
    try {
      const response = await axios.get(`${API_URL}/roles`);
      return response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw new Error('Failed to fetch roles');
    }
  }
};

export interface PayrollCalculation {
  employee: Employee;
  workDays: number;
  halfDays: number;
  grossPay: number;
  sssDeduction: number;
  pagibigDeduction: number;
  philhealthDeduction: number;
  withholdingTax: number;
  totalDeductions: number;
  netPay: number;
}

export const payrollService = {
  // Calculate payroll for one or all employees
  calculate: async (
    employeeId: string | null,
    startDate: string,
    endDate: string
  ): Promise<PayrollCalculation[]> => {
    try {
      const response = await axios.post(`${API_URL}/payroll/calculate`, {
        employeeId,
        startDate,
        endDate
      });
      return response.data;
    } catch (error: any) {
      console.error('Error calculating payroll:', error);
      throw new Error(
        error.response?.data?.error || 'Failed to calculate payroll'
      );
    }
  },

  // Get payroll history
  getHistory: async (
    employeeId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<PayrollCalculation[]> => {
    try {
      const params = { employeeId, startDate, endDate };
      const response = await axios.get(`${API_URL}/payroll/history`, {
        params
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching payroll history:', error);
      throw new Error(
        error.response?.data?.error || 'Failed to fetch payroll history'
      );
    }
  },

  // Save processed payroll
  save: async (payrollData: PayrollCalculation): Promise<void> => {
    try {
      await axios.post(`${API_URL}/payroll/save`, payrollData);
    } catch (error: any) {
      console.error('Error saving payroll:', error);
      throw new Error(error.response?.data?.error || 'Failed to save payroll');
    }
  },

  // Get payslip by ID
  getPayslip: async (payrollId: string): Promise<PayrollCalculation> => {
    try {
      const response = await axios.get(`${API_URL}/payroll/${payrollId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching payslip:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch payslip');
    }
  }
};

export interface PatientInformation {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  medicalHistory: {
    allergies: string[];
    conditions: string[];
    medications: string[];
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface ToothTreatment {
  toothNumber: string;
  treatment: string;
  status: 'Pending' | 'Ongoing' | 'Done';
}

export interface Treatment {
  id: string;
  appointmentId?: string;
  patientId: string;
  date: Date;
  dentist_id: string;
  dentist_name: string;
  notes?: string;
  type: 'medical' | 'cosmetic';
  // For new format
  toothTreatments?: Array<{
    toothNumber: string;
    treatment: string;
    status: 'Pending' | 'Ongoing' | 'Done';
  }>;
  // For backward compatibility
  tooth_numbers?: string;
  tooth_treatments?: string;
}

export interface TreatmentFormValues {
  toothTreatments: Array<{
    toothNumber: string;
    treatment: string;
    status: 'Pending' | 'Ongoing' | 'Done';
  }>;
  dentist: string;
  notes?: string;
  type: 'medical' | 'cosmetic';
  patientId?: string;
  appointmentId?: string;
  toothNumbers?: string[];
  toothStatuses?: Record<string, string>;
}

export const treatmentService = {
  async getAll(patientId: string): Promise<Treatment[]> {
    try {
      const response = await axios.get(`${API_URL}/treatments/${patientId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching treatments:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch treatments'
      );
    }
  },

  async create(data: TreatmentFormValues): Promise<Treatment> {
    try {
      const response = await axios.post(`${API_URL}/treatments`, {
        patientId: data.patientId,
        appointmentId: data.appointmentId,
        dentist: data.dentist,
        notes: data.notes,
        type: data.type,
        toothNumbers: data.toothNumbers,
        toothTreatments: data.toothTreatments,
        toothStatuses: data.toothStatuses
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to create treatment'
      );
    }
  },

  async update(id: string, data: TreatmentFormValues): Promise<Treatment> {
    try {
      const response = await axios.put(`${API_URL}/treatments/${id}`, {
        dentist: data.dentist,
        notes: data.notes,
        type: data.type,
        toothTreatments: data.toothTreatments
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to update treatment'
      );
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/treatments/${id}`);
    } catch (error: any) {
      console.error('Error deleting treatment:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to delete treatment'
      );
    }
  },

  async getById(id: string): Promise<Treatment> {
    try {
      const response = await axios.get(`${API_URL}/treatments/detail/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching treatment:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch treatment'
      );
    }
  },

  async getByAppointmentId(appointmentId: string): Promise<Treatment | null> {
    try {
      const response = await axios.get(
        `${API_URL}/treatments/appointment/${appointmentId}`
      );
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching treatment by appointment:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch treatment'
      );
    }
  },

  async updateAppointmentStatus(
    appointmentId: string,
    data: {
      status: string;
      treatmentId: string;
      medication?: {
        id: string;
        quantity: number;
      };
      statusId: number;
    }
  ) {
    try {
      const response = await axios.put(
        `${API_URL}/treatments/appointment/${appointmentId}/status`,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating appointment status:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to update appointment status'
      );
    }
  }
};

export const patientService = {
  async getById(id: string): Promise<PatientInformation> {
    try {
      const response = await axios.get(`${API_URL}/user/patients/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching patient:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch patient'
      );
    }
  }
};

interface Appointment {
  id: string;
  patientId: string;
  serviceId: string;
  date: string;
  start: string;
  end: string;
  status: string;
  service_name: string;
  service_fee: number;
  hasTreatment?: boolean;
  treatments?: Treatment[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const appointmentService = {
  async getByPatientId(patientId: string): Promise<ApiResponse<Appointment[]>> {
    try {
      const response = await axios.get(
        `${API_URL}/appointment/patient/${patientId}`
      );

      // Check for existing treatments
      const treatments = await treatmentService.getAll(patientId);

      const appointmentsWithTreatments = response.data.data.map(
        (appointment: Appointment) => ({
          ...appointment,
          hasTreatment: treatments.data.some(
            t => t.appointmentId === appointment.id
          )
        })
      );

      console.log({ appointmentsWithTreatments });
      return {
        success: true,
        data: appointmentsWithTreatments
      };
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch appointments'
      );
    }
  },

  async update(
    id: string,
    data: Partial<Appointment>
  ): Promise<ApiResponse<Appointment>> {
    try {
      const response = await axios.put(`${API_URL}/appointments/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to update appointment'
      );
    }
  }
};
