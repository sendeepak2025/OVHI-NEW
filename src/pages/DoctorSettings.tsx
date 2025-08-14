
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import HipaaApplicationChecklist from '@/components/HipaaApplicationChecklist';
import { Settings, ClipboardList, ShieldAlert, Server, User, MapPin } from 'lucide-react';
import HipaaNotice from '@/components/HipaaNotice';
import DoctorProfileSettings from '@/components/settings/DoctorProfileSettings';
import LocationManager from './provider/LocationDetails';

const DoctorSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <HipaaNotice />
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Doctor Settings</h1>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-4">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <ShieldAlert className="h-4 w-4 mr-2" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="practice">
            <ClipboardList className="h-4 w-4 mr-2" />
            Practice
          </TabsTrigger>
          <TabsTrigger value="system">
            <Server className="h-4 w-4 mr-2" />
            System
          </TabsTrigger>
                    <TabsTrigger value="location"><MapPin className="h-4 w-4 mr-2" /> Location</TabsTrigger>

        </TabsList>
        
        <TabsContent value="profile">
          <DoctorProfileSettings />
        </TabsContent>
        
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Doctor Preferences</CardTitle>
              <CardDescription>
                Configure your personal preferences for the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base" htmlFor="charts-default-expanded">
                      Expand Patient Charts by Default
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Patient charts will be expanded when opened
                    </p>
                  </div>
                  <Switch id="charts-default-expanded" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base" htmlFor="auto-save-notes">
                      Auto-Save Clinical Notes
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Save notes automatically every 30 seconds
                    </p>
                  </div>
                  <Switch id="auto-save-notes" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base" htmlFor="medication-alerts">
                      Enhanced Medication Alerts
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Show detailed interaction warnings for medications
                    </p>
                  </div>
                  <Switch id="medication-alerts" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="compliance">
          <HipaaApplicationChecklist />
        </TabsContent>
        
        <TabsContent value="practice">
          <Card>
            <CardHeader>
              <CardTitle>Practice Settings</CardTitle>
              <CardDescription>
                Configure settings related to your medical practice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base" htmlFor="allow-online-scheduling">
                      Patient Online Scheduling
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Allow patients to schedule appointments online
                    </p>
                  </div>
                  <Switch id="allow-online-scheduling" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base" htmlFor="telehealth-enabled">
                      Enable Telehealth
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Allow virtual visits and consultations
                    </p>
                  </div>
                  <Switch id="telehealth-enabled" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base" htmlFor="auto-reminders">
                      Automatic Appointment Reminders
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Send email and SMS reminders to patients
                    </p>
                  </div>
                  <Switch id="auto-reminders" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system-wide settings for the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base" htmlFor="hipaa-audit-logging">
                      HIPAA Audit Logging
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enable detailed audit logging for compliance
                    </p>
                  </div>
                  <Switch id="hipaa-audit-logging" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base" htmlFor="data-backup">
                      Automatic Data Backup
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Schedule regular encrypted backups
                    </p>
                  </div>
                  <Switch id="data-backup" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base" htmlFor="session-timeout">
                      Session Timeout
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically log out after 30 minutes of inactivity
                    </p>
                  </div>
                  <Switch id="session-timeout" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>



        <TabsContent value='location'>
<LocationManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorSettings;
