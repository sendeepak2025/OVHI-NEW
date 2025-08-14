import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Heart,
  Clock,
  Plus,
  BrainCircuit,
  FileText,
  MessageSquare,
  Wifi,
  Bluetooth,
  Smartphone,
} from "lucide-react";
import AiAssistant from "@/components/ai/AiAssistant";
import VitalsAnalyzer from "@/components/ai/VitalsAnalyzer";
import DocumentGenerator from "@/components/ai/DocumentGenerator";
import PCMModule from "./provider/PCMModule";
import { ChronicCareManagement } from "./provider/ChronicCareManagement";
import RpmManagement from "./provider/RpmManagement";
import CCMTaskTracking from "@/components/monitoring/CCMTaskTracking";
import axios from "axios";
import { RpmModule } from "./provider/RpmModule";

const Monitoring: React.FC<{ patient?: any }> = ({ patient }) => {
  const [activeTab, setActiveTab] = useState<string>("vitals");

  const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

  const [telemetry, setTelemetry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const deviceId = "200240801039";
        const res = await axios.get(
          `${BASE_URL}/mio/devices/${deviceId}/telemetry`
        );

        if (res.data.success) {
          setTelemetry(res.data.data.items);
          // console.log(res.data.data.items, "test data ");
        } else {
          setError("No telemetry data found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch telemetry data");
      } finally {
        setLoading(false);
      }
    };

    fetchTelemetry();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Patient Monitoring
          </h1>
          <p className="text-muted-foreground">
            Track patient vitals and leverage AI for clinical insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-primary/10">
            <BrainCircuit className="h-4 w-4 text-primary mr-1" />
            AI Powered
          </Badge>
          {/* <Badge variant="outline" className="bg-green-100 text-green-800">
            <Heart className="h-4 w-4 text-green-500 mr-1" />
            Tenovi Connected
          </Badge> */}
        </div>
      </div>

      <Tabs
        defaultValue={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-5 w-full ">
          <TabsTrigger value="vitals">
            <Heart className="h-4 w-4 mr-2" />
            Smart Vitals
          </TabsTrigger>
          <TabsTrigger value="assistant">
            <MessageSquare className="h-4 w-4 mr-2" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="documentation">
            <FileText className="h-4 w-4 mr-2" />
            Documentation
          </TabsTrigger>
          {patient?.patientService?.includes(1) && (
            <TabsTrigger value="rpm">
              <FileText className="h-4 w-4 mr-2" />
              RPM
            </TabsTrigger>
          )}
          {patient?.patientService?.includes(2) && (
            <TabsTrigger value="ccm">
              <FileText className="h-4 w-4 mr-2" />
              CCM
            </TabsTrigger>
          )}

          {patient?.patientService?.includes(3) && (
            <TabsTrigger value="pcm">
              <FileText className="h-4 w-4 mr-2" />
              PCM
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="vitals" className="space-y-4 mt-6">
          {/* <CCMTaskTracking
            patientId="30422"
            providerId="provider1"
            patientName="John Doe"
            patient={patient}
            
          /> */}
          <CCMTaskTracking
            patientId="30422"
            providerId="provider1"
            patientName="John Doe"
          />

          <div className="grid grid-cols-1  gap-6">
            {/* {
              <VitalsAnalyzer
                mioConnectData={telemetry}
                showDetailedInsights={true}
                patient={{
                  name: "John Doe",
                  id: "12345",
                }}
              />
            } */}

            {/* <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-primary mr-2" />
                      Tenovi Connected Devices
                    </div>
                    <Dialog
                      open={isAddDeviceOpen}
                      onOpenChange={setIsAddDeviceOpen}
                    >
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Device
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {selectedDevice
                              ? `Connect ${selectedDevice.name}`
                              : "Add Tenovi Device"}
                          </DialogTitle>
                          <DialogDescription>
                            {selectedDevice
                              ? `Enter the ${selectedDevice.identifierType} to connect this device`
                              : "Select a Tenovi device to add to your patient monitoring system"}
                          </DialogDescription>
                        </DialogHeader>

                        {!selectedDevice ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {availableDevices.map((device, index) => (
                              <Card
                                key={index}
                                className="hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => handleSelectDevice(device)}
                              >
                                <CardHeader className="pb-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Heart className="h-5 w-5 text-primary" />
                                      </div>
                                      <div>
                                        <CardTitle className="text-lg">
                                          {device.name}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                          Model: {device.model}
                                        </p>
                                      </div>
                                    </div>
                                    <Badge variant="secondary">
                                      {device.type}
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                  <p className="text-sm text-muted-foreground mb-3">
                                    {device.description}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm">
                                      <span className="text-muted-foreground">
                                        Identifier:{" "}
                                      </span>
                                      <span className="font-medium">
                                        {device.identifierType}
                                      </span>
                                    </div>
                                    <Button
                                      size="sm"
                                      className="bg-primary hover:bg-primary/90"
                                    >
                                      Select Device
                                    </Button>
                                  </div>
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {device.connectionMethods.map(
                                      (method, idx) => (
                                        <Badge
                                          key={idx}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {method}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-6 mt-4">
                            <Card>
                              <CardHeader className="pb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Heart className="h-6 w-6 text-primary" />
                                  </div>
                                  <div>
                                    <CardTitle className="text-xl">
                                      {selectedDevice.name}
                                    </CardTitle>
                                    <p className="text-muted-foreground">
                                      Model: {selectedDevice.model}
                                    </p>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-muted-foreground">
                                  {selectedDevice.description}
                                </p>
                              </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="deviceIdentifier">
                                  {selectedDevice.identifierType} *
                                </Label>
                                <Input
                                  id="deviceIdentifier"
                                  placeholder={`Enter ${selectedDevice.identifierType.toLowerCase()}`}
                                  value={deviceIdentifier}
                                  onChange={(e) =>
                                    setDeviceIdentifier(e.target.value)
                                  }
                                />
                                <p className="text-xs text-muted-foreground">
                                  Find this on the device label or packaging
                                </p>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="patientAssignment">
                                  Assign to Patient (Optional)
                                </Label>
                                <Input
                                  id="patientAssignment"
                                  placeholder="Patient ID or Name"
                                  value={patientAssignment}
                                  onChange={(e) =>
                                    setPatientAssignment(e.target.value)
                                  }
                                />
                                <p className="text-xs text-muted-foreground">
                                  Leave empty to assign later
                                </p>
                              </div>
                            </div>

                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                              <h4 className="font-medium text-blue-900 mb-2">
                                Connection Methods
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedDevice.connectionMethods.map(
                                  (method: string, idx: number) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="text-blue-700 border-blue-300"
                                    >
                                      {method}
                                    </Badge>
                                  )
                                )}
                              </div>
                              <p className="text-sm text-blue-700 mt-2">
                                Ensure the device is powered on and within range
                                for connection.
                              </p>
                            </div>

                            <div className="flex space-x-3">
                              <Button
                                variant="outline"
                                onClick={handleBackToSelection}
                                className="flex-1"
                              >
                                Back to Selection
                              </Button>
                              <Button
                                onClick={handleConnectDevice}
                                disabled={!deviceIdentifier.trim()}
                                className="flex-1 bg-primary hover:bg-primary/90"
                              >
                                Connect Device
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-start space-x-3">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <Heart className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-blue-900">
                                Need help with device setup?
                              </h4>
                              <p className="text-sm text-blue-700 mt-1">
                                Contact our support team for assistance with
                                Tenovi device configuration and integration.
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-3 border-blue-300 text-blue-700 hover:bg-blue-100"
                              >
                                Contact Support
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                  <CardDescription>
                    Remote patient monitoring devices collecting real-time
                    health data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tenoviDevices.map((device, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Heart className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{device.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Model: {device.model}
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(device.status)}>
                            {device.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            {getConnectionIcon(device.connectionType)}
                            <span>{device.connectionType}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Battery:{" "}
                            </span>
                            <span
                              className={
                                device.batteryLevel > 20
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {device.batteryLevel}%
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Last sync:{" "}
                            </span>
                            <span>{device.lastSync}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Type:{" "}
                            </span>
                            <span>{device.type}</span>
                          </div>
                        </div>

                        

                        <div className="flex space-x-2">
                          {device.status === "Connected" ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                              >
                                View Data
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                              >
                                Sync Now
                              </Button>
                            </>
                          ) : (
                            <Button size="sm" className="flex-1">
                              Reconnect Device
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Plus className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-900">
                          Add New Tenovi Device
                        </h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Connect additional Tenovi devices for comprehensive
                          patient monitoring
                        </p>
                        <Button
                          size="sm"
                          className="mt-3 bg-blue-600 hover:bg-blue-700"
                          onClick={() => setIsAddDeviceOpen(true)}
                        >
                          Browse Tenovi Devices
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BrainCircuit className="h-5 w-5 text-primary mr-2" />
                    AI Alerts
                  </CardTitle>
                  <CardDescription>
                    Smart notifications based on patient data analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                          <Heart className="h-4 w-4 text-amber-500" />
                        </div>
                        <div>
                          <p className="font-medium text-amber-800">
                            Blood Pressure Trend Alert
                          </p>
                          <p className="text-sm text-amber-700">
                            5-day upward trend detected
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <Heart className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium text-blue-800">
                            Medication Adherence
                          </p>
                          <p className="text-sm text-blue-700">
                            Potential missed evening dose
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-md border border-green-200 bg-green-50 p-3">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                          <Heart className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium text-green-800">
                            Exercise Goal Achievement
                          </p>
                          <p className="text-sm text-green-700">
                            Weekly activity target reached
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div> */}
          </div>
        </TabsContent>

        <TabsContent value="assistant" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 gap-6">
            <AiAssistant
              context="Patient monitoring data and clinical history"
              placeholder="Ask about patient data analysis, treatment suggestions, or clinical research findings..."
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BrainCircuit className="h-5 w-5 text-primary mr-2" />
                  AI Use Cases
                </CardTitle>
                <CardDescription>
                  Ways the AI Assistant can help with patient monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border rounded-md p-4 space-y-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Pattern Detection</h3>
                    <p className="text-sm text-muted-foreground">
                      Identify patterns and anomalies in vitals data that might
                      not be immediately obvious to human providers.
                    </p>
                  </div>

                  <div className="border rounded-md p-4 space-y-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Research Insights</h3>
                    <p className="text-sm text-muted-foreground">
                      Access the latest clinical research relevant to patient
                      symptoms and conditions.
                    </p>
                  </div>

                  <div className="border rounded-md p-4 space-y-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Treatment Suggestions</h3>
                    <p className="text-sm text-muted-foreground">
                      Generate evidence-based treatment options to consider
                      based on patient data and medical history.
                    </p>
                  </div>

                  <div className="border rounded-md p-4 space-y-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Risk Stratification</h3>
                    <p className="text-sm text-muted-foreground">
                      Assess patient risk levels for various conditions based on
                      their current health data.
                    </p>
                  </div>

                  <div className="border rounded-md p-4 space-y-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Medication Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Evaluate potential drug interactions and suggest optimal
                      medication schedules.
                    </p>
                  </div>

                  <div className="border rounded-md p-4 space-y-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Care Plan Generation</h3>
                    <p className="text-sm text-muted-foreground">
                      Create personalized patient care plans based on clinical
                      guidelines and patient-specific factors.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-4 mt-6">
          <DocumentGenerator />
        </TabsContent>

        <TabsContent value="pcm" className="space-y-4 mt-6">
          <PCMModule />
        </TabsContent>
        <TabsContent value="rpm" className="space-y-4 mt-6">
          <RpmModule />
        </TabsContent>
        <TabsContent value="ccm" className="space-y-4 mt-6">
          <ChronicCareManagement />
        </TabsContent>
        {/* <TabsContent value="rpm" className="space-y-4 mt-6">
          <RpmManagement />
        </TabsContent> */}
      </Tabs>
    </div>
  );
};

export default Monitoring;
