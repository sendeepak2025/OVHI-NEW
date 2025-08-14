// Mock API service - Replace with real Node.js/MySQL backend calls later
import { toast } from 'sonner';

// Simulate network delay
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data that would come from MySQL database
let mockAppointments = [
  {
    id: '1',
    patient_id: 'pat-1',
    provider_id: 'prov-1',
    location_id: 'loc-1',
    appointment_date: '2025-03-15',
    appointment_time: '10:30',
    duration_minutes: 30,
    appointment_type: 'Telehealth',
    status: 'confirmed',
    reason: 'General consultation',
    notes: '',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    patient_id: 'pat-2',
    provider_id: 'prov-2',
    location_id: 'loc-1',
    appointment_date: '2025-03-15',
    appointment_time: '14:00',
    duration_minutes: 45,
    appointment_type: 'In-person',
    status: 'pending',
    reason: 'Follow-up visit',
    notes: '',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }
];

let mockPatients = [
  {
    id: 'pat-1',
    name: 'James Wilson',
    email: 'james.wilson@email.com',
    phone: '(555) 123-4567',
    date_of_birth: '1985-05-15',
    address: '123 Main St, City, State 12345',
    emergency_contact: 'Jane Wilson - (555) 123-4568',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'pat-2',
    name: 'Maria Garcia',
    email: 'maria.garcia@email.com',
    phone: '(555) 234-5678',
    date_of_birth: '1990-08-22',
    address: '456 Oak Ave, City, State 12345',
    emergency_contact: 'Carlos Garcia - (555) 234-5679',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }
];

let mockProviders = [
  {
    id: 'prov-1',
    name: 'Sarah Johnson',
    specialty: 'Family Medicine',
    email: 'dr.johnson@clinic.com',
    phone: '(555) 321-9876',
    license_number: 'MD123456',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'prov-2',
    name: 'Michael Chen',
    specialty: 'Cardiology',
    email: 'dr.chen@clinic.com',
    phone: '(555) 432-1987',
    license_number: 'MD234567',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }
];

let mockLocations = [
  {
    id: 'loc-1',
    name: 'Main Clinic',
    address: '789 Health St, Medical City, State 12345',
    phone: '(555) 987-6543',
    email: 'main@clinic.com',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'loc-2',
    name: 'Downtown Branch',
    address: '321 Center Ave, Downtown, State 12345',
    phone: '(555) 876-5432',
    email: 'downtown@clinic.com',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }
];

