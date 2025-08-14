
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Moon, Sun, Laptop, RefreshCw } from "lucide-react";

const AppearanceSettings: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize how the application looks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-base" htmlFor="theme">Theme</Label>
          <p className="text-sm text-muted-foreground">
            Select the theme for the dashboard
          </p>
          <ToggleGroup type="single" defaultValue="system" className="justify-start">
            <ToggleGroupItem value="light">
              <Sun className="h-4 w-4 mr-2" />
              Light
            </ToggleGroupItem>
            <ToggleGroupItem value="dark">
              <Moon className="h-4 w-4 mr-2" />
              Dark
            </ToggleGroupItem>
            <ToggleGroupItem value="system">
              <Laptop className="h-4 w-4 mr-2" />
              System
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <Label className="text-base">Font Size</Label>
          <p className="text-sm text-muted-foreground">
            Adjust the font size for better readability
          </p>
          <ToggleGroup type="single" defaultValue="medium" className="justify-start">
            <ToggleGroupItem value="small">Small</ToggleGroupItem>
            <ToggleGroupItem value="medium">Medium</ToggleGroupItem>
            <ToggleGroupItem value="large">Large</ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <Label className="text-base">Compact Mode</Label>
          <p className="text-sm text-muted-foreground">
            Display more content with less spacing
          </p>
          <div className="flex items-center space-x-2">
            <Switch id="compact-mode" />
            <Label htmlFor="compact-mode">Enable compact mode</Label>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <Label className="text-base">Color Scheme</Label>
          <p className="text-sm text-muted-foreground">
            Choose the primary color for the interface
          </p>
          <ToggleGroup type="single" defaultValue="blue" className="justify-start">
            <ToggleGroupItem value="blue" className="bg-blue-500 hover:bg-blue-600 text-white"></ToggleGroupItem>
            <ToggleGroupItem value="green" className="bg-green-500 hover:bg-green-600 text-white"></ToggleGroupItem>
            <ToggleGroupItem value="purple" className="bg-purple-500 hover:bg-purple-600 text-white"></ToggleGroupItem>
            <ToggleGroupItem value="orange" className="bg-orange-500 hover:bg-orange-600 text-white"></ToggleGroupItem>
            <ToggleGroupItem value="pink" className="bg-pink-500 hover:bg-pink-600 text-white"></ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="mr-2">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
        <Button>Save Appearance</Button>
      </CardFooter>
    </Card>
  );
};

export default AppearanceSettings;
