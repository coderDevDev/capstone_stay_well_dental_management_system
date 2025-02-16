"use client"

import { useState } from "react"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartWrapper } from "@/data-chart/wrapper"
import Chart1 from "@/data-chart/bar/2"
import Chart2 from "@/data-chart/line/1"

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string>("")

  return (
    <div className="hidden flex-col md:flex">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <div className="flex items-center space-x-4">
          <Select onValueChange={setSelectedReport}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select report" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="salary">Salary Report</SelectItem>
              <SelectItem value="attendance">Attendance Report</SelectItem>
            </SelectContent>
          </Select>
          <Button>Generate Report</Button>
        </div>
        {selectedReport === "salary" && (
          <Card>
            <CardHeader>
              <CardTitle>Salary Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartWrapper content={Chart1} className="aspect-[4/3]" title="Salary Distribution by Department" />
            </CardContent>
          </Card>
        )}
        {selectedReport === "attendance" && (
          <Card>
            <CardHeader>
              <CardTitle>Attendance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartWrapper content={Chart2} className="aspect-[4/3]" title="Monthly Attendance Trends" />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

