"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarPlus, Search, Users, CalendarDays, Filter, CalendarIcon, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useNavigate } from "react-router-dom"
import AppointmentCard from "@/components/appointments/AppointmentCard"
import type { Provider, Location } from "@/components/appointments/appointmentData"
import ProviderCalendarView from "@/components/appointments/ProviderCalendarView"
import MonthCalendarView from "@/components/appointments/MonthCalendarView"
import LocationSelector from "@/components/appointments/LocationSelector"
import AddAppointmentDialog from "@/components/appointments/AddAppointmentDialog"
import AppointmentDetailsDialog from "@/components/appointments/AppointmentDetailsDialog"
import { useAppointments } from "@/hooks/useAppointments"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { getLocationsByProviderId } from "@/services/operations/location"
import { getAppointmentsByProviderId } from "@/services/operations/appointment"
import { SmartEncounterWorkflow } from "@/components/encounter/SmartEncounterWorkflow"

const Appointments: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>(undefined)
  const [viewMode, setViewMode] = useState<"list" | "week" | "month">("list")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(true)
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState<boolean>(false)
  const [prefilledBookingData, setPrefilledBookingData] = useState<{
    appointmentId?: string
    patient?: any
    date?: Date
    time?: string
    providerId?: string
    locationId?: string
    type?: string
    duration?: string
    reason?: string
    selectedTemplateId?: string
    isReschedule?: boolean
  }>({})
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isEncounterWorkflowOpen, setIsEncounterWorkflowOpen] = useState(false)
  const [encounterPrefilledData, setEncounterPrefilledData] = useState<any>(null)
  const navigate = useNavigate()

  const { loading: appointmentsLoading, createAppointment, updateAppointment, deleteAppointment } = useAppointments()

  const { user, token } = useSelector((state: RootState) => state.auth)
  const [locations, setLocations] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])

  const fetchLocations = async () => {
    if (!user?.id || !token) return
    const data = await getLocationsByProviderId(user.id, token)
    console.log(data)
    if (data && Array.isArray(data)) {
      const transformed = data.map((loc: any, index: number) => ({
        id: `${loc.location_id}`,
        name: loc.location_name || "Unknown",
        address: `${loc.location_address_line1 || ""}, ${loc.location_address_line2 || ""}, ${loc.location_state || ""}, ${loc.location_country || ""} - ${loc.location_zip_code || ""}`,
        phone: loc.location_phone || "",
        color: "#dc2626",
      }))
      setLocations(transformed)
    }
  }

  useEffect(() => {

    fetchAppoinment();

  }, [date])

  const fetchAppoinment = async () => {
    if (!user?.id || !token) return;

    const formattedDate = date ? new Date(date).toISOString().split("T")[0] : "";

    console.log("SELECTED DATE", date); // This will show the full date string
    console.log("Query Date", formattedDate); // This will show yyyy-mm-dd

    const data = await getAppointmentsByProviderId(user.id, token, formattedDate);
    console.log("Raw Data:", data);

    if (data) {
      const transformed = data.map((item) => {
        const appointmentDate = new Date(item.date);

        return {
          ...item,
          date: appointmentDate,
          providerId: String(item.providerId),
          locationId: String(item.locationId),
        };
      });

      console.log("Transformed Appointments:", transformed);
      setAppointments(transformed);
    }
  };


  useEffect(() => {
    fetchLocations()
    fetchAppoinment()
  }, [])

  // Helper function to compare dates (ignoring time)
  const isSameDate = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  // Helper functions defined early to avoid hoisting issues
  const getCurrentProvider = (): Provider => {
    return {
      id: String(user?.id) || "current-user",
      name: user?.firstname || "Current Provider",
      role: user?.role || "Provider",
      specialty: user?.specialty || "General",
      color: "#dc2626",
      availability: {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      },
    }
  }

  const getLocationById = (locationId: string): Location => {
    const location = locations.find((location) => location.id === locationId)
    return (
      location || {
        id: "unknown",
        name: "Unknown Location",
        address: "Unknown Address",
        phone: "Unknown",
        color: "#cccccc",
      }
    )
  }

  // Filter appointments for current user only
  const filteredAppointments = appointments
    .filter((appointment) => {
      let matchesDate = true
      let matchesLocation = true
      let matchesSearch = true
      let matchesProvider = true

      // Only show appointments for the current logged-in user
      // Convert both to strings for consistent comparison
      if (user?.id) {
        matchesProvider = String(appointment.providerId) === String(user.id)
      }

      console.log("Filter Debug:", {
        selectedDate: date,
        appointmentDate: appointment.date,
        appointmentProviderId: appointment.providerId,
        userProviderId: user?.id,
        matchesProvider,
        appointmentLocationId: appointment.locationId,
        selectedLocation,
      })

      // Date filtering - only filter if a date is selected
      if (date && appointment.date) {
        matchesDate = isSameDate(appointment.date, date)
      }

      // Location filtering - only filter if a location is selected
      if (selectedLocation) {
        matchesLocation = String(appointment.locationId) === String(selectedLocation)
      }

      // Search filtering
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        matchesSearch =
          appointment.patient?.name?.toLowerCase().includes(query) ||
          getCurrentProvider().name.toLowerCase().includes(query) ||
          getLocationById(String(appointment.locationId)).name.toLowerCase().includes(query)
      }

      const shouldShow = matchesDate && matchesProvider && matchesLocation && matchesSearch

      console.log("Appointment Filter Result:", {
        appointmentId: appointment.id,
        matchesDate,
        matchesProvider,
        matchesLocation,
        matchesSearch,
        shouldShow,
      })

      return shouldShow
    })
    .sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0))

  console.log("Final Filtered Appointments:", filteredAppointments)

  const handleAddAppointment = async (appointmentData: any) => {
    console.log("appointmentData",appointmentData)
    
    // Always set the current user as the provider
    const appointmentWithProvider = {
      ...appointmentData,
      providerId: user?.id,
    }

    if (prefilledBookingData.isReschedule && prefilledBookingData.appointmentId) {
      // Update existing appointment via API
      const success = await updateAppointment(prefilledBookingData.appointmentId, appointmentWithProvider)
      if (success) {
        setIsBookingDialogOpen(false)
        setPrefilledBookingData({})
        // Refresh appointments after update
        fetchAppoinment()
      }
    } else {
      // Create new appointment via API
      const success = await createAppointment(appointmentWithProvider)
      if (success) {
        setIsBookingDialogOpen(false)
        setPrefilledBookingData({})
        // Refresh appointments after creation
        fetchAppoinment()
      }
    }
  }

  const handleSlotClick = (selectedDate: Date, selectedTime?: string) => {
    // Pre-fill the appointment dialog with selected date and time
    console.log(selectedTime)
    setPrefilledBookingData({
      date: selectedDate,
      time: selectedTime,
      providerId: user?.id, // Always use current user
      locationId: selectedLocation,
    })
    setIsBookingDialogOpen(true)
  }

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment)
    setIsDetailsDialogOpen(true)
  }

  const handleRescheduleAppointment = (appointment: any) => {
    // Format time properly for the dropdown
    console.log(appointment)
    const timeString = `${appointment.date.getHours().toString().padStart(2, "0")}:${appointment.date.getMinutes().toString().padStart(2, "0")}`
    setPrefilledBookingData({
      appointmentId: appointment.id,
      patient: appointment.patient,
      date: appointment.date,
      time: timeString,
      providerId: user?.id, // Always use current user
      locationId: appointment.locationId,
      type: appointment.type,
      duration: appointment.duration,
      reason: appointment.reason,
      selectedTemplateId: appointment.template?.template_id,
      isReschedule: true,
    })
    setIsBookingDialogOpen(true)
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    const success = await deleteAppointment(appointmentId)
    if (success) {
      setIsDetailsDialogOpen(false)
      setSelectedAppointment(null)
      // Refresh appointments after deletion
      fetchAppoinment()
    }
  }

  const handleBillingCreated = (appointmentId: string, billingData: any) => {
    // Removed billing functionality - will implement later
    console.log("Billing creation skipped for now", appointmentId, billingData)
  }

  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen)
  }

  const handleStartEncounter = (appointment: any) => {
    setEncounterPrefilledData({
      patientId: appointment.patient?.id,
      patientName: appointment.patient?.name,
      appointmentId: appointment.id,
      reason: appointment.reason,
      type: appointment.type
    })
    setIsEncounterWorkflowOpen(true)
  }

  const handleEncounterComplete = (encounterData: any) => {
    console.log("Encounter completed from appointment:", encounterData)
    setIsEncounterWorkflowOpen(false)
    setEncounterPrefilledData(null)
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight">My Appointments</h1>
          <CalendarIcon className="h-5 w-5 text-primary animate-bounce-soft" />
        </div>
        <div className="flex items-center gap-2">
          <Tabs
            defaultValue={viewMode}
            onValueChange={(value) => setViewMode(value as "list" | "week" | "month")}
            className="mr-2"
          >
            <TabsList className="h-9">
              <TabsTrigger value="list" className="flex items-center gap-1 text-xs">
                <Users className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">List</span>
              </TabsTrigger>
              <TabsTrigger value="week" className="flex items-center gap-1 text-xs">
                <CalendarDays className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Week</span>
              </TabsTrigger>
              <TabsTrigger value="month" className="flex items-center gap-1 text-xs">
                <CalendarIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Month</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <AddAppointmentDialog
            onAddAppointment={handleAddAppointment}
            providers={[getCurrentProvider()]} // Only current user as provider
            locations={locations}
            isOpen={isBookingDialogOpen}
            onOpenChange={setIsBookingDialogOpen}
            prefilledData={prefilledBookingData}
            onDataChange={() => setPrefilledBookingData({})}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        <div
          className={`transition-all duration-300 ${isFiltersOpen ? "opacity-100" : "opacity-0 h-0 overflow-hidden lg:opacity-100 lg:h-auto lg:overflow-visible"}`}
        >
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search appointments..."
                className="pl-8 h-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Card className="border shadow-sm overflow-hidden">
              <CardHeader className="p-3 border-b bg-muted/5">
                <CardTitle className="text-sm flex justify-between items-center">
                  <span>Date</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {date
                      ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "Select a date"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border-none mx-auto"
                  showOutsideDays
                />
              </CardContent>
            </Card>

            <LocationSelector
              locations={locations}
              selectedLocation={selectedLocation}
              onSelectLocation={setSelectedLocation}
            />

            {/* Show current provider info */}
            <div className="rounded-lg border p-3 bg-muted/5 animate-fadeIn shadow-sm">
              <h3 className="font-medium mb-1 text-sm">{getCurrentProvider().name}</h3>
              <div className="text-xs text-muted-foreground">
                ID: {getCurrentProvider().id} | {getCurrentProvider().specialty}
              </div>
            </div>

            {selectedLocation && (
              <div className="rounded-lg border p-3 bg-muted/5 animate-fadeIn shadow-sm">
                <div className="flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-sm">{getLocationById(selectedLocation).name}</h3>
                    <div className="text-xs text-muted-foreground">{getLocationById(selectedLocation).address}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Debug info - remove in production */}
            <div className="rounded-lg border p-3 bg-yellow-50 text-xs">
              <div>Total Appointments: {appointments.length}</div>
              <div>Filtered Appointments: {filteredAppointments.length}</div>
              <div>Selected Date: {date?.toDateString()}</div>
              <div>User ID: {user?.id}</div>
              <div>Selected Location: {selectedLocation}</div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4 lg:hidden">
            <Button variant="outline" size="sm" onClick={toggleFilters} className="text-xs bg-transparent">
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              {isFiltersOpen ? "Hide Filters" : "Show Filters"}
            </Button>
            <div className="text-sm font-medium">
              {date && (
                <span className="bg-primary/5 px-2 py-1 rounded-md">
                  {date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>

          {viewMode === "list" ? (
            <div className="bg-white rounded-xl shadow-md border p-4 animate-slideIn">
              <h2 className="text-lg font-medium mb-4 flex items-baseline">
                <span className="text-primary mr-2">My Appointments</span>
                {date && (
                  <span className="text-sm text-muted-foreground">
                    for{" "}
                    {date.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                )}
              </h2>

              {filteredAppointments.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
                  {filteredAppointments.map((appointment) => (
                     <AppointmentCard
                       key={appointment.id}
                       appointment={appointment}
                       provider={getCurrentProvider()}
                       location={getLocationById(String(appointment.locationId))}
                       onBillingCreated={(billingData) => handleBillingCreated(appointment.id, billingData)}
                       navigate={navigate}
                       onAppointmentClick={handleAppointmentClick}
                       onStartEncounter={handleStartEncounter}
                     />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center bg-muted/5 rounded-xl border border-dashed">
                  <CalendarDays className="h-12 w-12 mx-auto mb-3 text-primary/50 animate-pulse-light" />
                  <p className="text-muted-foreground mb-3">
                    {date
                      ? `No appointments found for ${date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                      : "No appointments found for the selected criteria."}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1 bg-transparent"
                    onClick={() => setIsBookingDialogOpen(true)}
                  >
                    <CalendarPlus className="mr-1.5 h-3.5 w-3.5" />
                    Schedule an appointment
                  </Button>
                </div>
              )}
            </div>
          ) : viewMode === "week" ? (
            <ProviderCalendarView
              providers={[getCurrentProvider()]} // Only current user
              appointments={filteredAppointments}
              selectedDate={date || new Date()}
              onSlotClick={handleSlotClick}
              onAppointmentClick={handleAppointmentClick}
            />
          ) : (
            <MonthCalendarView
              appointments={filteredAppointments}
              selectedDate={date || new Date()}
              onDateClick={(date) => handleSlotClick(date)}
              onAppointmentClick={handleAppointmentClick}
            />
          )}
        </div>
      </div>

      {/* Appointment Details Dialog */}
      {selectedAppointment && (
        <AppointmentDetailsDialog
          appointment={selectedAppointment}
          provider={getCurrentProvider()}
          location={getLocationById(String(selectedAppointment.locationId))}
          isOpen={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          onReschedule={handleRescheduleAppointment}
          onCancel={handleCancelAppointment}
        />
      )}

      {/* Smart Encounter Workflow */}
      <SmartEncounterWorkflow
        isOpen={isEncounterWorkflowOpen}
        onClose={() => setIsEncounterWorkflowOpen(false)}
        onEncounterComplete={handleEncounterComplete}
      />
    </div>
  )
}

export default Appointments
