import type React from "react";
import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CalendarIcon, CalendarPlus, Check, ChevronsUpDown, Plus } from 'lucide-react';
import { format } from "date-fns";
import { toZonedTime, fromZonedTime, formatInTimeZone } from "date-fns-tz";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePatients } from "@/hooks/usePatients";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { getAllPatientsAPI } from "@/services/operations/patient";
import AddPatientDialog from "../patient/AddPatientDialog";
import {
  createAppointment,
  getAppointmentsByProviderId,
} from "@/services/operations/appointment";
import { convertISTToEST, formatDateForAPI, EST_TIMEZONE, IST_TIMEZONE } from "@/utils/timezoneUtils";
import { getAllEncounterTemplatePraticeAPI } from "@/services/operations/auth"

interface AddAppointmentDialogProps {
  onAddAppointment: (appointment: any) => void;
  providers: any[];
  locations: any[];
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  prefilledData?: {
    appointmentId?: string;
    patient?: any;
    date?: Date;
    time?: string;
    providerId?: string;
    locationId?: string;
    selectedTemplateId?: string;
    type?: string;
    duration?: string;
    reason?: string;
    isReschedule?: boolean;
  };
  onDataChange?: () => void;
}

const AddAppointmentDialog: React.FC<AddAppointmentDialogProps> = ({
  onAddAppointment,
  locations,
  isOpen = false,
  onOpenChange,
  prefilledData = {},
  onDataChange,
}) => {
  const { token, user } = useSelector((state: RootState) => state.auth);
  console.log(user);
  const [open, setOpen] = useState(isOpen);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientSearchOpen, setPatientSearchOpen] = useState(false);
  const [newPatientMode, setNewPatientMode] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [serachQue, setSearchQue] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientDob, setPatientDob] = useState<Date>();
  const [appointmentDate, setAppointmentDate] = useState<Date>(
    prefilledData.date
  );
  const [appointmentTime, setAppointmentTime] = useState(
    prefilledData.time || ""
  );
  const [duration, setDuration] = useState("30 minutes");
  const [type, setType] = useState("In-person");
  const [locationId, setLocationId] = useState(prefilledData.locationId || "");
  const [reason, setReason] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(""); // For template dropdown

  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([])





  const fetchTemplatePractish = async () => {
    try {
      const response = await getAllEncounterTemplatePraticeAPI(token);
      console.log(response?.data)
      if (response?.success && Array.isArray(response.data)) {
        // Transform API response into required format
        const formattedTemplates = response.data.map((item, index) => ({
          // id: `template-${index}`,
          name: item.encounter_name,
          specialty: item.encounter_type,
          visitType: item.visit_type,
          isActive: item.is_active === 1,
          isDefault: item.is_default === 1,
          soapStructure: item.soap_structure,
          billingCodes: item.billing_codes,
          createdAt: item.created,
          updatedAt: item.created,
          id: item?.template_id
        }));

        setTemplates(formattedTemplates);
      } else {
        setTemplates([]); // Optional: clear if no data
      }
    } catch (error) {
      console.error("Error fetching encounter templates:", error);
      setTemplates([]); // Optional: handle error case
    }
  };

  useEffect(() => {
    fetchTemplatePractish()
  }
    , [])
  // Get patients from API
  const { createPatient } = usePatients();
  const [patients, setPatients] = useState<any[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);




  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2); // Month is 0-based
    const day = `0${date.getDate()}`.slice(-2);
    return `${year}-${month}-${day}`;
  };

  const transformPatientData = (rawPatient) => {
    return {
      id: `${rawPatient.patientId}`,
      name: `${rawPatient.firstname} ${rawPatient.middlename || ""} ${rawPatient.lastname
        }`.trim(),
      email: rawPatient.email,
      phone: rawPatient.phone,
      date_of_birth: formatDate(rawPatient.birthDate),
      address: rawPatient.address,
      emergency_contact: rawPatient.emergencyContact,
      created_at: rawPatient.birthDate,
      updated_at: rawPatient.lastVisit,
    };
  };

  const fetchPatients = async (page = 1, searchQuery = "") => {
    try {
      setLoading(true);
      const res = await getAllPatientsAPI(page, token, searchQuery);
      if (res?.data) {
        const transformed = res.data.map(transformPatientData);
        console.log("Transformed patients:", transformed);
        setPatients(transformed);
      }
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = () => {
    fetchPatients(1, serachQue); // Refresh the list
  };

  useEffect(() => {
    fetchPatients(1, serachQue);
  }, [serachQue]);

  // Update state when prefilled data changes
  useEffect(() => {
    console.log(prefilledData, "prefilledData")
    if (prefilledData.patient) setSelectedPatient(prefilledData.patient);
    if (prefilledData.date) setAppointmentDate(prefilledData.date);
    if (prefilledData.time) setAppointmentTime(prefilledData.time);
    if (prefilledData.locationId) setLocationId(prefilledData.locationId);
    if (prefilledData.type) setType(prefilledData.type);
    if (prefilledData.duration) {
      const formattedDuration =
        prefilledData.duration.includes("minutes") ? prefilledData.duration : `${prefilledData.duration} minutes`;
      setDuration(formattedDuration);
    }
    if (prefilledData.reason) setReason(prefilledData.reason);
    if (prefilledData.selectedTemplateId) {
      setSelectedTemplateId(prefilledData.selectedTemplateId.toString());
    }
  }, [prefilledData, templates]);

  // Sync external open state with internal state
  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const filteredPatients = useMemo(() => {
    return patients.filter(
      (patient) =>
        patient.name
          .toLowerCase()
          .includes((patientName || "").toLowerCase()) ||
        (patient.date_of_birth &&
          patient.date_of_birth.includes((patientName || "").toLowerCase()))
    );
  }, [patients, patientName]);

  // Generate time slots in IST (will be converted to EST when saving)
  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
  ];

  const handleSubmit = async () => {
    const currentPatientName = selectedPatient
      ? selectedPatient.name
      : patientName;
    let currentPatientId = selectedPatient ? selectedPatient.id : null;

    // If creating a new patient, create them first via API
    if (!selectedPatient && newPatientMode && patientName) {
      const success = await createPatient({
        name: patientName,
        email: patientEmail,
        phone: patientPhone,
        dateOfBirth: patientDob?.toISOString().split("T")[0],
      });
      if (!success) {
        return; // Error already shown by the hook
      }
      // Generate temporary ID for the appointment (real ID will come from backend)
      currentPatientId = `pat-${Date.now()}`;
    }

    if (
      !currentPatientName ||
      !appointmentDate ||
      !appointmentTime ||
      !user?.id ||
      !locationId ||
      !currentPatientId
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Convert the selected IST date/time to EST
      const estDateTime = convertISTToEST(appointmentDate, appointmentTime);

      console.log("Selected Date (IST):", appointmentDate);
      console.log("Selected Time (IST):", appointmentTime);
      console.log("Converted to EST:", estDateTime);

      // Format for API
      const formattedESTDateTime = formatDateForAPI(estDateTime);

      console.log("Formatted EST DateTime for API:", formattedESTDateTime);

      const newAppointment = {
        id: `app-${Math.random().toString(36).substring(2, 9)}`,
        patient: {
          id: currentPatientId,
          name: currentPatientName,
          phone: selectedPatient ? selectedPatient.phone : patientPhone,
          email: selectedPatient ? selectedPatient.email : patientEmail,
          dateOfBirth: selectedPatient ? selectedPatient.birthDate : patientDob,
        },
        date: formattedESTDateTime,
        duration,
        type,
        status: prefilledData ? "rescheduled" : "scheduled",
        hasBilling: false,
        providerId: user.id,
        template_id: selectedTemplateId || null,

        locationId,
        reason: reason || "General consultation",
        timezone: EST_TIMEZONE,
      };

      console.log("Final appointment object:", newAppointment);

      if(prefilledData){
console.log("prefilledData",newAppointment)
return
      }else{

        await createAppointment(newAppointment, token);
      }


      // Show success message with both IST and EST times for clarity
      const estTimeString = formatInTimeZone(estDateTime, EST_TIMEZONE, 'HH:mm');
      const istTimeString = appointmentTime;

      toast.success("Appointment created successfully", {
        description: `Appointment scheduled for ${currentPatientName} on ${appointmentDate.toLocaleDateString()} at ${istTimeString} IST (${estTimeString} EST)`,
      });

      // Reset form
      setSelectedPatient(null);
      setNewPatientMode(false);
      setPatientName("");
      setPatientPhone("");
      setPatientEmail("");
      setPatientDob(undefined);
      setAppointmentDate(undefined);
      setAppointmentTime("");
      setDuration("30 minutes");
      setType("In-person");
      setLocationId("");
      setReason("");
      setOpen(false);
      onOpenChange?.(false);
      onDataChange?.();
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Failed to create appointment. Please try again.");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
    if (!newOpen) {
      onDataChange?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="flex items-center gap-1 shadow-sm h-9 transition-all duration-300 hover:shadow-md bg-primary"
        >
          <CalendarPlus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New Appointment</span>
          <span className="sm:hidden">New</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {prefilledData.isReschedule
              ? "Reschedule Appointment"
              : "Schedule New Appointment"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Patient *</Label>
            <div className="flex gap-2">
              <Popover
                open={patientSearchOpen}
                onOpenChange={setPatientSearchOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={patientSearchOpen}
                    className="flex-1 justify-between bg-transparent"
                  >
                    {selectedPatient
                      ? selectedPatient.name
                      : patientName || "Search existing patient..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search by name or date of birth..."
                      value={serachQue}
                      onValueChange={setSearchQue}
                    />
                    <CommandList>
                      <CommandEmpty>No patient found.</CommandEmpty>
                      <CommandGroup>
                        {filteredPatients.map((patient) => (
                          <CommandItem
                            key={patient.id}
                            value={patient.name}
                            onSelect={() => {
                              setSelectedPatient(patient);
                              setPatientName(patient.name);
                              setNewPatientMode(false);
                              setPatientSearchOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedPatient?.id === patient.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div>
                              <div className="font-medium">{patient.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {patient.date_of_birth &&
                                  new Date(
                                    patient.date_of_birth
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}{" "}
                                • {patient.phone}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  setAddDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {(newPatientMode || !selectedPatient) && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPatientName">Patient Name *</Label>
                <Input
                  id="newPatientName"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter patient name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientPhone">Phone</Label>
                <Input
                  id="patientPhone"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientEmail">Email</Label>
                <Input
                  id="patientEmail"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !patientDob && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {patientDob
                        ? format(patientDob, "PPP")
                        : "Pick date of birth"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={patientDob}
                      onSelect={setPatientDob}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {selectedPatient && !newPatientMode && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-sm">
                <div className="font-medium">{selectedPatient.name}</div>
                <div className="text-muted-foreground">
                  {selectedPatient.phone} • {selectedPatient.email}
                </div>
                {selectedPatient.date_of_birth && (
                  <div className="text-muted-foreground">
                    DOB:{" "}
                    {new Date(selectedPatient.date_of_birth).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Appointment Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !appointmentDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {appointmentDate
                      ? format(appointmentDate, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={appointmentDate}
                    onSelect={setAppointmentDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointmentTime">Time (IST) *</Label>
              <Select
                value={appointmentTime}
                onValueChange={setAppointmentTime}
                disabled={prefilledData.time && !prefilledData.isReschedule}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time} IST
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15 minutes">15 minutes</SelectItem>
                  <SelectItem value="30 minutes">30 minutes</SelectItem>
                  <SelectItem value="45 minutes">45 minutes</SelectItem>
                  <SelectItem value="60 minutes">60 minutes</SelectItem>
                </SelectContent>
              </Select>

            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Appointment Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In-person">In-person</SelectItem>
                  <SelectItem value="Telehealth">Telehealth</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location *</Label>
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template">Select Template</Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>

                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.name} - {template.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Visit</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for appointment"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {prefilledData.isReschedule
              ? "Update Appointment"
              : "Schedule Appointment"}
          </Button>
        </div>
      </DialogContent>
      <AddPatientDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAddPatient={handleAddPatient}
      />
    </Dialog>
  );
};

export default AddAppointmentDialog;
