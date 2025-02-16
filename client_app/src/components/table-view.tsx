import { useState, useMemo } from "react"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { dentalServices, mockPatients, appointmentStatuses } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  SlidersHorizontal,
  Edit,
  Trash2,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TableViewProps {
  appointments: any[]
  onEdit: (appointment: any) => void
  onDelete: (id: number) => void
  isAdmin: boolean
}

export function TableView({ appointments, onEdit, onDelete, isAdmin }: TableViewProps) {
  const [sortColumn, setSortColumn] = useState<string>("start")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [visibleColumns, setVisibleColumns] = useState<string[]>(["date", "patient", "service", "status", "actions"])

  const filteredAndSortedAppointments = useMemo(() => {
    return appointments
      .filter((appointment) => {
        const patient = mockPatients.find((p) => p.id === appointment.patientId)
        const service = dentalServices.find((s) => s.id === appointment.serviceId)
        const searchString = `${patient?.name} ${service?.name} ${appointment.status}`.toLowerCase()
        return (
          searchString.includes(searchTerm.toLowerCase()) &&
          (statusFilter === "all" || appointment.status === statusFilter)
        )
      })
      .sort((a, b) => {
        if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1
        if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1
        return 0
      })
  }, [appointments, searchTerm, statusFilter, sortColumn, sortDirection])

  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredAndSortedAppointments.slice(startIndex, startIndex + pageSize)
  }, [filteredAndSortedAppointments, currentPage, pageSize])

  const totalPages = Math.ceil(filteredAndSortedAppointments.length / pageSize)

  const handleSort = (column: string) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-500"
      case "Pending":
        return "bg-yellow-500"
      case "Canceled":
        return "bg-red-500"
      case "Rescheduled":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Search className="text-gray-400" />
          <Input
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {appointmentStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {["date", "patient", "service", "status", "actions"].map((column) => (
                <DropdownMenuCheckboxItem
                  key={column}
                  className="capitalize"
                  checked={visibleColumns.includes(column)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setVisibleColumns([...visibleColumns, column])
                    } else {
                      setVisibleColumns(visibleColumns.filter((col) => col !== column))
                    }
                  }}
                >
                  {column}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.includes("date") && (
                <TableHead className="cursor-pointer" onClick={() => handleSort("start")}>
                  Date/Time {sortColumn === "start" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
              )}
              {visibleColumns.includes("patient") && (
                <TableHead className="cursor-pointer" onClick={() => handleSort("patientId")}>
                  Patient {sortColumn === "patientId" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
              )}
              {visibleColumns.includes("service") && (
                <TableHead className="cursor-pointer" onClick={() => handleSort("serviceId")}>
                  Service {sortColumn === "serviceId" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
              )}
              {visibleColumns.includes("status") && (
                <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                  Status {sortColumn === "status" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
              )}
              {visibleColumns.includes("actions") && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAppointments.map((appointment) => {
              const service = dentalServices.find((s) => s.id === appointment.serviceId)
              const patient = mockPatients.find((p) => p.id === appointment.patientId)
              return (
                <TableRow key={appointment.id}>
                  {visibleColumns.includes("date") && (
                    <TableCell>
                      {format(appointment.start, "PPP")}
                      <br />
                      {format(appointment.start, "HH:mm")} - {format(appointment.end, "HH:mm")}
                    </TableCell>
                  )}
                  {visibleColumns.includes("patient") && <TableCell>{patient?.name}</TableCell>}
                  {visibleColumns.includes("service") && <TableCell>{service?.name}</TableCell>}
                  {visibleColumns.includes("status") && (
                    <TableCell>
                      <Badge className={`${getStatusColor(appointment.status)}`}>{appointment.status}</Badge>
                    </TableCell>
                  )}
                  {visibleColumns.includes("actions") && (
                    <TableCell>
                      <Button onClick={() => onEdit(appointment)} variant="outline" size="sm" className="mr-2">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      {isAdmin && (
                        <Button variant="destructive" size="sm" onClick={() => onDelete(appointment.id)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-gray-500">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, filteredAndSortedAppointments.length)} of{" "}
            {filteredAndSortedAppointments.length} results
          </p>
          <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((page) => page - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((page) => page + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

