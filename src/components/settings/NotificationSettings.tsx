
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NotificationSettings: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Configure how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Email Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="email-appt" defaultChecked />
                <Label htmlFor="email-appt">Appointment reminders</Label>
              </div>
              <Select defaultValue="24h">
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 hour before</SelectItem>
                  <SelectItem value="2h">2 hours before</SelectItem>
                  <SelectItem value="24h">24 hours before</SelectItem>
                  <SelectItem value="48h">48 hours before</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="email-lab" defaultChecked />
              <Label htmlFor="email-lab">New lab results</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="email-patient" defaultChecked />
              <Label htmlFor="email-patient">New patient registrations</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="email-msg" defaultChecked />
              <Label htmlFor="email-msg">Patient messages</Label>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">In-App Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="app-appt" defaultChecked />
              <Label htmlFor="app-appt">Appointment alerts</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="app-check" defaultChecked />
              <Label htmlFor="app-check">Patient check-ins</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="app-lab" defaultChecked />
              <Label htmlFor="app-lab">Critical lab results</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="app-rx" defaultChecked />
              <Label htmlFor="app-rx">Prescription refills</Label>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Delivery</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="quiet-hours">Quiet Hours</Label>
              <Switch id="quiet-hours" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiet-start">Start Time</Label>
                <Select defaultValue="22:00">
                  <SelectTrigger id="quiet-start">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20:00">8:00 PM</SelectItem>
                    <SelectItem value="21:00">9:00 PM</SelectItem>
                    <SelectItem value="22:00">10:00 PM</SelectItem>
                    <SelectItem value="23:00">11:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet-end">End Time</Label>
                <Select defaultValue="07:00">
                  <SelectTrigger id="quiet-end">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="06:00">6:00 AM</SelectItem>
                    <SelectItem value="07:00">7:00 AM</SelectItem>
                    <SelectItem value="08:00">8:00 AM</SelectItem>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="ml-auto">Save Notification Preferences</Button>
      </CardFooter>
    </Card>
  );
};

export default NotificationSettings;
