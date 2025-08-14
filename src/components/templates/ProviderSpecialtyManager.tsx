import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Save, Trash2, User, Settings, FileText, Stethoscope } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProviderSpecialty {
  id: string;
  name: string;
  primarySpecialty: string;
  secondarySpecialties: string[];
  customTemplates: string[];
  preferences: {
    defaultEncounterType: string;
    preferredChiefComplaints: string[];
    customSoapSections: boolean;
    billingPreferences: any;
    qualityMeasures: string[];
  };
}

interface TemplatePreference {
  id: string;
  name: string;
  specialty: string;
  chiefComplaints: string[];
  customSections: any[];
  isActive: boolean;
}

const MEDICAL_SPECIALTIES = [
  'Family Medicine', 'Internal Medicine', 'Pediatrics', 'Cardiology',
  'Neurology', 'Orthopedics', 'Dermatology', 'Psychiatry', 'Emergency Medicine',
  'Urgent Care', 'Endocrinology', 'Gastroenterology', 'Pulmonology',
  'Nephrology', 'Oncology', 'Rheumatology', 'Infectious Disease',
  'Pain Management', 'Sports Medicine', 'Geriatrics', 'Women\'s Health',
  'Mental Health', 'Physical Therapy', 'Occupational Health'
];

const CHIEF_COMPLAINTS_BY_SPECIALTY = {
  'Family Medicine': [
    'Annual Physical', 'Upper Respiratory Infection', 'Hypertension Follow-up',
    'Diabetes Management', 'Preventive Care', 'Minor Injury', 'Rash',
    'Headache', 'Back Pain', 'Fatigue', 'Weight Management'
  ],
  'Cardiology': [
    'Chest Pain', 'Palpitations', 'Shortness of Breath', 'Hypertension',
    'Heart Murmur', 'Syncope', 'Atrial Fibrillation', 'Heart Failure',
    'Post-MI Follow-up', 'Cardiac Catheterization Follow-up'
  ],
  'Pediatrics': [
    'Well Child Visit', 'Fever', 'Ear Infection', 'Sore Throat',
    'Developmental Assessment', 'Immunizations', 'Asthma', 'ADHD',
    'Growth Concerns', 'Behavioral Issues'
  ],
  // Add more specialties...
};

