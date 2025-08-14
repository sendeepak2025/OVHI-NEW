import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Save, Building, Clock, Users, Settings } from "lucide-react";
import { updateSettingsApi, getAllOrgAPI } from "@/services/operations/settings";
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import { addServiceApi , addInsouranceNetworkApi, practishSettingApi,getPractishSettingApi} from "@/services/operations/settings"; // adjust path
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface PracticeSetupData {
  // Basic Practice Information
  practiceName: string;
  practiceType: string;
  taxId: string;
  npi: string;
  practicePhone: string;
  practiceFax: string;
  practiceEmail: string;
  website: string;
  
  // Address Information
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Operating Hours
  operatingHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  
  // Services Offered
  servicesOffered: string[];
  
  // Insurance Networks
  insuranceNetworks: string[];
  
  // Hospital Affiliations
  hospitalAffiliations: string[];
}

const PRACTICE_TYPES = [
  'Solo Practice',
  'Group Practice', 
  'Hospital-based',
  'Clinic',
  'Urgent Care',
  'Specialty Practice',
  'Multi-specialty Practice'
];

// const SERVICES = [
//   'Primary Care',
//   'Urgent Care',
//   'Preventive Care',
//   'Chronic Disease Management',
//   'Mental Health Services',
//   'Cardiology',
//   'Neurology',
//   'Dermatology',
//   'Endocrinology',
//   'Orthopedics',
//   'Telehealth Services',
//   'Laboratory Services',
//   'Imaging Services',
//   'Physical Therapy',
//   'Vaccination Services'
// ];

// const INSURANCE_NETWORKS = [
//   'Medicare',
//   'Medicaid',
//   'Blue Cross Blue Shield',
//   'Aetna',
//   'Cigna',
//   'UnitedHealthcare',
//   'Humana',
//   'Kaiser Permanente',
//   'Anthem',
//   'Tricare'
// ];



const DEFAULT_SERVICES = [
  'Primary Care',
  'Urgent Care',
  'Preventive Care',
  'Chronic Disease Management',
  'Mental Health Services',
  'Cardiology',
  'Neurology',
  'Dermatology',
  'Endocrinology',
  'Orthopedics',
  'Telehealth Services',
  'Laboratory Services',
  'Imaging Services',
  'Physical Therapy',
  'Vaccination Services'
];

const DEFAULT_INSURANCE_NETWORKS = [
  'Medicare',
  'Medicaid',
  'Blue Cross Blue Shield',
  'Aetna',
  'Cigna',
  'UnitedHealthcare',
  'Humana',
  'Kaiser Permanente',
  'Anthem',
  'Tricare'
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const PracticeSetupSettings: React.FC = () => {

    const { token, user } = useSelector((state: RootState) => state.auth);
  const [open, setOpen] = useState(false);
  const [addOpenInsourace, setAddOpenInsourace] = useState(false);
  const [networkName, setNetworkName] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [SERVICES, setServices] = useState(DEFAULT_SERVICES);
  const [INSURANCE_NETWORKS, setInsuranceNetworks] = useState(DEFAULT_INSURANCE_NETWORKS);


  const [practiceData, setPracticeData] = useState<PracticeSetupData>({
    practiceName: '',
    practiceType: '',
    taxId: '',
    npi: '',
    practicePhone: '',
    practiceFax: '',
    practiceEmail: '',
    website: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    operatingHours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '09:00', close: '12:00', closed: false },
      sunday: { open: '09:00', close: '12:00', closed: true }
    },
    servicesOffered: [],
    insuranceNetworks: [],
    hospitalAffiliations: []
  });

  const [isLoading, setIsLoading] = useState(false);
const [loading, setLoading] = useState(true);