// API Response interfaces (matching what your Node.js/MySQL backend will return)
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// APPOINTMENTS API
export const appointmentsApi = {
  // GET /api/appointments
  async getAll(): Promise<ApiResponse<any[]>> {
    await mockDelay();
    try {
      // Join with patient, provider, and location data (simulating SQL JOINs)
      const appointmentsWithDetails = mockAppointments.map(apt => {
        const patient = mockPatients.find(p => p.id === apt.patient_id);
        const provider = mockProviders.find(p => p.id === apt.provider_id);
        const location = mockLocations.find(l => l.id === apt.location_id);
        
        return {
          id: apt.id,
          patient: patient ? {
            id: patient.id,
            name: patient.name,
            email: patient.email,
            phone: patient.phone
          } : null,
          provider: provider ? {
            id: provider.id,
            name: provider.name,
            specialty: provider.specialty
          } : null,
          location: location ? {
            id: location.id,
            name: location.name,
            address: location.address
          } : null,
          date: new Date(`${apt.appointment_date}T${apt.appointment_time}`),
          duration: `${apt.duration_minutes} minutes`,
          type: apt.appointment_type,
          status: apt.status,
          reason: apt.reason,
          providerId: apt.provider_id,
          locationId: apt.location_id
        };
      });

      return {
        success: true,
        data: appointmentsWithDetails
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch appointments'
      };
    }
  },

  // POST /api/appointments
  async create(appointmentData: any): Promise<ApiResponse<any>> {
    await mockDelay();
    try {
      const newId = `app-${Date.now()}`;
      const appointmentDate = new Date(appointmentData.date);
      
      const newAppointment = {
        id: newId,
        patient_id: appointmentData.patient.id,
        provider_id: appointmentData.providerId,
        location_id: appointmentData.locationId,
        appointment_date: appointmentDate.toISOString().split('T')[0],
        appointment_time: appointmentData.time || `${appointmentDate.getHours().toString().padStart(2, '0')}:${appointmentDate.getMinutes().toString().padStart(2, '0')}`,
        duration_minutes: parseInt(appointmentData.duration.replace(' minutes', '')),
        appointment_type: appointmentData.type,
        status: appointmentData.status.toLowerCase(),
        reason: appointmentData.reason,
        notes: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockAppointments.push(newAppointment);

      return {
        success: true,
        data: { 
          id: newId, 
          message: 'Appointment created successfully' 
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create appointment'
      };
    }
  },

  // PUT /api/appointments/:id
  async update(id: string, appointmentData: any): Promise<ApiResponse<any>> {
    await mockDelay();
    try {
      const index = mockAppointments.findIndex(apt => apt.id === id);
      if (index === -1) {
        return {
          success: false,
          error: 'Appointment not found'
        };
      }

      const appointmentDate = new Date(appointmentData.date);
      
      mockAppointments[index] = {
        ...mockAppointments[index],
        patient_id: appointmentData.patient.id,
        provider_id: appointmentData.providerId,
        location_id: appointmentData.locationId,
        appointment_date: appointmentDate.toISOString().split('T')[0],
        appointment_time: appointmentData.time || `${appointmentDate.getHours().toString().padStart(2, '0')}:${appointmentDate.getMinutes().toString().padStart(2, '0')}`,
        duration_minutes: parseInt(appointmentData.duration.replace(' minutes', '')),
        appointment_type: appointmentData.type,
        status: appointmentData.status.toLowerCase(),
        reason: appointmentData.reason,
        updated_at: new Date().toISOString()
      };

      return {
        success: true,
        data: { message: 'Appointment updated successfully' }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update appointment'
      };
    }
  },

  // DELETE /api/appointments/:id
  async delete(id: string): Promise<ApiResponse<any>> {
    await mockDelay();
    try {
      const index = mockAppointments.findIndex(apt => apt.id === id);
      if (index === -1) {
        return {
          success: false,
          error: 'Appointment not found'
        };
      }

      mockAppointments.splice(index, 1);

      return {
        success: true,
        data: { message: 'Appointment deleted successfully' }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete appointment'
      };
    }
  }
};

// PATIENTS API
export const patientsApi = {
  // GET /api/patients
  async getAll(): Promise<ApiResponse<any[]>> {
    await mockDelay();
    try {
      return {
        success: true,
        data: mockPatients
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch patients'
      };
    }
  },

  // POST /api/patients
  async create(patientData: any): Promise<ApiResponse<any>> {
    await mockDelay();
    try {
      const newId = `pat-${Date.now()}`;
      const newPatient = {
        id: newId,
        name: patientData.name,
        email: patientData.email,
        phone: patientData.phone,
        date_of_birth: patientData.dateOfBirth,
        address: patientData.address || '',
        emergency_contact: patientData.emergencyContact || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockPatients.push(newPatient);

      return {
        success: true,
        data: { id: newId, message: 'Patient created successfully' }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create patient'
      };
    }
  }
};

// PROVIDERS API
export const providersApi = {
  // GET /api/providers
  async getAll(): Promise<ApiResponse<any[]>> {
    await mockDelay();
    try {
      return {
        success: true,
        data: mockProviders
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch providers'
      };
    }
  }
};

// LOCATIONS API
export const locationsApi = {
  // GET /api/locations
  async getAll(): Promise<ApiResponse<any[]>> {
    await mockDelay();
    try {
      return {
        success: true,
        data: mockLocations
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch locations'
      };
    }
  }
};

// Helper function to show API loading states
export const showApiLoading = (message: string = 'Loading...') => {
  toast.loading(message);
};

export const hideApiLoading = () => {
  toast.dismiss();
};