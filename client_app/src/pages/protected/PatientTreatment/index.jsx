"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { User, Phone, Mail, Calendar, Stethoscope } from "lucide-react"
import { AddTreatmentModal } from "./AddTreatment"
import { Badge } from "@/components/ui/badge"

// Mock patient data
const patientData = {
  name: "John Doe",
  age: 35,
  contact: "+1 (555) 123-4567",
  email: "john.doe@example.com",
}

// Mock treatment history
const initialTreatments = [
  {
    id: 1,
    date: "2023-05-15",
    procedure: "Dental Cleaning",
    dentist: "Dr. Emma Smith",
    cost: 150,
    status: "Completed",
    remarks: "Regular checkup",
  },
  {
    id: 2,
    date: "2023-06-20",
    procedure: "Cavity Filling",
    dentist: "Dr. Liam Johnson",
    cost: 200,
    status: "Completed",
    remarks: "Two small cavities filled",
  },
  {
    id: 3,
    date: "2023-07-10",
    procedure: "Root Canal",
    dentist: "Dr. Olivia Williams",
    cost: 800,
    status: "Pending",
    remarks: "Scheduled for next week",
  },
]

export default function PatientTreatment() {
  const [treatments, setTreatments] = useState(initialTreatments)

  const handleAddTreatment = (newTreatment) => {
    setTreatments((prev) => [...prev, { id: prev.length + 1, ...newTreatment }])
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Patient Dental Treatment</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2" /> Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <User className="mr-2 text-primary" />
              <div>
                <p className="font-semibold">Name:</p>
                <p>{patientData.name}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="mr-2 text-primary" />
              <div>
                <p className="font-semibold">Age:</p>
                <p>{patientData.age}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Phone className="mr-2 text-primary" />
              <div>
                <p className="font-semibold">Contact:</p>
                <p>{patientData.contact}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Mail className="mr-2 text-primary" />
              <div>
                <p className="font-semibold">Email:</p>
                <p>{patientData.email}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Stethoscope className="mr-2" /> Treatment History
          </CardTitle>
          <AddTreatmentModal onAddTreatment={handleAddTreatment} />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Procedure</TableHead>
                <TableHead>Dentist</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {treatments.map((treatment) => (
                <TableRow key={treatment.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>{treatment.date}</TableCell>
                  <TableCell>{treatment.procedure}</TableCell>
                  <TableCell>{treatment.dentist}</TableCell>
                  <TableCell>${treatment.cost.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={treatment.status === "Completed" ? "success" : "warning"}>{treatment.status}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={treatment.remarks}>
                    {treatment.remarks}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

