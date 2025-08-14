import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarCheck, 
  FileText, 
  MessageSquare, 
  HeartPulse, 
  PillBottle, 
  Clock,
  ChevronRight
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

// Mock patient data
const patientData = {
  name: "Patient User",
  email: "patient@example.com",
  dateOfBirth: "1985-06-15",
  gender: "Female",
  bloodType: "A+",
  height: "5'7\"",
  weight: "155 lbs",
  allergies: ["Penicillin", "Peanuts"],
  conditions: ["Hypertension", "Asthma"],
  recentVitals: {
    bloodPressure: "128/82",
    heartRate: "78 bpm",
    temperature: "98.6°F",
    oxygenSaturation: "97%",
    glucoseLevel: "110 mg/dL",
    lastUpdated: "2 hours ago"
  }
};

// Mock messages data
const messagesData = [
  {
    id: 1,
    sender: "Dr. Sarah Johnson",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    content: "Hello, I've reviewed your recent lab results. Your cholesterol levels have improved, but we should continue monitoring your blood pressure.",
    timestamp: "Today, 10:30 AM",
    read: false
  },
  {
    id: 2,
    sender: "Nurse Williams",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    content: "Your prescription refill has been approved. You can pick it up at the pharmacy tomorrow.",
    timestamp: "Yesterday, 3:45 PM",
    read: true
  },
  {
    id: 3,
    sender: "Dr. Sarah Johnson",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    content: "Please remember to check your blood pressure daily and log the readings in your patient portal.",
    timestamp: "3 days ago",
    read: true
  }
];

// Mock appointments data
const appointmentsData = [
  {
    id: 1,
    doctor: "Dr. Sarah Johnson",
    specialty: "Primary Care",
    date: "May 15, 2024",
    time: "10:30 AM",
    type: "Follow-up",
    location: "Telehealth",
    status: "Upcoming"
  },
  {
    id: 2,
    doctor: "Dr. Michael Chen",
    specialty: "Cardiology",
    date: "June 2, 2024",
    time: "2:15 PM",
    type: "Consultation",
    location: "Main Clinic - Room 305",
    status: "Scheduled"
  },
  {
    id: 3,
    doctor: "Dr. Sarah Johnson",
    specialty: "Primary Care",
    date: "April 10, 2024",
    time: "9:00 AM",
    type: "Annual Physical",
    location: "Main Clinic - Room 102",
    status: "Completed"
  }
];

// Mock medications data
const medicationsData = [
  {
    id: 1,
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    purpose: "Blood pressure",
    prescribedBy: "Dr. Sarah Johnson",
    startDate: "Jan 15, 2024",
    refillsRemaining: 2,
    instructions: "Take in the morning with food"
  },
  {
    id: 2,
    name: "Albuterol",
    dosage: "90mcg",
    frequency: "As needed",
    purpose: "Asthma",
    prescribedBy: "Dr. Sarah Johnson",
    startDate: "Nov 10, 2023",
    refillsRemaining: 1,
    instructions: "Use inhaler as needed for shortness of breath"
  }
];

const PatientPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Patient Portal</h1>
        <Badge variant="outline" className="bg-blue-100 text-blue-800">Patient View</Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle>Patient Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-6">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={user?.avatar || "https://randomuser.me/api/portraits/women/67.jpg"} alt={user?.name || patientData.name} />
              <AvatarFallback>{(user?.name || patientData.name).split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-semibold">{user?.name || `${user?.firstName} ${user?.lastName}` || patientData.name}</h3>
            <p className="text-sm text-muted-foreground">{patientData.dateOfBirth} • {patientData.gender}</p>
            
            <div className="w-full mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Blood Type:</span>
                <span className="font-medium">{patientData.bloodType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Height:</span>
                <span className="font-medium">{patientData.height}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Weight:</span>
                <span className="font-medium">{patientData.weight}</span>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Allergies</p>
                <div className="flex flex-wrap gap-2">
                  {patientData.allergies.map((allergy, index) => (
                    <Badge key={index} variant="secondary">{allergy}</Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <p className="text-sm font-medium">Medical Conditions</p>
                <div className="flex flex-wrap gap-2">
                  {patientData.conditions.map((condition, index) => (
                    <Badge key={index} variant="outline">{condition}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Update Profile</Button>
          </CardFooter>
        </Card>
        
        <div className="md:col-span-3 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Recent Vitals</CardTitle>
                  <CardDescription>Last updated: {patientData.recentVitals.lastUpdated}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Blood Pressure</p>
                      <p className="text-lg font-semibold">{patientData.recentVitals.bloodPressure}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Heart Rate</p>
                      <p className="text-lg font-semibold">{patientData.recentVitals.heartRate}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Temperature</p>
                      <p className="text-lg font-semibold">{patientData.recentVitals.temperature}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Oxygen</p>
                      <p className="text-lg font-semibold">{patientData.recentVitals.oxygenSaturation}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Glucose</p>
                      <p className="text-lg font-semibold">{patientData.recentVitals.glucoseLevel}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center">
                        <CalendarCheck className="h-5 w-5 mr-2 text-primary" />
                        Upcoming Appointments
                      </CardTitle>
                      <Button variant="link" size="sm" className="px-0" onClick={() => setActiveTab("appointments")}>
                        View All <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {appointmentsData.filter(a => a.status === "Upcoming").slice(0, 2).map(appointment => (
                        <div key={appointment.id} className="flex justify-between items-center rounded-lg border p-3">
                          <div>
                            <p className="font-medium">{appointment.doctor}</p>
                            <p className="text-sm text-muted-foreground">{appointment.date} • {appointment.time}</p>
                            <Badge variant="outline" className="mt-1">{appointment.type}</Badge>
                          </div>
                          <Button size="sm" variant="default">Join</Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center">
                        <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                        Recent Messages
                      </CardTitle>
                      <Button variant="link" size="sm" className="px-0" onClick={() => setActiveTab("messages")}>
                        View All <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {messagesData.slice(0, 2).map(message => (
                        <div key={message.id} className="flex items-start gap-3 rounded-lg border p-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={message.avatar} alt={message.sender} />
                            <AvatarFallback>{message.sender.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <p className="font-medium">{message.sender}</p>
                              <p className="text-xs text-muted-foreground">{message.timestamp}</p>
                            </div>
                            <p className="text-sm line-clamp-1">{message.content}</p>
                          </div>
                          {!message.read && <Badge className="bg-primary ml-2" variant="default">New</Badge>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="appointments" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Appointments</CardTitle>
                  <CardDescription>View and manage your upcoming and past appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Upcoming Appointments</h3>
                      <div className="space-y-3">
                        {appointmentsData.filter(a => a.status === "Upcoming" || a.status === "Scheduled").map(appointment => (
                          <div key={appointment.id} className="flex justify-between items-center rounded-lg border p-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{appointment.doctor}</p>
                                <Badge variant="outline">{appointment.specialty}</Badge>
                              </div>
                              <p className="text-sm">{appointment.date} at {appointment.time}</p>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{appointment.type}</span>
                                <span className="mx-1">•</span>
                                <span>{appointment.location}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {appointment.location === "Telehealth" && (
                                <Button variant="default" size="sm">Join Call</Button>
                              )}
                              <Button variant="outline" size="sm">Reschedule</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-semibold mb-2">Past Appointments</h3>
                      <div className="space-y-3">
                        {appointmentsData.filter(a => a.status === "Completed").map(appointment => (
                          <div key={appointment.id} className="flex justify-between items-center rounded-lg border p-4 bg-muted/50">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{appointment.doctor}</p>
                                <Badge variant="outline">{appointment.specialty}</Badge>
                              </div>
                              <p className="text-sm">{appointment.date} at {appointment.time}</p>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{appointment.type}</span>
                                <span className="mx-1">•</span>
                                <span>{appointment.location}</span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">View Summary</Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Schedule New Appointment</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="medications" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Medications</CardTitle>
                  <CardDescription>View your current medications and request refills</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {medicationsData.map(medication => (
                      <div key={medication.id} className="rounded-lg border p-4">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{medication.name}</h3>
                            <div className="text-sm text-muted-foreground">
                              {medication.dosage} • {medication.frequency}
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <PillBottle className="h-3.5 w-3.5 mr-1" />
                            {medication.refillsRemaining} refills left
                          </Badge>
                        </div>
                        <Separator className="my-3" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Purpose</p>
                            <p>{medication.purpose}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Prescribed By</p>
                            <p>{medication.prescribedBy}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Start Date</p>
                            <p>{medication.startDate}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Instructions</p>
                            <p>{medication.instructions}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={medication.refillsRemaining === 0}
                          >
                            Request Refill
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="messages" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Secure Messages</CardTitle>
                  <CardDescription>Communicate securely with your healthcare team</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {messagesData.map(message => (
                      <div key={message.id} className={`rounded-lg border p-4 ${!message.read ? 'bg-primary/5 border-primary/20' : ''}`}>
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={message.avatar} alt={message.sender} />
                            <AvatarFallback>{message.sender.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <h3 className="font-semibold">{message.sender}</h3>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                                {!message.read && <Badge className="bg-primary" variant="default">New</Badge>}
                              </div>
                            </div>
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end gap-2">
                          <Button variant="outline" size="sm">View Thread</Button>
                          <Button variant="default" size="sm">Reply</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">View All Messages</Button>
                  <Button variant="default">New Message</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="monitoring" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HeartPulse className="h-5 w-5 mr-2 text-primary" />
                    Health Monitoring
                  </CardTitle>
                  <CardDescription>Track and visualize your health metrics over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="rounded-lg border p-4">
                      <h3 className="font-semibold mb-3">Blood Pressure Log</h3>
                      <div className="h-48 bg-muted/30 rounded-md flex items-center justify-center text-muted-foreground">
                        Blood pressure chart visualization would appear here
                      </div>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3 border rounded-md text-center">
                          <p className="text-sm text-muted-foreground">Latest Reading</p>
                          <p className="text-xl font-semibold">128/82</p>
                          <p className="text-xs text-muted-foreground">Today, 8:30 AM</p>
                        </div>
                        <div className="p-3 border rounded-md text-center">
                          <p className="text-sm text-muted-foreground">Weekly Average</p>
                          <p className="text-xl font-semibold">130/84</p>
                          <p className="text-xs text-muted-foreground">Last 7 days</p>
                        </div>
                        <div className="p-3 border rounded-md text-center">
                          <p className="text-sm text-muted-foreground">Monthly Trend</p>
                          <div className="flex items-center justify-center gap-1">
                            <p className="text-xl font-semibold text-green-600">▼ 2.5%</p>
                          </div>
                          <p className="text-xs text-muted-foreground">Compared to last month</p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm">Add New Reading</Button>
                      </div>
                    </div>
                    
                    <div className="rounded-lg border p-4">
                      <h3 className="font-semibold mb-3">Blood Glucose Monitoring</h3>
                      <div className="h-48 bg-muted/30 rounded-md flex items-center justify-center text-muted-foreground">
                        Glucose level chart visualization would appear here
                      </div>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3 border rounded-md text-center">
                          <p className="text-sm text-muted-foreground">Latest Reading</p>
                          <p className="text-xl font-semibold">110 mg/dL</p>
                          <p className="text-xs text-muted-foreground">Today, 7:15 AM</p>
                        </div>
                        <div className="p-3 border rounded-md text-center">
                          <p className="text-sm text-muted-foreground">Weekly Average</p>
                          <p className="text-xl font-semibold">118 mg/dL</p>
                          <p className="text-xs text-muted-foreground">Last 7 days</p>
                        </div>
                        <div className="p-3 border rounded-md text-center">
                          <p className="text-sm text-muted-foreground">Monthly Trend</p>
                          <div className="flex items-center justify-center gap-1">
                            <p className="text-xl font-semibold text-green-600">▼ 3.2%</p>
                          </div>
                          <p className="text-xs text-muted-foreground">Compared to last month</p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm">Add New Reading</Button>
                      </div>
                    </div>
                    
                    <div className="rounded-lg border p-4">
                      <h3 className="font-semibold mb-3">Weight Tracking</h3>
                      <div className="h-48 bg-muted/30 rounded-md flex items-center justify-center text-muted-foreground">
                        Weight tracking chart visualization would appear here
                      </div>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3 border rounded-md text-center">
                          <p className="text-sm text-muted-foreground">Current Weight</p>
                          <p className="text-xl font-semibold">155 lbs</p>
                          <p className="text-xs text-muted-foreground">Updated 2 days ago</p>
                        </div>
                        <div className="p-3 border rounded-md text-center">
                          <p className="text-sm text-muted-foreground">BMI</p>
                          <p className="text-xl font-semibold">24.3</p>
                          <p className="text-xs text-muted-foreground">Normal range</p>
                        </div>
                        <div className="p-3 border rounded-md text-center">
                          <p className="text-sm text-muted-foreground">Goal</p>
                          <p className="text-xl font-semibold">150 lbs</p>
                          <p className="text-xs text-muted-foreground">5 lbs to go</p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm">Update Weight</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Download Health Data</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PatientPortal;