const fetchPractish = async () => {
  try {
    setLoading(true);
    const response = await getPractishSettingApi(token, user?.id);
    const data = response?.data;
    console.log(data);

    // === INSURANCE HANDLING ===
    const selectedInsurances = data.insuranceNetworks || [];

    const defaultInsurances = selectedInsurances.filter((ins) =>
      INSURANCE_NETWORKS.includes(ins)
    );

    const additionalInsurances = [
      ...new Set(
        (data.additionalInsuranceNetworks || []).concat(
          selectedInsurances.filter((ins) => !INSURANCE_NETWORKS.includes(ins))
        )
      ),
    ];

    const mergedInsurances = [...new Set([...INSURANCE_NETWORKS, ...additionalInsurances])];
    setInsuranceNetworks(mergedInsurances as string[]);

    // === SERVICES HANDLING ===
    const selectedServices = data.servicesOffered || [];

    const defaultServices = selectedServices.filter((srv) =>
      SERVICES.includes(srv)
    );

    const additionalServices = [
      ...new Set(
        (data.additionalServicesOffered || []).concat(
          selectedServices.filter((srv) => !SERVICES.includes(srv))
        )
      ),
    ];

    const mergedServices = [...new Set([...SERVICES, ...additionalServices])];
    setServices(mergedServices as string[]);

    // ✅ Set the selected values as-is (DO NOT override like before)
    setPracticeData({
      ...data,
      servicesOffered: selectedServices,
      additionalServicesOffered: additionalServices,
      insuranceNetworks: selectedInsurances,
      additionalInsuranceNetworks: additionalInsurances,
    });
  } catch (error) {
    console.error('Error fetching practice data:', error);
  } finally {
    setLoading(false);
  }
};






useEffect(() => {
  fetchPractish();
}, []);


  const handleInputChange = (field: string, value: string) => {
    setPracticeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() =>{
fetchPractish();
  },[])

  const handleOperatingHoursChange = (day: string, field: string, value: string | boolean) => {
    setPracticeData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day as keyof typeof prev.operatingHours],
          [field]: value
        }
      }
    }));
  };

   const handleAddInsurance = async () => {
    if (!networkName.trim()) {
      toast.error("Insurance name cannot be empty.");
      return;
    }

    const response = await addInsouranceNetworkApi({networkName},token);
    if (response?.success) {
      setNetworkName("");
      setAddOpenInsourace(false);
    }
  };

  const handleServiceToggle = (service: string) => {
    setPracticeData(prev => ({
      ...prev,
      servicesOffered: prev.servicesOffered.includes(service)
        ? prev.servicesOffered.filter(s => s !== service)
        : [...prev.servicesOffered, service]
    }));
  };



  const handleSubmit = async () => {
    if (!serviceName.trim()) {
      toast.error("Service name is required");
      return;
    }

    const result = await addServiceApi({ serviceName }, token);
    if (result?.success) {
      setOpen(false);
      setServiceName("");
    }
  };

  const handleInsuranceToggle = (insurance: string) => {
    setPracticeData(prev => ({
      ...prev,
      insuranceNetworks: prev.insuranceNetworks.includes(insurance)
        ? prev.insuranceNetworks.filter(i => i !== insurance)
        : [...prev.insuranceNetworks, insurance]
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
      const result = await practishSettingApi(practiceData, token);
    
      setIsLoading(false);
    
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Practice Setup</h2>
        <Button onClick={handleSave} disabled={isLoading} className="gap-2">
          <Save className="h-4 w-4" />
          {isLoading ? "Saving..." : "Save Practice Settings"}
        </Button>
      </div>

      {/* Basic Practice Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Basic Practice Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="practiceName">Practice Name *</Label>
              <Input
                id="practiceName"
                value={practiceData.practiceName}
                onChange={(e) => handleInputChange('practiceName', e.target.value)}
                placeholder="Enter practice name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="practiceType">Practice Type</Label>
              <Select value={practiceData.practiceType} onValueChange={(value) => handleInputChange('practiceType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select practice type" />
                </SelectTrigger>
                <SelectContent>
                  {PRACTICE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID / EIN</Label>
              <Input
                id="taxId"
                value={practiceData.taxId}
                onChange={(e) => handleInputChange('taxId', e.target.value)}
                placeholder="XX-XXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="npi">NPI Number</Label>
              <Input
                id="npi"
                value={practiceData.npi}
                onChange={(e) => handleInputChange('npi', e.target.value)}
                placeholder="10-digit NPI"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="practicePhone">Phone Number *</Label>
              <Input
                id="practicePhone"
                value={practiceData.practicePhone}
                onChange={(e) => handleInputChange('practicePhone', e.target.value)}
                placeholder="(XXX) XXX-XXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="practiceFax">Fax Number</Label>
              <Input
                id="practiceFax"
                value={practiceData.practiceFax}
                onChange={(e) => handleInputChange('practiceFax', e.target.value)}
                placeholder="(XXX) XXX-XXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="practiceEmail">Email Address *</Label>
              <Input
                id="practiceEmail"
                type="email"
                value={practiceData.practiceEmail}
                onChange={(e) => handleInputChange('practiceEmail', e.target.value)}
                placeholder="practice@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={practiceData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.example.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle>Practice Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="addressLine1">Address Line 1 *</Label>
              <Input
                id="addressLine1"
                value={practiceData.addressLine1}
                onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                placeholder="Street address"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                value={practiceData.addressLine2}
                onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                placeholder="Apartment, suite, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={practiceData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Select value={practiceData.state} onValueChange={(value) => handleInputChange('state', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                value={practiceData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                placeholder="XXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={practiceData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                disabled
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operating Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Operating Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="flex items-center gap-4">
              <div className="w-20 capitalize font-medium">{day}</div>
              <Checkbox
                checked={!practiceData.operatingHours[day as keyof typeof practiceData.operatingHours].closed}
                onCheckedChange={(checked) => handleOperatingHoursChange(day, 'closed', !checked)}
              />
              <Label className="text-sm">Open</Label>
              {!practiceData.operatingHours[day as keyof typeof practiceData.operatingHours].closed && (
                <>
                  <Input
                    type="time"
                    value={practiceData.operatingHours[day as keyof typeof practiceData.operatingHours].open}
                    onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                    className="w-32"
                  />
                  <span>to</span>
                  <Input
                    type="time"
                    value={practiceData.operatingHours[day as keyof typeof practiceData.operatingHours].close}
                    onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                    className="w-32"
                  />
                </>
              )}
              {practiceData.operatingHours[day as keyof typeof practiceData.operatingHours].closed && (
                <span className="text-muted-foreground">Closed</span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Services Offered */}
  <Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        Services Offered
      </CardTitle>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default">Create Service</Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="serviceName">Service Name</Label>
              <Input
                id="serviceName"
                placeholder="Enter service name"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button onClick={handleSubmit}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </CardHeader>

  <CardContent>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {SERVICES.map((service) => (
        <div key={service} className="flex items-center space-x-2">
          <Checkbox
            id={service}
            checked={practiceData.servicesOffered.includes(service)}
            onCheckedChange={() => handleServiceToggle(service)}
          />
          <Label htmlFor={service} className="text-sm">{service}</Label>
        </div>
      ))}
    </div>
  </CardContent>
</Card>


      {/* Insurance Networks */}
      <Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        Insurance Networks Accepted
      </CardTitle>

      <Dialog open={addOpenInsourace} onOpenChange={setAddOpenInsourace}>
        <DialogTrigger asChild>
          <Button variant="default">Create Insurance Networks</Button>
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Insurance Networks </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="serviceName">Insurance Networks Name</Label>
              <Input
                id="networkName"
                placeholder="Enter Insurance Networks"
                value={networkName}
                onChange={(e) => setNetworkName(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button onClick={handleAddInsurance}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </CardHeader>

 
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {INSURANCE_NETWORKS.map((insurance) => (
            <div key={insurance} className="flex items-center space-x-2">
              <Checkbox
                id={insurance}
                checked={practiceData.insuranceNetworks.includes(insurance)}
                onCheckedChange={() => handleInsuranceToggle(insurance)}
              />
              <Label htmlFor={insurance} className="text-sm">
                {insurance}
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
</Card>


    </div>
  );
};

export default PracticeSetupSettings;