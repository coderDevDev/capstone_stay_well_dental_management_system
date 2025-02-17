'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooth, ToothChart } from './components/ToothChart';
import { TreatmentHistory } from './components/TreatmentHistory';
import { X } from 'lucide-react';

import { PatientInformation as PatientInformationType } from './components/PatientInformation';
import {
  treatmentService,
  patientService,
  appointmentService,
  Treatment,
  TreatmentFormValues
} from '@/services/api';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AppointmentHistory } from './components/AppointmentHistory';
import { Timeline } from './components/Timeline';
import { AppointmentHistoryView } from './components/AppointmentHistoryView';
import { PatientInformation } from '@/services/api';
import { AddTreatmentForm } from './components/AddTreatmentForm';
import { S } from 'dist/assets/TitleCard-tkHnMDXZ';

interface Appointment {
  id: string;
  start: string;
  end: string;
  service_name: string;
  status: string;
  service_fee: number;
  treatments?: Treatment[];
}

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export default function DentalTreatmentPage() {
  const params = useParams();

  const patientId = params?.patient_id?.toString();

  const [isLoaded, setIsLoaded] = useState(false);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedTeeth, setSelectedTeeth] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'medical' | 'cosmetic'>('medical');
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [toothStatuses, setToothStatuses] = useState<Record<string, string>>(
    {}
  );
  const [patient, setPatient] = useState<PatientInformation | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [treatmentMap, setTreatmentMap] = useState<Record<string, string>>({});
  const [appointmentTreatments, setAppointmentTreatments] = useState<
    Treatment[]
  >([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchAppointments = useCallback(async () => {
    try {
      const response = await appointmentService.getByPatientId(patientId);
      if (response.success && Array.isArray(response.data)) {
        setAppointments(response.data);
      } else {
        throw new Error('Invalid appointments data');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to fetch appointments');
    }
  }, [patientId]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const fetchData = useCallback(async () => {
    try {
      const response = await treatmentService.getAll(patientId);

      console.log({ response });
      setTreatments(response);
    } catch (error: any) {
      console.error('Error fetching treatments:', error);
      toast.error(
        error.response?.data?.message || 'Failed to fetch treatments'
      );
    }
  }, [patientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    loadTreatments();
    const loadPatient = async () => {
      try {
        const response: ApiResponse<PatientInformation> =
          await patientService.getById(patientId);
        setPatient(response.data);
      } catch (error) {
        console.error('Error loading patient:', error);
        toast.error('Failed to load patient information');
      }
    };
    loadPatient();
  }, [patientId]);

  useEffect(() => {
    const loadTreatmentMap = async () => {
      try {
        const treatments = await treatmentService.getAll(patientId);

        const map = treatments.data.reduce((acc, treatment) => {
          const teeth = treatment.tooth_numbers?.split(',') || [];
          const treatmentTypes = treatment.tooth_treatments?.split(',') || [];
          teeth.forEach((tooth, index) => {
            acc[tooth] = treatmentTypes[index];
          });
          return acc;
        }, {} as Record<string, string>);

        console.log({ jhams: treatments.data });
        setTreatmentMap(treatments.data);
      } catch (error: any) {
        console.error('Error loading treatment map:', error);
        toast.error(
          error.response?.data?.message || 'Failed to load treatment map'
        );
      }
    };
    loadTreatmentMap();
  }, [patientId, treatments]);

  useEffect(() => {
    const loadLatestAppointment = async () => {
      try {
        const response = await appointmentService.getByPatientId(patientId);
        if (!response.success || !Array.isArray(response.data)) {
          throw new Error('Invalid appointments data');
        }

        const appointments = response.data;
        // Find latest confirmed appointment
        const latestConfirmed = appointments
          .filter(
            (app: Appointment) => app.status.toLowerCase() === 'confirmed'
          )
          .sort(
            (a: Appointment, b: Appointment) =>
              new Date(b.start).getTime() - new Date(a.start).getTime()
          )[0];

        if (latestConfirmed) {
          setSelectedAppointmentId(latestConfirmed.id);

          // Load any existing treatment for this appointment
          const treatment = await treatmentService.getByAppointmentId(
            latestConfirmed.id
          );
          if (treatment) {
            const teeth = treatment.tooth_numbers?.split(',') || [];
            setSelectedTeeth(new Set(teeth));
          }
        }
      } catch (error) {
        console.error('Error loading latest appointment:', error);
        toast.error('Failed to load latest appointment');
      }
    };

    loadLatestAppointment();
  }, [patientId]);

  // Load treatments for selected appointment
  useEffect(() => {
    const loadAppointmentTreatments = async () => {
      if (!selectedAppointmentId) return;

      try {
        const treatment = await treatmentService.getByAppointmentId(
          selectedAppointmentId
        );
        if (treatment) {
          setAppointmentTreatments([treatment]);
        } else {
          setAppointmentTreatments([]); // Clear treatments if none found
        }
      } catch (error) {
        console.error('Error loading appointment treatments:', error);
        toast.error('Failed to load treatments');
      }
    };

    loadAppointmentTreatments();
  }, [selectedAppointmentId]); // Reload when appointment changes

  const loadTreatments = async () => {
    try {
      setIsLoaded(false);
      const data = await treatmentService.getAll(patientId);
      console.log({ data });

      setTreatments(data);

      // Update treatment map

      const treatmentsArray = Array.isArray(data) ? data : [];

      const map = treatmentsArray.reduce(
        (acc: Record<string, string>, treatment: Treatment) => {
          if (treatment.toothTreatments) {
            treatment.toothTreatments.forEach(tt => {
              acc[tt.toothNumber] = tt.treatment;
            });
          }
          return acc;
        },
        {}
      );
      setTreatmentMap(map);
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading treatments:', error);
      toast.error('Failed to load treatments');
    }
  };

  const handleToothSelect = (tooth: Tooth) => {
    setSelectedTeeth(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tooth.number)) {
        newSet.delete(tooth.number);
      } else {
        newSet.add(tooth.number);
      }
      return newSet;
    });
  };

  const handleClearSelection = () => {
    setSelectedTeeth(new Set());
  };

  const handleAppointmentSelect = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    // Switch to medical record tab
    const medicalTab = document.querySelector(
      '[value="medical-record"]'
    ) as HTMLButtonElement;
    if (medicalTab) {
      medicalTab.click();
    }
  };

  // Create a function to refresh all data
  const refreshAllData = async () => {
    try {
      console.log('refreshAllData');
      await Promise.all([
        fetchData(), // Refresh treatments
        loadTreatments(), // Refresh treatment map
        fetchAppointments() // Refresh appointments
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    }
  };

  const handleAddTreatment = async (data: TreatmentFormValues) => {
    if (!selectedAppointmentId) {
      toast.error('Please select an appointment first');
      return;
    }

    try {
      await treatmentService.create({
        ...data,
        patientId,
        appointmentId: selectedAppointmentId
      });

      await refreshAllData(); // Refresh all data after create
      setSelectedTeeth(new Set());
      setIsAddModalOpen(false);
      toast.success('Treatment added successfully');
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error adding treatment:', error);
        toast.error(error.message || 'Failed to add treatment');
      }
    }
  };

  const handleEditTreatment = async (treatment: Treatment) => {
    try {
      await treatmentService.update(treatment.id, {
        dentist: treatment.dentist_id,
        notes: treatment.notes,
        type: treatment.type,
        toothTreatments: treatment.toothTreatments,
        medications: treatment.medications
      });

      await refreshAllData(); // Refresh all data after update
      toast.success('Treatment updated successfully');
    } catch (error: any) {
      console.error('Error updating treatment:', error);
      toast.error(
        error.response?.data?.message || 'Failed to update treatment'
      );
    }
  };

  const handleDeleteTreatment = async (treatmentId: string) => {
    try {
      await treatmentService.delete(treatmentId);
      await refreshAllData(); // Refresh all data after delete
      toast.success('Treatment deleted successfully');
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error deleting treatment:', error);
        toast.error(error.message || 'Failed to delete treatment');
      }
    }
  };

  const handleViewTreatment = useCallback(async (appointmentId: string) => {
    try {
      setSelectedAppointmentId(appointmentId);
      const treatment = await treatmentService.getByAppointmentId(
        appointmentId
      );
      if (treatment) {
        const teeth = treatment.tooth_numbers?.split(',') || [];
        setSelectedTeeth(new Set(teeth));
        setAppointmentTreatments([treatment]); // Update treatments immediately
      } else {
        setSelectedTeeth(new Set());
        setAppointmentTreatments([]); // Clear treatments if none found
      }
    } catch (error) {
      console.error('Error viewing treatment:', error);
      toast.error('Failed to load treatment');
    }
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6 bg-white rounded-lg p-4">
      {/* Patient Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
            <img
              src="https://cdn-icons-png.freepik.com/512/1446/1446879.png?ga=GA1.1.1710848127.1724072387"
              alt="Patient"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">
              {patient?.firstName} {patient?.lastName}
            </h1>
            {/* <p className="text-gray-500">Have uneven jawline</p> */}
          </div>
        </div>
        {/* <div className="flex items-center gap-4">
          <Button variant="outline">Edit</Button>
          <Button>Create Appointment</Button>
        </div> */}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="patient-info" className="w-full">
        <TabsList className="w-full border-b flex h-auto p-0 bg-transparent gap-6 justify-start">
          <TabsTrigger
            value="patient-info"
            className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
            Patient Information
          </TabsTrigger>
          <TabsTrigger
            value="appointment-history"
            className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
            Appointment History
          </TabsTrigger>
          <TabsTrigger
            value="medical-treatment"
            className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
            Medical Treatment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patient-info">
          {patient ? (
            <PatientInformationType patient={patient} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              Loading patient information...
            </div>
          )}
        </TabsContent>

        <TabsContent value="appointment-history">
          <Card>
            <CardHeader>
              <CardTitle>Appointment History</CardTitle>
            </CardHeader>
            <CardContent>
              <AppointmentHistoryView
                appointments={appointments}
                treatments={treatments.data}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical-treatment">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Treatment History */}
            <div className="md:col-span-7">
              <Card>
                <CardHeader>
                  <CardTitle>Medical Treatment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Timeline
                    treatments={treatments.data || []}
                    showAppointmentInfo={false}
                    onEdit={handleEditTreatment}
                    onDelete={handleDeleteTreatment}
                    appointments={appointments}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Tooth Chart */}
            <div className="md:col-span-5">
              <Card>
                <CardHeader>
                  <CardTitle>Odontogram</CardTitle>
                  <CardDescription>
                    {selectedTeeth.size > 0
                      ? `Selected Teeth: ${Array.from(selectedTeeth).join(
                          ', '
                        )}`
                      : 'Select teeth to add treatment'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ToothChart
                    onToothSelect={handleToothSelect}
                    selectedTeeth={selectedTeeth}
                    clearSelection={handleClearSelection}
                    treatments={treatmentMap}
                    patientId={patientId}
                    appointmentId={selectedAppointmentId}
                    activeTab={activeTab}
                    onAddTreatment={handleAddTreatment}
                    onOpenAddModal={() => setIsAddModalOpen(true)}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <AddTreatmentForm
        selectedTeeth={selectedTeeth}
        onSubmit={handleAddTreatment}
        onCancel={() => setIsAddModalOpen(false)}
        activeTab={activeTab}
        patientId={patientId}
        appointments={appointments}
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        treatmentsHistory={treatments.data}
      />
    </div>
  );
}
