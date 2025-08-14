
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save, Upload } from "lucide-react";

const DoctorProfileSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Doctor Profile</CardTitle>
          <CardDescription>
            Update your personal and professional information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32 border-2 border-primary">
                <AvatarImage src="/placeholder.svg" alt="Dr. Profile" />
                <AvatarFallback>DR</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" className="flex gap-2">
                <Upload className="h-4 w-4" />
                Change Photo
              </Button>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue="Dr. Ranadive Virendra" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credentials">Credentials</Label>
                  <Input id="credentials" defaultValue="MD, FACP" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty</Label>
                  <Select defaultValue="internal_medicine">
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal_medicine">Internal Medicine</SelectItem>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="dermatology">Dermatology</SelectItem>
                      <SelectItem value="family_medicine">Family Medicine</SelectItem>
                      <SelectItem value="neurology">Neurology</SelectItem>
                      <SelectItem value="pediatrics">Pediatrics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="npi">NPI Number</Label>
                  <Input id="npi" defaultValue="1234567890" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Biography</Label>
                <Textarea 
                  id="bio" 
                  rows={4}
                  defaultValue="Board-certified physician with over 15 years of experience in internal medicine. Specializing in preventative care and chronic disease management."
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="dr.virendra@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" defaultValue="+1 (555) 123-4567" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="office-phone">Office Phone</Label>
                <Input id="office-phone" defaultValue="+1 (555) 987-6543" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fax">Fax</Label>
                <Input id="fax" defaultValue="+1 (555) 765-4321" />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="license">Medical License</Label>
                <Input id="license" defaultValue="ML12345678" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dea">DEA Number</Label>
                <Input id="dea" defaultValue="XB1234563" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State of Practice</Label>
                <Select defaultValue="california">
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="california">California</SelectItem>
                    <SelectItem value="new_york">New York</SelectItem>
                    <SelectItem value="texas">Texas</SelectItem>
                    <SelectItem value="florida">Florida</SelectItem>
                    <SelectItem value="illinois">Illinois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="board">Board Certification</Label>
                <Input id="board" defaultValue="American Board of Internal Medicine" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="languages">Languages Spoken</Label>
              <Select defaultValue="english_hindi">
                <SelectTrigger>
                  <SelectValue placeholder="Select languages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="english_spanish">English, Spanish</SelectItem>
                  <SelectItem value="english_hindi">English, Hindi</SelectItem>
                  <SelectItem value="english_french">English, French</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Practice Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="practice-name">Practice Name</Label>
                <Input id="practice-name" defaultValue="Virendra Medical Group" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hospital">Hospital Affiliation</Label>
                <Input id="hospital" defaultValue="Memorial Hospital" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Office Address</Label>
              <Textarea 
                id="address" 
                rows={2}
                defaultValue="123 Medical Center Drive, Suite 300, San Francisco, CA 94143"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" className="mr-2">Cancel</Button>
          <Button onClick={() => toast.success("Profile updated successfully")} className="gap-2">
            <Save className="h-4 w-4" />
            Save Profile
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DoctorProfileSettings;
