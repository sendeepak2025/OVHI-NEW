
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, BrainCircuit, MessageSquare, Activity } from "lucide-react";
import { toast } from "sonner";
import RingCentralVideoCall from "./RingCentralVideoCall";
import VoiceToTextTranscription from "./VoiceToTextTranscription";
import SessionSummary from "./SessionSummary";
import AiAssistant from "../ai/AiAssistant";

interface TelehealthVideoRoomProps {
  patient: any;
  onEndCall: () => void;
  networkStatus?: 'online' | 'degraded' | 'offline';
}

const TelehealthVideoRoom: React.FC<TelehealthVideoRoomProps> = ({ patient, onEndCall, networkStatus = 'online' }) => {
  const [activeTab, setActiveTab] = useState('patient');
  const [isCallActive, setIsCallActive] = useState(true);
  const [transcription, setTranscription] = useState<string>("");
  
  const handleTranscriptionUpdate = (text: string) => {
    setTranscription(text);
  };
  
  const handleSaveSummary = (summary: string) => {
    // In a real implementation, this would save to an EHR system
    toast.success("Summary saved to patient record");
  };
  
  const handleCallStatusChange = (active: boolean) => {
    setIsCallActive(active);
    if (!active) {
      onEndCall();
    }
  };
  
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="md:col-span-2 space-y-4">
        <Card className="overflow-hidden">
          <RingCentralVideoCall 
            patient={patient}
            onEndCall={() => handleCallStatusChange(false)}
            networkStatus={networkStatus}
          />
        </Card>
        
        <VoiceToTextTranscription 
          isCallActive={isCallActive}
          patientName={patient.name}
          onTranscriptionUpdate={handleTranscriptionUpdate}
        />
        
        <SessionSummary
          patient={patient}
          transcription={transcription}
          isCallActive={isCallActive}
          onSaveSummary={handleSaveSummary}
        />
      </div>
      
      <div className="md:col-span-1 space-y-4">
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="patient" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full rounded-none">
                <TabsTrigger value="patient" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Patient
                </TabsTrigger>
                <TabsTrigger value="vitals" className="flex-1">
                  <Activity className="h-4 w-4 mr-2" />
                  Vitals
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex-1">
                  <BrainCircuit className="h-4 w-4 mr-2" />
                  AI
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="patient" className="p-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{patient.name}</h3>
                  <p className="text-sm text-muted-foreground">Age: {patient.age}</p>
                  <p className="text-sm text-muted-foreground">Reason: {patient.reason}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Patient Overview</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">DOB</p>
                      <p className="font-medium">05/12/1982</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Gender</p>
                      <p className="font-medium">Female</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">MRN</p>
                      <p className="font-medium">#12345678</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">(555) 123-4567</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Known Allergies</h4>
                  <div className="space-y-1 text-sm">
                    <p className="bg-red-50 text-red-800 px-2 py-1 rounded">Penicillin</p>
                    <p className="bg-red-50 text-red-800 px-2 py-1 rounded">Sulfa Drugs</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button className="w-full" variant="outline" size="sm" onClick={() => toast.info("Prescription created")}>
                      Create Prescription
                    </Button>
                    <Button className="w-full" variant="outline" size="sm" onClick={() => toast.info("Lab order created")}>
                      Order Lab Test
                    </Button>
                    <Button className="w-full" variant="outline" size="sm" onClick={() => toast.info("Referral created")}>
                      Create Referral
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="vitals" className="p-4 space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Current Vital Signs</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="border rounded-md p-3">
                      <p className="text-muted-foreground">Blood Pressure</p>
                      <p className="font-medium text-lg">120/80 mmHg</p>
                      <p className="text-xs text-green-600">Normal</p>
                    </div>
                    <div className="border rounded-md p-3">
                      <p className="text-muted-foreground">Heart Rate</p>
                      <p className="font-medium text-lg">72 bpm</p>
                      <p className="text-xs text-green-600">Normal</p>
                    </div>
                    <div className="border rounded-md p-3">
                      <p className="text-muted-foreground">Temperature</p>
                      <p className="font-medium text-lg">98.6 °F</p>
                      <p className="text-xs text-green-600">Normal</p>
                    </div>
                    <div className="border rounded-md p-3">
                      <p className="text-muted-foreground">Oxygen</p>
                      <p className="font-medium text-lg">98%</p>
                      <p className="text-xs text-green-600">Normal</p>
                    </div>
                    <div className="border rounded-md p-3">
                      <p className="text-muted-foreground">Respiratory Rate</p>
                      <p className="font-medium text-lg">16/min</p>
                      <p className="text-xs text-green-600">Normal</p>
                    </div>
                    <div className="border rounded-md p-3">
                      <p className="text-muted-foreground">BMI</p>
                      <p className="font-medium text-lg">24.5</p>
                      <p className="text-xs text-green-600">Normal</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Vitals History</h4>
                  <div className="text-sm space-y-1">
                    <p className="text-muted-foreground">Last recorded: <span className="font-medium">15 days ago</span></p>
                    <Button variant="outline" size="sm" className="mt-2">
                      View Trend Chart
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="ai" className="p-0">
                <AiAssistant 
                  context={`Telehealth consultation with ${patient.name}, ${patient.age} years old with ${patient.condition || "no known conditions"}`}
                  placeholder="Ask AI for diagnostic suggestions, treatment recommendations, or medication interactions..."
                  initialPrompt="What are the standard care protocols for this patient's condition?"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TelehealthVideoRoom;
