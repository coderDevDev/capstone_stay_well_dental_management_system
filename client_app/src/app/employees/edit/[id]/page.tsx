"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateEmployee, employees } from "@/lib/mock-data"
import { User, Briefcase, DollarSign, Clock, Users, Shield } from "lucide-react"

export default function EditEmployeePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [employee, setEmployee] = useState({
    id: "",
    name: "",
    position: "",
    salary: "",
    salaryBasis: "",
    workingHours: "",
    category: "",
    sssContribution: "",
    pagibigContribution: "",
    philhealthContribution: "",
    withholdingTax: "",
  })

  useEffect(() => {
    const employeeData = employees.find((emp) => emp.id === params.id)
    if (employeeData) {
      setEmployee({
        ...employeeData,
        salary: employeeData.salary.toString(),
        workingHours: employeeData.workingHours.toString(),
        sssContribution: employeeData.sssContribution.toString(),
        pagibigContribution: employeeData.pagibigContribution.toString(),
        philhealthContribution: employeeData.philhealthContribution.toString(),
        withholdingTax: employeeData.withholdingTax.toString(),
      })
    }
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEmployee((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setEmployee((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updatedEmployee = updateEmployee({
      ...employee,
      salary: Number.parseFloat(employee.salary),
      workingHours: Number.parseInt(employee.workingHours),
      sssContribution: Number.parseFloat(employee.sssContribution),
      pagibigContribution: Number.parseFloat(employee.pagibigContribution),
      philhealthContribution: Number.parseFloat(employee.philhealthContribution),
      withholdingTax: Number.parseFloat(employee.withholdingTax),
    })
    console.log("Employee updated:", updatedEmployee)
    router.push("/employees")
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Edit Employee</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <div className="relative">
              <User className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input id="name" name="name" value={employee.name} onChange={handleChange} className="pl-8" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <div className="relative">
              <Briefcase className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="position"
                name="position"
                value={employee.position}
                onChange={handleChange}
                className="pl-8"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary">Salary</Label>
            <div className="relative">
              <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="salary"
                name="salary"
                type="number"
                value={employee.salary}
                onChange={handleChange}
                className="pl-8"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="salaryBasis">Salary Basis</Label>
            <Select
              onValueChange={(value) => handleSelectChange("salaryBasis", value)}
              defaultValue={employee.salaryBasis}
            >
              <SelectTrigger className="pl-8">
                <Clock className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <SelectValue placeholder="Select salary basis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Per Day</SelectItem>
                <SelectItem value="weekly">Per Week</SelectItem>
                <SelectItem value="monthly">Per Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="workingHours">Working Hours (per week)</Label>
            <div className="relative">
              <Clock className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="workingHours"
                name="workingHours"
                type="number"
                value={employee.workingHours}
                onChange={handleChange}
                className="pl-8"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select onValueChange={(value) => handleSelectChange("category", value)} defaultValue={employee.category}>
              <SelectTrigger className="pl-8">
                <Users className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dentist">Dentist</SelectItem>
                <SelectItem value="Assistant">Assistant</SelectItem>
                <SelectItem value="Receptionist">Receptionist</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sssContribution">SSS Contribution</Label>
            <div className="relative">
              <Shield className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="sssContribution"
                name="sssContribution"
                type="number"
                value={employee.sssContribution}
                onChange={handleChange}
                className="pl-8"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pagibigContribution">Pag-IBIG Contribution</Label>
            <div className="relative">
              <Shield className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="pagibigContribution"
                name="pagibigContribution"
                type="number"
                value={employee.pagibigContribution}
                onChange={handleChange}
                className="pl-8"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="philhealthContribution">PhilHealth Contribution</Label>
            <div className="relative">
              <Shield className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="philhealthContribution"
                name="philhealthContribution"
                type="number"
                value={employee.philhealthContribution}
                onChange={handleChange}
                className="pl-8"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="withholdingTax">Withholding Tax</Label>
            <div className="relative">
              <Shield className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="withholdingTax"
                name="withholdingTax"
                type="number"
                value={employee.withholdingTax}
                onChange={handleChange}
                className="pl-8"
                required
              />
            </div>
          </div>
        </div>
        <Button type="submit">Update Employee</Button>
      </form>
    </div>
  )
}

