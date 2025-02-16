import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Stethoscope, DollarSign } from "lucide-react"
import { dentalServices, dentists } from "./../DashboardComponents/mockData"




export function AddTreatmentModal({ onAddTreatment }) {
  const [newTreatment, setNewTreatment] = useState({
    patientId: "",
    date: "",
    procedure: "",
    dentist: "",
    cost: "",
    status: "Pending",
    remarks: "",
  })
  const [errors, setErrors] = useState({})
  const [isOpen, setIsOpen] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewTreatment((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const handleSelectChange = (name, value) => {
    setNewTreatment((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!newTreatment.date) newErrors.date = "Date is required"
    if (!newTreatment.procedure) newErrors.procedure = "Procedure is required"
    if (!newTreatment.dentist) newErrors.dentist = "Dentist is required"
    if (!newTreatment.cost) newErrors.cost = "Cost is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onAddTreatment({
        ...newTreatment,
        cost: Number.parseFloat(newTreatment.cost),
      })
      setNewTreatment({
        date: "",
        procedure: "",
        dentist: "",
        cost: "",
        status: "Pending",
        remarks: "",
      })
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="mt-4 text-white bg-blue-700"
        >
          <Stethoscope className="mr-2" /> Add New Treatment
        </Button>
      </DialogTrigger>
      <DialogContent className="!z-[1000] bg-white text-black">
        <DialogHeader>
          <DialogTitle>Add New Treatment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={newTreatment.date}
              onChange={handleInputChange}
              className={errors.date ? "border-red-500" : ""}
            />
            {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="procedure">Procedure</Label>
            <Select onValueChange={(value) => handleSelectChange("procedure", value)} value={newTreatment.procedure}>
              <SelectTrigger className={errors.procedure ? "border-red-500" : ""}>
                <SelectValue placeholder="Select procedure" />
              </SelectTrigger>
              <SelectContent className="!z-[1000] bg-white text-black">
                {dentalServices.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.procedure && <p className="text-red-500 text-sm">{errors.procedure}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dentist">Dentist</Label>
            <Select onValueChange={(value) => handleSelectChange("dentist", value)} value={newTreatment.dentist}>
              <SelectTrigger className={errors.dentist ? "border-red-500" : ""}>
                <SelectValue placeholder="Select dentist" />
              </SelectTrigger>
              <SelectContent>
                {dentists.map((dentist) => (
                  <SelectItem key={dentist} value={dentist}>
                    {dentist}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.dentist && <p className="text-red-500 text-sm">{errors.dentist}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost">Cost</Label>
            <div className="relative">

              <Input
                id="cost"
                name="cost"
                type="number"
                min="0"
                step="0.01"
                value={newTreatment.cost}
                onChange={handleInputChange}
                className={`pl-8 ${errors.cost ? "border-red-500" : ""}`}
              />
            </div>
            {errors.cost && <p className="text-red-500 text-sm">{errors.cost}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select onValueChange={(value) => handleSelectChange("status", value)} value={newTreatment.status}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              name="remarks"
              value={newTreatment.remarks}
              onChange={handleInputChange}
              placeholder="Add any additional notes here..."
              className="h-24"
            />
          </div>
          <Button

            className="mt-4 text-white bg-blue-700 w-full"
            type="submit" >
            <Stethoscope className="mr-2" /> Add Treatment
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