export const ProviderSpecialtyManager: React.FC = () => {
  const [providers, setProviders] = useState<ProviderSpecialty[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ProviderSpecialty | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [templates, setTemplates] = useState<TemplatePreference[]>([]);

  const [newProvider, setNewProvider] = useState({
    name: '',
    primarySpecialty: '',
    secondarySpecialties: [] as string[],
    preferences: {
      defaultEncounterType: 'routine',
      preferredChiefComplaints: [] as string[],
      customSoapSections: false,
      billingPreferences: {},
      qualityMeasures: [] as string[]
    }
  });

  useEffect(() => {
    // Load existing providers and templates
    loadProviderData();
  }, []);

  const loadProviderData = () => {
    // In real implementation, load from API
    const mockProviders: ProviderSpecialty[] = [
      {
        id: '1',
        name: 'Dr. Smith',
        primarySpecialty: 'Family Medicine',
        secondarySpecialties: ['Urgent Care'],
        customTemplates: ['annual-physical-custom', 'diabetes-follow-up'],
        preferences: {
          defaultEncounterType: 'routine',
          preferredChiefComplaints: ['Annual Physical', 'Diabetes Management'],
          customSoapSections: true,
          billingPreferences: {},
          qualityMeasures: ['HEDIS', 'CMS']
        }
      }
    ];
    setProviders(mockProviders);
  };

  const handleSaveProvider = () => {
    const providerId = selectedProvider?.id || Date.now().toString();
    
    const updatedProvider: ProviderSpecialty = {
      id: providerId,
      name: newProvider.name,
      primarySpecialty: newProvider.primarySpecialty,
      secondarySpecialties: newProvider.secondarySpecialties,
      customTemplates: selectedProvider?.customTemplates || [],
      preferences: newProvider.preferences
    };

    if (selectedProvider) {
      setProviders(prev => prev.map(p => p.id === providerId ? updatedProvider : p));
    } else {
      setProviders(prev => [...prev, updatedProvider]);
    }

    setIsEditing(false);
    setSelectedProvider(updatedProvider);
    toast({
      title: "Provider Saved",
      description: "Provider specialty configuration has been saved successfully.",
    });
  };

  const handleEditProvider = (provider: ProviderSpecialty) => {
    setSelectedProvider(provider);
    setNewProvider({
      name: provider.name,
      primarySpecialty: provider.primarySpecialty,
      secondarySpecialties: provider.secondarySpecialties,
      preferences: provider.preferences
    });
    setIsEditing(true);
  };

  const addChiefComplaint = (complaint: string) => {
    if (!newProvider.preferences.preferredChiefComplaints.includes(complaint)) {
      setNewProvider(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          preferredChiefComplaints: [...prev.preferences.preferredChiefComplaints, complaint]
        }
      }));
    }
  };

  const removeChiefComplaint = (complaint: string) => {
    setNewProvider(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        preferredChiefComplaints: prev.preferences.preferredChiefComplaints.filter(c => c !== complaint)
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Provider Specialty Management</h2>
          <p className="text-muted-foreground">Configure specialty-specific templates and preferences</p>
        </div>
        <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Provider
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Provider List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Providers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="p-3 border rounded-lg cursor-pointer hover:bg-accent"
                onClick={() => setSelectedProvider(provider)}
              >
                <div className="font-medium">{provider.name}</div>
                <div className="text-sm text-muted-foreground">{provider.primarySpecialty}</div>
                <div className="flex gap-1 mt-1">
                  {provider.secondarySpecialties.map((spec) => (
                    <Badge key={spec} variant="outline" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Provider Configuration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {isEditing ? 'Configure Provider' : 'Provider Details'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="specialties">Specialties</TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Provider Name</Label>
                      <Input
                        id="name"
                        value={newProvider.name}
                        onChange={(e) => setNewProvider(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Dr. John Smith"
                      />
                    </div>
                    <div>
                      <Label htmlFor="primary">Primary Specialty</Label>
                      <Select
                        value={newProvider.primarySpecialty}
                        onValueChange={(value) => setNewProvider(prev => ({ ...prev, primarySpecialty: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          {MEDICAL_SPECIALTIES.map((specialty) => (
                            <SelectItem key={specialty} value={specialty}>
                              {specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="specialties" className="space-y-4">
                  <div>
                    <Label>Secondary Specialties</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newProvider.secondarySpecialties.map((spec) => (
                        <Badge key={spec} variant="secondary" className="cursor-pointer">
                          {spec}
                          <button
                            onClick={() => setNewProvider(prev => ({
                              ...prev,
                              secondarySpecialties: prev.secondarySpecialties.filter(s => s !== spec)
                            }))}
                            className="ml-1 text-xs"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <Select
                      onValueChange={(value) => {
                        if (!newProvider.secondarySpecialties.includes(value)) {
                          setNewProvider(prev => ({
                            ...prev,
                            secondarySpecialties: [...prev.secondarySpecialties, value]
                          }));
                        }
                      }}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Add secondary specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        {MEDICAL_SPECIALTIES.filter(s => s !== newProvider.primarySpecialty).map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="preferences" className="space-y-4">
                  <div>
                    <Label>Preferred Chief Complaints</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newProvider.preferences.preferredChiefComplaints.map((complaint) => (
                        <Badge key={complaint} variant="secondary" className="cursor-pointer">
                          {complaint}
                          <button
                            onClick={() => removeChiefComplaint(complaint)}
                            className="ml-1 text-xs"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {(CHIEF_COMPLAINTS_BY_SPECIALTY[newProvider.primarySpecialty as keyof typeof CHIEF_COMPLAINTS_BY_SPECIALTY] || []).map((complaint) => (
                        <Button
                          key={complaint}
                          variant="outline"
                          size="sm"
                          onClick={() => addChiefComplaint(complaint)}
                          disabled={newProvider.preferences.preferredChiefComplaints.includes(complaint)}
                        >
                          {complaint}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Custom SOAP Sections</Label>
                      <p className="text-sm text-muted-foreground">Enable custom SOAP note sections</p>
                    </div>
                    <Switch
                      checked={newProvider.preferences.customSoapSections}
                      onCheckedChange={(checked) => setNewProvider(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, customSoapSections: checked }
                      }))}
                    />
                  </div>
                </TabsContent>

                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProvider}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Provider
                  </Button>
                </div>
              </Tabs>
            ) : selectedProvider ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{selectedProvider.name}</h3>
                  <Button variant="outline" onClick={() => handleEditProvider(selectedProvider)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Primary Specialty</Label>
                    <p className="text-sm mt-1">{selectedProvider.primarySpecialty}</p>
                  </div>
                  <div>
                    <Label>Secondary Specialties</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedProvider.secondarySpecialties.map((spec) => (
                        <Badge key={spec} variant="outline">{spec}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Preferred Chief Complaints</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedProvider.preferences.preferredChiefComplaints.map((complaint) => (
                      <Badge key={complaint} variant="secondary">{complaint}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Custom Templates</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedProvider.customTemplates.length} custom templates configured
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a provider to view details or click "Add Provider" to create a new one.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};