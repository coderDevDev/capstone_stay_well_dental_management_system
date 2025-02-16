"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockTreatments, mockAppointments, mockPatients } from "@/lib/mock-data"
import { format } from "date-fns"

export default function TreatmentPage() {
  const params = useParams()
  const router = useRouter()
  const appointmentId = Number.parseInt(params.id as string)
  const [treatments, setTreatments] = useState(mockTreatments.filter((t) => t.appointmentId === appointmentId))
  const [newTreatment, setNewTreatment] = useState("")

  const appointment = mockAppointments.find((a) => a.id === appointmentId)
  const patient = mockPatients.find((p) => p.id === appointment?.patientId)

  useEffect(() => {
    if (!appointment) {
      router.push("/")
    }
  }, [appointment, router])

  const handleAddTreatment = () => {
    if (newTreatment.trim() !== "") {
      const treatment = {
        id: Date.now(),
        appointmentId,
        patientId: appointment!.patientId,
        description: newTreatment,
        date: new Date(),
      }
      setTreatments([...treatments, treatment])
      setNewTreatment("")
    }
  }

  const handleDeleteTreatment = (id: number) => {
    setTreatments(treatments.filter((t) => t.id !== id))
  }

  if (!appointment || !patient) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Treatment History for {patient.name}</h1>
      <p className="mb-4">Appointment Date: {format(appointment.start, "PPP")}</p>
      <div className="mb-4">
        <Input
          type="text"
          value={newTreatment}
          onChange={(e) => setNewTreatment(e.target.value)}
          placeholder="Enter new treatment"
          className="mr-2"
        />
        <Button onClick={handleAddTreatment}>Add Treatment</Button>
      </div>
      <ul className="space-y-2">
        {treatments.map((treatment) => (
          <li key={treatment.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
            <span>
              {treatment.description} - {format(treatment.date, "PPP")}
            </span>
            <Button variant="destructive" size="sm" onClick={() => handleDeleteTreatment(treatment.id)}>
              Delete
            </Button>
          </li>
        ))}
      </ul>
      <Button onClick={() => router.back()} className="mt-4">
        Back to Appointments
      </Button>
    </div>
  )
}

