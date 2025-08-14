import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette, 
  User,
  Save,
  Phone,
  Building,
  Stethoscope,
  FileText,
  Heart,
  CreditCard
} from "lucide-react";
import HipaaNotice from "@/components/HipaaNotice";

// Import the component tabs
import AccountSettings from "@/components/settings/AccountSettings";
import AppearanceSettings from "@/components/settings/AppearanceSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import PrivacySettings from "@/components/settings/PrivacySettings";
import RingCentralSettings from "@/components/settings/RingCentralSettings";
import PracticeSetupSettings from "@/components/settings/PracticeSetupSettings";
import SpecialtyConfigurationSettings from "@/components/settings/SpecialtyConfigurationSettings";
import EncounterTemplateSettings from "@/components/settings/EncounterTemplateSettings";
import CareManagementSettings from "@/components/settings/CareManagementSettings";
import SmartSpecialtyManager from '@/components/settings/SmartSpecialtyManager';
import BillingConfigurationSettings from '@/components/settings/BillingConfigurationSettings';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <HipaaNotice />
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <Button 
          onClick={() => toast.success("Settings saved successfully")}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          Save All Changes
        </Button>
      </div>
      
      <Tabs defaultValue="practice-setup" className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="grid grid-cols-10 mb-4 w-[1300px]">
            <TabsTrigger value="practice-setup">
              <Building className="h-4 w-4 mr-2" />
              Practice
            </TabsTrigger>
            <TabsTrigger value="specialty">
              <Stethoscope className="h-4 w-4 mr-2" />
              Specialty
            </TabsTrigger>
            <TabsTrigger value="templates">
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="care-mgmt">
              <Heart className="h-4 w-4 mr-2" />
              Care Mgmt
            </TabsTrigger>
            <TabsTrigger value="billing">
              <CreditCard className="h-4 w-4 mr-2" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="account">
              <User className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="ringcentral">
              <Phone className="h-4 w-4 mr-2" />
              RingCentral
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="practice-setup">
          <PracticeSetupSettings />
        </TabsContent>
        
        <TabsContent value="specialty">
          <SmartSpecialtyManager />
        </TabsContent>
        
        <TabsContent value="templates">
          <EncounterTemplateSettings />
        </TabsContent>
        
        <TabsContent value="care-mgmt">
          <CareManagementSettings />
        </TabsContent>
        
        <TabsContent value="billing">
          <BillingConfigurationSettings />
        </TabsContent>
        
        <TabsContent value="account">
          <AccountSettings />
        </TabsContent>
        
        <TabsContent value="appearance">
          <AppearanceSettings />
        </TabsContent>
        
        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>
        
        <TabsContent value="privacy">
          <PrivacySettings />
        </TabsContent>
        
        <TabsContent value="ringcentral">
          <RingCentralSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;