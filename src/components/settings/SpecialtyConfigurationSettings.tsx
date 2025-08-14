import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Save, Stethoscope, Heart, Brain, Clock, UserPlus } from "lucide-react";
import { updateSettingsApi } from "@/services/operations/settings";

interface SpecialtyConfig {
  primarySpecialty: string;
  secondarySpecialties: string[];
  subspecialties: string[];
  certifications: string[];
  practiceSettings: {
    defaultAppointmentDuration: string;
    telehealth: boolean;
    urgentCare: boolean;
    preventiveCare: boolean;
    chronicCareManagement: boolean;
    remotePatientMonitoring: boolean;
  };
}

const MEDICAL_SPECIALTIES = [
  {
    name: 'Primary Care',
    icon: <Stethoscope className="h-4 w-4" />,
    subspecialties: ['Family Medicine', 'Internal Medicine', 'General Practice', 'Geriatric Medicine']
  },
  {
    name: 'Mental Health',
    icon: <Brain className="h-4 w-4" />,
    subspecialties: ['Psychiatry', 'Psychology', 'Behavioral Health', 'Addiction Medicine', 'Child Psychiatry']
  },
  {
    name: 'Neurology',
    icon: <Brain className="h-4 w-4" />,
    subspecialties: ['General Neurology', 'Epilepsy', 'Movement Disorders', 'Stroke', 'Neuropsychology']
  },
  {
    name: 'Urgent Care',
    icon: <Clock className="h-4 w-4" />,
    subspecialties: ['Emergency Medicine', 'Occupational Medicine', 'Sports Medicine', 'Minor Surgery']
  },
  {
    name: 'Cardiology',
    icon: <Heart className="h-4 w-4" />,
    subspecialties: ['Interventional Cardiology', 'Electrophysiology', 'Heart Failure', 'Preventive Cardiology', 'Cardiac Surgery']
  },
  {
    name: 'Endocrinology',
    icon: <Stethoscope className="h-4 w-4" />,
    subspecialties: ['Diabetes', 'Thyroid Disorders', 'Reproductive Endocrinology', 'Pediatric Endocrinology']
  },
  {
    name: 'Orthopedics',
    icon: <Stethoscope className="h-4 w-4" />,
    subspecialties: ['Sports Medicine', 'Spine Surgery', 'Joint Replacement', 'Hand Surgery', 'Pediatric Orthopedics']
  },
  {
    name: 'Dermatology',
    icon: <Stethoscope className="h-4 w-4" />,
    subspecialties: ['Medical Dermatology', 'Dermatopathology', 'Mohs Surgery', 'Cosmetic Dermatology']
  },
  {
    name: 'Pediatrics',
    icon: <UserPlus className="h-4 w-4" />,
    subspecialties: ['General Pediatrics', 'Pediatric Cardiology', 'Pediatric Neurology', 'Neonatology']
  },
  {
    name: 'OB/GYN',
    icon: <Stethoscope className="h-4 w-4" />,
    subspecialties: ['Obstetrics', 'Gynecology', 'Maternal-Fetal Medicine', 'Reproductive Endocrinology']
  },
  {
    name: 'ENT',
    icon: <Stethoscope className="h-4 w-4" />,
    subspecialties: ['Otolaryngology', 'Head and Neck Surgery', 'Rhinology', 'Pediatric ENT']
  },
  {
    name: 'Ophthalmology',
    icon: <Stethoscope className="h-4 w-4" />,
    subspecialties: ['Retina', 'Glaucoma', 'Corneal Diseases', 'Pediatric Ophthalmology']
  },
  {
    name: 'Gastroenterology',
    icon: <Stethoscope className="h-4 w-4" />,
    subspecialties: ['Hepatology', 'Inflammatory Bowel Disease', 'Endoscopy', 'Pancreatic Diseases']
  },
  {
    name: 'Pulmonology',
    icon: <Stethoscope className="h-4 w-4" />,
    subspecialties: ['Critical Care', 'Sleep Medicine', 'Interventional Pulmonology', 'Lung Transplant']
  },
  {
    name: 'Nephrology',
    icon: <Stethoscope className="h-4 w-4" />,
    subspecialties: ['Dialysis', 'Kidney Transplant', 'Hypertension', 'Pediatric Nephrology']
  },
  {
    name: 'Urology',
    icon: <Stethoscope className="h-4 w-4" />,
    subspecialties: ['Urologic Oncology', 'Pediatric Urology', 'Reconstructive Urology', 'Male Infertility']
  },
  {
    name: 'Rheumatology',
    icon: <Stethoscope className="h-4 w-4" />,
    subspecialties: ['Autoimmune Diseases', 'Arthritis', 'Lupus', 'Pediatric Rheumatology']
  },
  {
    name: 'Oncology',
    icon: <Stethoscope className="h-4 w-4" />,
    subspecialties: ['Medical Oncology', 'Radiation Oncology', 'Surgical Oncology', 'Pediatric Oncology']
  },
  {
    name: 'Infectious Disease',
    icon: <Stethoscope className="h-4 w-4" />,
    subspecialties: ['HIV/AIDS', 'Antimicrobial Stewardship', 'Travel Medicine', 'Infection Control']
  },
  {
    name: 'Pain Management',
    icon: <Stethoscope className="h-4 w-4" />,
    subspecialties: ['Interventional Pain', 'Chronic Pain', 'Cancer Pain', 'Pediatric Pain']
  },
  {
    name: 'PM&R',
    icon: <Stethoscope className="h-4 w-4" />,
    subspecialties: ['Spinal Cord Injury', 'Brain Injury', 'Sports Medicine', 'Pediatric Rehabilitation']
  },
  {
    name: 'Physical Therapy',
    icon: <Stethoscope className="h-4 w-4" />,
    subspecialties: ['Orthopedic PT', 'Neurologic PT', 'Sports PT', 'Pediatric PT']
  },
  {
    name: 'Podiatry',
    icon: <Stethoscope className="h-4 w-4" />,
    subspecialties: ['Diabetic Foot Care', 'Sports Podiatry', 'Reconstructive Surgery', 'Wound Care']
  },
  {
    name: 'General Surgery',
    icon: <Stethoscope className="h-4 w-4" />,
    subspecialties: ['Laparoscopic Surgery', 'Trauma Surgery', 'Colorectal Surgery', 'Breast Surgery']
  },
  {
    name: 'Vascular Surgery',
    icon: <Stethoscope className="h-4 w-4" />,
    subspecialties: ['Endovascular Surgery', 'Peripheral Vascular', 'Venous Disease', 'Vascular Access']
  }
];

