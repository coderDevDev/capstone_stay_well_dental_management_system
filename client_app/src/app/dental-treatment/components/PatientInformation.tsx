'use client';

import {
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Heart,
  Activity,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface PatientInformation {
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

interface PatientInformationProps {
  patient: PatientInformation;
}

export function PatientInformation({ patient }: PatientInformationProps) {
  return (
    <div className="space-y-6">
      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Full Name</div>
            <div className="font-medium">
              {patient.firstName} {patient.lastName}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Date of Birth</div>
            <div className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              {format(new Date(patient.dateOfBirth), 'MMMM d, yyyy')}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Email</div>
            <div className="font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              {patient.email}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Phone</div>
            <div className="font-medium flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              {patient.phone}
            </div>
          </div>
          <div className="space-y-1 col-span-2">
            <div className="text-sm text-gray-500">Address</div>
            <div className="font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              {patient.address}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical History Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Medical History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm text-gray-500 mb-2">Allergies</h3>
            <div className="flex flex-wrap gap-2">
              {/* {patient.medicalHistory.allergies.map(allergy => (
                <Badge
                  key={allergy}
                  variant="secondary"
                  className="bg-red-50 text-red-700 border-red-200">
                  {allergy}
                </Badge>
              ))} */}
            </div>
          </div>
          <div>
            <h3 className="text-sm text-gray-500 mb-2">Medical Conditions</h3>
            <div className="flex flex-wrap gap-2">
              {/* {patient.medicalHistory.conditions.map(condition => (
                <Badge
                  key={condition}
                  variant="secondary"
                  className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  {condition}
                </Badge>
              ))} */}
            </div>
          </div>
          <div>
            <h3 className="text-sm text-gray-500 mb-2">Current Medications</h3>
            <div className="flex flex-wrap gap-2">
              {/* {patient.medicalHistory.medications.map(medication => (
                <Badge
                  key={medication}
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 border-blue-200">
                  {medication}
                </Badge>
              ))} */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact Card */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Name</div>
            <div className="font-medium">{patient.emergencyContact.name}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Relationship</div>
            <div className="font-medium">
              {patient.emergencyContact.relationship}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Phone</div>
            <div className="font-medium flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              {patient.emergencyContact.phone}
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
