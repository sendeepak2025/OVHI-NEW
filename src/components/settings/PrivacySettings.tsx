
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const PrivacySettings: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy and Security</CardTitle>
        <CardDescription>
          Manage your privacy and security settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Account Security</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Session Timeout</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically log out after period of inactivity
                </p>
              </div>
              <Select defaultValue="30">
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Data Privacy</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="analytics" defaultChecked />
              <Label htmlFor="analytics">
                Allow anonymous analytics to improve the application
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="marketing" />
              <Label htmlFor="marketing">
                Receive updates about new features and improvements
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="third-party" />
              <Label htmlFor="third-party">
                Share data with trusted third-party services
              </Label>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Login History</h3>
          <div className="rounded-md border">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Current Session</h4>
                  <p className="text-sm text-muted-foreground">
                    Chrome on Windows • New York, USA
                  </p>
                </div>
                <Badge variant="success">Active Now</Badge>
              </div>
            </div>
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Previous Login</h4>
                  <p className="text-sm text-muted-foreground">
                    Safari on macOS • New York, USA • 2 days ago
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Previous Login</h4>
                  <p className="text-sm text-muted-foreground">
                    Chrome on iOS • Chicago, USA • 5 days ago
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm">
            View full login history
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10">
          Delete Account
        </Button>
        <Button>Save Privacy Settings</Button>
      </CardFooter>
    </Card>
  );
};

export default PrivacySettings;
