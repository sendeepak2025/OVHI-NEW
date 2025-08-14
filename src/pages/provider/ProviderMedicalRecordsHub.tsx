import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, Send, FileText, Eye, Calendar, User, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/contexts/DataContext';
import { MedicalRecordDetailModal } from '@/components/patient/MedicalRecordDetailModal';
import { ProviderFaxManager } from '@/components/provider/ProviderFaxManager';
import { ProviderAnalyticsDashboard } from '@/components/provider/ProviderAnalyticsDashboard';

const ProviderMedicalRecordsHub: React.FC = () => {
  const { patients, medicalRecords } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecordType, setSelectedRecordType] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFaxManagerOpen, setIsFaxManagerOpen] = useState(false);
  const [selectedRecordsForFax, setSelectedRecordsForFax] = useState<any[]>([]);

  // Get all medical records with patient information
  const allRecordsWithPatients = useMemo(() => {
    return medicalRecords.map(record => {
      const patient = patients.find(p => p.id === record.patientId);
      return {
        ...record,
        patientName: patient ? `${patient.firstName || patient.firstname || ''} ${patient.lastName || patient.lastname || ''}`.trim() : 'Unknown Patient',
        patientInfo: patient
      };
    });
  }, [medicalRecords, patients]);

  // Filter records based on search and filters
  const filteredRecords = useMemo(() => {
    return allRecordsWithPatients.filter(record => {
      const matchesSearch = 
        record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.provider.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = selectedRecordType === 'all' || record.type === selectedRecordType;
      const matchesPatient = selectedPatient === 'all' || record.patientId === selectedPatient;
      
      return matchesSearch && matchesType && matchesPatient;
    });
  }, [allRecordsWithPatients, searchQuery, selectedRecordType, selectedPatient]);

  // Get unique record types and patients for filters
  const recordTypes = [...new Set(medicalRecords.map(record => record.type))];
  const patientOptions = patients.map(patient => ({
    id: patient.id,
    name: `${patient.firstName || patient.firstname || ''} ${patient.lastName || patient.lastname || ''}`.trim()
  }));

  const handleViewRecord = (record: any) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
  };

  const handleFaxRecords = (records: any[]) => {
    setSelectedRecordsForFax(records);
    setIsFaxManagerOpen(true);
  };

  const getRecordTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'Lab Results': 'bg-blue-100 text-blue-800',
      'Radiology': 'bg-green-100 text-green-800',
      'Specialist Consult': 'bg-purple-100 text-purple-800',
      'Surgical Report': 'bg-red-100 text-red-800',
      'Progress Notes': 'bg-yellow-100 text-yellow-800',
      'Pathology': 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Provider Medical Records Hub</h1>
          <p className="text-muted-foreground">Centralized access to all patient medical records</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleFaxRecords(filteredRecords)} variant="outline">
            <Send className="w-4 h-4 mr-2" />
            Bulk Fax
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Records
          </Button>
        </div>
      </div>

      <Tabs defaultValue="records" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="records">Medical Records</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by patient name, record type, or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedRecordType} onValueChange={setSelectedRecordType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Record Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {recordTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Patient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Patients</SelectItem>
                    {patientOptions.map(patient => (
                      <SelectItem key={patient.id} value={patient.id}>{patient.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Records Table */}
          <Card>
            <CardHeader>
              <CardTitle>Medical Records ({filteredRecords.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Record Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{record.patientName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRecordTypeColor(record.type)}>
                          {record.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{new Date(record.date).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span>{record.provider}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {record.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewRecord(record)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFaxRecords([record])}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <ProviderAnalyticsDashboard records={filteredRecords} patients={patients} />
        </TabsContent>

        <TabsContent value="communication">
          <Card>
            <CardHeader>
              <CardTitle>Provider Communication Center</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Communication features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {selectedRecord && (
        <MedicalRecordDetailModal
          record={selectedRecord}
          open={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
          onFax={() => handleFaxRecords([selectedRecord])}
        />
      )}

      <ProviderFaxManager
        isOpen={isFaxManagerOpen}
        onClose={() => setIsFaxManagerOpen(false)}
        records={selectedRecordsForFax}
      />
    </div>
  );
};

export default ProviderMedicalRecordsHub;