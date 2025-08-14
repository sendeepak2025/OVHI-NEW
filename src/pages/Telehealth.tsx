
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Mic, MicOff, Video, VideoOff, Phone, PhoneOff, MessageCircle, 
  Share, Users, Settings, Heart, History, Calendar, Clipboard
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import TelehealthVideoRoom from "@/components/telehealth/TelehealthVideoRoom";
import PatientQueue from "@/components/telehealth/PatientQueue";
import ConsultationNotes from "@/components/telehealth/ConsultationNotes";
import TelehealthHistory from "@/components/telehealth/TelehealthHistory";
import TelehealthSchedule from "@/components/telehealth/TelehealthSchedule";

const Telehealth: React.FC = () => {
  const [activeTab, setActiveTab] = useState("queue");
  const [currentPatient, setCurrentPatient] = useState<any>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'degraded' | 'offline'>('online');
  const [isRingCentralConnected, setIsRingCentralConnected] = useState(false);
  
  // Simulate checking if RingCentral is connected
  useEffect(() => {
    // This would be replaced with actual code to check RingCentral connection status
    const checkRingCentralStatus = () => {
      // For demo purposes, randomly decide if RingCentral is connected
      const isConnected = localStorage.getItem('ringCentralConnected') === 'true';
      setIsRingCentralConnected(isConnected);
    };
    
    checkRingCentralStatus();
  }, []);
  
  // Simulate network status check
  useEffect(() => {
    const checkNetworkStatus = () => {
      const quality = Math.random();
      if (quality > 0.9) {
        setNetworkStatus('degraded');
        toast.warning("Network connection is degraded", {
          description: "Video quality may be affected"
        });
      } else if (quality > 0.98) {
        setNetworkStatus('offline');
        toast.error("Network connection lost", {
          description: "Attempting to reconnect..."
        });
      } else {
        setNetworkStatus('online');
      }
    };
    
    // Only check network when in a call
    let interval: NodeJS.Timeout;
    if (isInCall) {
      interval = setInterval(checkNetworkStatus, 30000); // Check every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isInCall]);
  
  // Handle starting a consultation with a patient
  const startConsultation = (patient: any) => {
    if (!isRingCentralConnected) {
      toast.error("RingCentral is not connected", {
        description: "Please connect RingCentral in Settings to start video consultations"
      });
      return;
    }
    
    setCurrentPatient(patient);
    setIsInCall(true);
    setActiveTab("consultation");
    toast.success(`Starting RingCentral call with ${patient.name}`);
  };

  // Handle ending the current consultation
  const endConsultation = () => {
    toast.info(`Ended RingCentral call with ${currentPatient?.name}`);
    setIsInCall(false);
    setCurrentPatient(null);
    setActiveTab("queue");
  };

  // Handle saving patient notes
  const handleSaveNotes = (notes: string, diagnosis: string, plan: string) => {
    toast.success(`Consultation notes saved for ${currentPatient?.name}`);
    // In a real app, we would save this to an API here
  };

  // Get network status badge
  const getNetworkStatusBadge = () => {
    if (!isRingCentralConnected) {
      return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
        <Heart className="h-3 w-3 mr-1 text-red-500" /> RingCentral Not Connected
      </Badge>;
    }
    
    switch (networkStatus) {
      case 'degraded':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Heart className="h-3 w-3 mr-1 text-yellow-500" /> Degraded Connection
        </Badge>;
      case 'offline':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
          <Heart className="h-3 w-3 mr-1 text-red-500" /> Connection Lost
        </Badge>;
      default:
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
          <Heart className="h-3 w-3 mr-1 text-green-500" /> RingCentral Connected
        </Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">RingCentral Telehealth</h1>
        <div className="flex items-center gap-2">
          {getNetworkStatusBadge()}
          <Button variant="outline" size="sm" onClick={() => setActiveTab("settings")}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>
      
      {!isRingCentralConnected && (
        <Card className="border-dashed border-yellow-300 bg-yellow-50">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <Phone className="h-8 w-8 text-yellow-600 mr-4" />
                <div>
                  <h3 className="font-semibold text-yellow-800">RingCentral is not connected</h3>
                  <p className="text-sm text-yellow-700">Connect RingCentral to start video consultations</p>
                </div>
              </div>
              <Button asChild>
                <Link to="/settings">
                  Connect RingCentral
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 mb-4">
          <TabsTrigger value="queue">
            <Users className="h-4 w-4 mr-2" />
            Waiting Room
          </TabsTrigger>
          <TabsTrigger value="consultation" disabled={!isInCall}>
            <Video className="h-4 w-4 mr-2" />
            Consultation
          </TabsTrigger>
          <TabsTrigger value="notes" disabled={!isInCall}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="queue" className="space-y-4">
          <PatientQueue onStartConsultation={startConsultation} />
        </TabsContent>
        
        <TabsContent value="consultation" className="space-y-4">
          {isInCall && currentPatient ? (
            <TelehealthVideoRoom 
              patient={currentPatient} 
              onEndCall={endConsultation}
              networkStatus={networkStatus}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12">
                  <Video className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No active RingCentral call</p>
                  <Button 
                    variant="default" 
                    className="mt-4"
                    onClick={() => setActiveTab("queue")}
                  >
                    Go to Waiting Room
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="notes" className="space-y-4">
          {isInCall && currentPatient ? (
            <ConsultationNotes 
              patient={currentPatient}
              onSaveNotes={handleSaveNotes} 
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12">
                  <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No active consultation for notes</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <TelehealthHistory onStartConsultation={startConsultation} />
        </TabsContent>
        
        <TabsContent value="schedule" className="space-y-4">
          <TelehealthSchedule onStartConsultation={startConsultation} />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Telehealth Settings</CardTitle>
              <CardDescription>
                Configure your telehealth preferences and RingCentral integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center">
                  <Phone className="h-10 w-10 text-primary p-2 bg-primary/10 rounded-full mr-4" />
                  <div>
                    <h3 className="font-medium">RingCentral Integration</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect your RingCentral account to enable video consultations
                    </p>
                  </div>
                </div>
                <div>
                  {isRingCentralConnected ? (
                    <div className="flex flex-col items-end">
                      <Badge className="bg-green-100 text-green-800 mb-2">Connected</Badge>
                      <Button asChild variant="outline" size="sm">
                        <Link to="/settings">
                          Manage
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <Button asChild>
                      <Link to="/settings">
                        Connect RingCentral
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Telehealth Preferences</h3>
                <div className="grid gap-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="auto-check-in" className="rounded border-gray-300" />
                    <label htmlFor="auto-check-in">Automatically check in patients when they join waiting room</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="remind-patients" className="rounded border-gray-300" />
                    <label htmlFor="remind-patients">Send reminder to patients 15 minutes before appointment</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="allow-group" className="rounded border-gray-300" />
                    <label htmlFor="allow-group">Allow group consultations with multiple participants</label>
                  </div>
                </div>
              </div>
              
              <div className="text-center p-4 border rounded-lg bg-primary/5">
                <p className="text-sm mb-2">For advanced RingCentral settings and integration options</p>
                <Button asChild>
                  <Link to="/settings">
                    Go to Settings
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Telehealth;
