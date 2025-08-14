import React, { useState } from 'react';
import { Send, X, Plus, Search, Building2, Phone, Mail, FileText, Check, Clock, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface ProviderFaxManagerProps {
  isOpen: boolean;
  onClose: () => void;
  records: any[];
}

interface Provider {
  id: string;
  name: string;
  specialty: string;
  faxNumber: string;
  phone: string;
  email: string;
  organization: string;
  isFavorite?: boolean;
}

const mockProviders: Provider[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    faxNumber: '555-0123',
    phone: '555-0124',
    email: 'sarah.johnson@heartcenter.com',
    organization: 'Heart Center Medical Group',
    isFavorite: true
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Orthopedics',
    faxNumber: '555-0234',
    phone: '555-0235',
    email: 'michael.chen@bonesandjoints.com',
    organization: 'Bones & Joints Clinic'
  },
  {
    id: '3',
    name: 'Dr. Lisa Rodriguez',
    specialty: 'Radiology',
    faxNumber: '555-0345',
    phone: '555-0346',
    email: 'lisa.rodriguez@imagingcenter.com',
    organization: 'Advanced Imaging Center',
    isFavorite: true
  }
];

const mockFaxHistory = [
  {
    id: '1',
    recipient: 'Dr. Sarah Johnson',
    recordCount: 3,
    status: 'delivered',
    sentAt: '2024-01-15T10:30:00Z',
    patientName: 'John Smith'
  },
  {
    id: '2',
    recipient: 'Dr. Michael Chen',
    recordCount: 1,
    status: 'pending',
    sentAt: '2024-01-15T09:15:00Z',
    patientName: 'Jane Doe'
  }
];

export const ProviderFaxManager: React.FC<ProviderFaxManagerProps> = ({
  isOpen,
  onClose,
  records
}) => {
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [searchProvider, setSearchProvider] = useState('');
  const [selectedRecords, setSelectedRecords] = useState<string[]>(records.map(r => r.id));
  const [coverLetter, setCoverLetter] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [activeTab, setActiveTab] = useState('compose');

  const filteredProviders = mockProviders.filter(provider =>
    provider.name.toLowerCase().includes(searchProvider.toLowerCase()) ||
    provider.specialty.toLowerCase().includes(searchProvider.toLowerCase()) ||
    provider.organization.toLowerCase().includes(searchProvider.toLowerCase())
  );

  const handleSendFax = async () => {
    if (!selectedProvider || selectedRecords.length === 0) {
      toast.error('Please select a provider and at least one record');
      return;
    }

    try {
      // Simulate fax sending
      toast.success(`Fax sent successfully to ${selectedProvider.name}`);
      onClose();
    } catch (error) {
      toast.error('Failed to send fax. Please try again.');
    }
  };

  const toggleRecordSelection = (recordId: string) => {
    setSelectedRecords(prev =>
      prev.includes(recordId)
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Send className="w-5 h-5" />
            <span>Provider Fax Manager</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="compose">Compose Fax</TabsTrigger>
            <TabsTrigger value="providers">Provider Directory</TabsTrigger>
            <TabsTrigger value="history">Fax History</TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Provider Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Provider</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search providers..."
                      value={searchProvider}
                      onChange={(e) => setSearchProvider(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {selectedProvider ? (
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{selectedProvider.name}</h4>
                          <p className="text-sm text-muted-foreground">{selectedProvider.specialty}</p>
                          <p className="text-sm text-muted-foreground">{selectedProvider.organization}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center space-x-1">
                              <Phone className="w-3 h-3" />
                              <span>{selectedProvider.faxNumber}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Mail className="w-3 h-3" />
                              <span>{selectedProvider.email}</span>
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedProvider(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {filteredProviders.map((provider) => (
                        <div
                          key={provider.id}
                          className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => setSelectedProvider(provider)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-sm">{provider.name}</h4>
                              <p className="text-xs text-muted-foreground">{provider.specialty}</p>
                              <p className="text-xs text-muted-foreground">{provider.organization}</p>
                            </div>
                            {provider.isFavorite && (
                              <Badge variant="secondary" className="text-xs">Favorite</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Records Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Medical Records ({selectedRecords.length} selected)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {records.map((record) => (
                      <div key={record.id} className="flex items-start space-x-3 p-2 border rounded">
                        <Checkbox
                          checked={selectedRecords.includes(record.id)}
                          onCheckedChange={() => toggleRecordSelection(record.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{record.type}</span>
                            <Badge variant="outline" className="text-xs">
                              {new Date(record.date).toLocaleDateString()}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {record.patientName} - {record.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Fax Details */}
            <Card>
              <CardHeader>
                <CardTitle>Fax Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Urgency Level</label>
                  <Select value={urgency} onValueChange={setUrgency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="stat">STAT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Cover Letter</label>
                  <Textarea
                    placeholder="Enter cover letter message..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSendFax}>
                <Send className="w-4 h-4 mr-2" />
                Send Fax
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="providers" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Provider Directory</h3>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Provider
              </Button>
            </div>
            
            <div className="grid gap-4">
              {mockProviders.map((provider) => (
                <Card key={provider.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{provider.name}</h4>
                          {provider.isFavorite && (
                            <Badge variant="secondary">Favorite</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{provider.specialty}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Building2 className="w-4 h-4" />
                          <span>{provider.organization}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Phone className="w-4 h-4" />
                            <span>{provider.faxNumber}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{provider.email}</span>
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <h3 className="text-lg font-semibold">Fax History</h3>
            
            <div className="space-y-4">
              {mockFaxHistory.map((fax) => (
                <Card key={fax.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">To: {fax.recipient}</h4>
                          <Badge className={getStatusColor(fax.status)}>
                            <span className="flex items-center space-x-1">
                              {getStatusIcon(fax.status)}
                              <span className="capitalize">{fax.status}</span>
                            </span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Patient: {fax.patientName} • {fax.recordCount} record(s)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Sent: {new Date(fax.sentAt).toLocaleString()}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};