const APPOINTMENT_DURATIONS = [
  '15 minutes',
  '20 minutes',
  '30 minutes',
  '45 minutes',
  '60 minutes',
  '90 minutes'
];

const CERTIFICATIONS = [
  'Board Certified',
  'Fellowship Trained',
  'DEA Licensed',
  'State Medical License',
  'ACLS Certified',
  'BLS Certified',
  'PALS Certified',
  'NRP Certified'
];

const SpecialtyConfigurationSettings: React.FC = () => {
  const [specialtyConfig, setSpecialtyConfig] = useState<SpecialtyConfig>({
    primarySpecialty: '',
    secondarySpecialties: [],
    subspecialties: [],
    certifications: [],
    practiceSettings: {
      defaultAppointmentDuration: '30 minutes',
      telehealth: false,
      urgentCare: false,
      preventiveCare: false,
      chronicCareManagement: false,
      remotePatientMonitoring: false
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const handlePrimarySpecialtyChange = (specialty: string) => {
    setSpecialtyConfig(prev => ({
      ...prev,
      primarySpecialty: specialty,
      // Clear subspecialties when primary specialty changes
      subspecialties: []
    }));
  };

  const handleSecondarySpecialtyToggle = (specialty: string) => {
    setSpecialtyConfig(prev => ({
      ...prev,
      secondarySpecialties: prev.secondarySpecialties.includes(specialty)
        ? prev.secondarySpecialties.filter(s => s !== specialty)
        : [...prev.secondarySpecialties, specialty]
    }));
  };

  const handleSubspecialtyToggle = (subspecialty: string) => {
    setSpecialtyConfig(prev => ({
      ...prev,
      subspecialties: prev.subspecialties.includes(subspecialty)
        ? prev.subspecialties.filter(s => s !== subspecialty)
        : [...prev.subspecialties, subspecialty]
    }));
  };

  const handleCertificationToggle = (certification: string) => {
    setSpecialtyConfig(prev => ({
      ...prev,
      certifications: prev.certifications.includes(certification)
        ? prev.certifications.filter(c => c !== certification)
        : [...prev.certifications, certification]
    }));
  };

  const handlePracticeSettingChange = (setting: string, value: boolean | string) => {
    setSpecialtyConfig(prev => ({
      ...prev,
      practiceSettings: {
        ...prev.practiceSettings,
        [setting]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!specialtyConfig.primarySpecialty) {
      toast.error("Please select a primary specialty");
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateSettingsApi(specialtyConfig);
      if (result) {
        toast.success("Specialty configuration updated successfully!");
      } else {
        toast.error("Failed to update specialty configuration");
      }
    } catch (error) {
      toast.error("Error updating specialty configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const primarySpecialtyData = MEDICAL_SPECIALTIES.find(s => s.name === specialtyConfig.primarySpecialty);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Specialty Configuration</h2>
        <Button onClick={handleSave} disabled={isLoading} className="gap-2">
          <Save className="h-4 w-4" />
          {isLoading ? "Saving..." : "Save Configuration"}
        </Button>
      </div>

      {/* Primary Specialty Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Primary Specialty *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select your primary medical specialty</Label>
            <Select value={specialtyConfig.primarySpecialty} onValueChange={handlePrimarySpecialtyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose primary specialty" />
              </SelectTrigger>
              <SelectContent>
                {MEDICAL_SPECIALTIES.map((specialty) => (
                  <SelectItem key={specialty.name} value={specialty.name}>
                    <div className="flex items-center gap-2">
                      {specialty.icon}
                      {specialty.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {specialtyConfig.primarySpecialty && (
            <div className="mt-4">
              <Badge variant="outline" className="text-primary">
                Primary: {specialtyConfig.primarySpecialty}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subspecialties */}
      {primarySpecialtyData && (
        <Card>
          <CardHeader>
            <CardTitle>Subspecialties & Areas of Focus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {primarySpecialtyData.subspecialties.map((subspecialty) => (
                <div key={subspecialty} className="flex items-center space-x-2">
                  <Checkbox
                    id={subspecialty}
                    checked={specialtyConfig.subspecialties.includes(subspecialty)}
                    onCheckedChange={() => handleSubspecialtyToggle(subspecialty)}
                  />
                  <Label htmlFor={subspecialty} className="text-sm">{subspecialty}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Secondary Specialties */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Specialties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {MEDICAL_SPECIALTIES
              .filter(s => s.name !== specialtyConfig.primarySpecialty)
              .map((specialty) => (
                <div key={specialty.name} className="flex items-center space-x-2">
                  <Checkbox
                    id={specialty.name}
                    checked={specialtyConfig.secondarySpecialties.includes(specialty.name)}
                    onCheckedChange={() => handleSecondarySpecialtyToggle(specialty.name)}
                  />
                  <Label htmlFor={specialty.name} className="text-sm flex items-center gap-1">
                    {specialty.icon}
                    {specialty.name}
                  </Label>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader>
          <CardTitle>Certifications & Licenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CERTIFICATIONS.map((certification) => (
              <div key={certification} className="flex items-center space-x-2">
                <Checkbox
                  id={certification}
                  checked={specialtyConfig.certifications.includes(certification)}
                  onCheckedChange={() => handleCertificationToggle(certification)}
                />
                <Label htmlFor={certification} className="text-sm">{certification}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Practice Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Practice Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default Appointment Duration</Label>
            <Select 
              value={specialtyConfig.practiceSettings.defaultAppointmentDuration} 
              onValueChange={(value) => handlePracticeSettingChange('defaultAppointmentDuration', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPOINTMENT_DURATIONS.map((duration) => (
                  <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium">Services Offered</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="telehealth"
                  checked={specialtyConfig.practiceSettings.telehealth}
                  onCheckedChange={(checked) => handlePracticeSettingChange('telehealth', checked as boolean)}
                />
                <Label htmlFor="telehealth">Telehealth Services</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="urgentCare"
                  checked={specialtyConfig.practiceSettings.urgentCare}
                  onCheckedChange={(checked) => handlePracticeSettingChange('urgentCare', checked as boolean)}
                />
                <Label htmlFor="urgentCare">Urgent Care</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="preventiveCare"
                  checked={specialtyConfig.practiceSettings.preventiveCare}
                  onCheckedChange={(checked) => handlePracticeSettingChange('preventiveCare', checked as boolean)}
                />
                <Label htmlFor="preventiveCare">Preventive Care</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="chronicCareManagement"
                  checked={specialtyConfig.practiceSettings.chronicCareManagement}
                  onCheckedChange={(checked) => handlePracticeSettingChange('chronicCareManagement', checked as boolean)}
                />
                <Label htmlFor="chronicCareManagement">Chronic Care Management (CCM)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remotePatientMonitoring"
                  checked={specialtyConfig.practiceSettings.remotePatientMonitoring}
                  onCheckedChange={(checked) => handlePracticeSettingChange('remotePatientMonitoring', checked as boolean)}
                />
                <Label htmlFor="remotePatientMonitoring">Remote Patient Monitoring (RPM)</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      {specialtyConfig.primarySpecialty && (
        <Card>
          <CardHeader>
            <CardTitle>Configuration Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="font-medium">Primary Specialty:</Label>
              <Badge variant="default" className="ml-2">{specialtyConfig.primarySpecialty}</Badge>
            </div>
            {specialtyConfig.subspecialties.length > 0 && (
              <div>
                <Label className="font-medium">Subspecialties:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {specialtyConfig.subspecialties.map((sub) => (
                    <Badge key={sub} variant="secondary" className="text-xs">{sub}</Badge>
                  ))}
                </div>
              </div>
            )}
            {specialtyConfig.secondarySpecialties.length > 0 && (
              <div>
                <Label className="font-medium">Additional Specialties:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {specialtyConfig.secondarySpecialties.map((specialty) => (
                    <Badge key={specialty} variant="outline" className="text-xs">{specialty}</Badge>
                  ))}
                </div>
              </div>
            )}
            {specialtyConfig.certifications.length > 0 && (
              <div>
                <Label className="font-medium">Certifications:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {specialtyConfig.certifications.map((cert) => (
                    <Badge key={cert} variant="outline" className="text-xs">{cert}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SpecialtyConfigurationSettings;