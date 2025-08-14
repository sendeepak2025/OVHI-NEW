import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  FileText, 
  Download, 
  Send, 
  Eye, 
  Calendar,
  Activity,
  TrendingUp,
  Plus,
  Archive
} from 'lucide-react';
import { MedicalRecord } from '@/types/dataTypes';
import { MedicalRecordDetailModal } from './MedicalRecordDetailModal';
import { MedicalRecordsTimeline } from './MedicalRecordsTimeline';
import { LabResultsAnalyzer } from './LabResultsAnalyzer';

interface MedicalRecordsManagerProps {
  records: MedicalRecord[];
  patientId: string;
  onEdit?: () => void;
  onFaxRecord?: (recordId: string) => void;
}

export const MedicalRecordsManager: React.FC<MedicalRecordsManagerProps> = ({
  records,
  patientId,
  onEdit,
  onFaxRecord
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'timeline' | 'analytics'>('table');

  // Filter and search records
  const filteredRecords = records.filter(record => {
    const matchesSearch = searchQuery.toLowerCase() === '' || 
      record.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.provider.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || record.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Get unique record types for filter
  const recordTypes = Array.from(new Set(records.map(record => record.type)));

  // Categorize records by type
  const labResults = records.filter(r => r.type === 'Lab Results');
  const radiologyResults = records.filter(r => r.type === 'Radiology');
  const consultReports = records.filter(r => r.type === 'Specialist Consult');
  const surgicalReports = records.filter(r => r.type === 'Surgical Report');

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'Lab Results': return 'bg-blue-100 text-blue-800';
      case 'Radiology': return 'bg-green-100 text-green-800';
      case 'Specialist Consult': return 'bg-purple-100 text-purple-800';
      case 'Surgical Report': return 'bg-red-100 text-red-800';
      case 'Progress Notes': return 'bg-yellow-100 text-yellow-800';
      case 'Pathology': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRecordAction = (action: string, record: MedicalRecord) => {
    switch (action) {
      case 'view':
        setSelectedRecord(record);
        break;
      case 'fax':
        onFaxRecord?.(record.id);
        break;
      case 'download':
        // Implement download logic
        console.log('Download record:', record.id);
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Medical Records</h2>
          <p className="text-muted-foreground">
            Comprehensive patient medical history and documentation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Button>
          <Button variant="outline" size="sm">
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search records by type, description, or provider..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {recordTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button 
                variant={viewMode === 'table' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <FileText className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'timeline' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('timeline')}
              >
                <Calendar className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'analytics' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('analytics')}
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {viewMode === 'table' && (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Records ({filteredRecords.length})</TabsTrigger>
            <TabsTrigger value="labs">Lab Results ({labResults.length})</TabsTrigger>
            <TabsTrigger value="radiology">Radiology ({radiologyResults.length})</TabsTrigger>
            <TabsTrigger value="consults">Consults ({consultReports.length})</TabsTrigger>
            <TabsTrigger value="surgical">Surgical ({surgicalReports.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium">Date</th>
                        <th className="text-left p-4 font-medium">Type</th>
                        <th className="text-left p-4 font-medium">Provider</th>
                        <th className="text-left p-4 font-medium">Description</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map((record) => (
                        <tr key={record.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <Badge className={getRecordTypeColor(record.type)}>
                              {record.type}
                            </Badge>
                          </td>
                          <td className="p-4 font-medium">{record.provider}</td>
                          <td className="p-4">{record.description}</td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRecordAction('view', record)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRecordAction('fax', record)}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRecordAction('download', record)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="labs">
            <LabResultsAnalyzer records={labResults} />
          </TabsContent>

          <TabsContent value="radiology">
            <Card>
              <CardHeader>
                <CardTitle>Radiology Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {radiologyResults.map((record) => (
                    <div key={record.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{record.description}</h4>
                          <p className="text-sm text-muted-foreground">{record.provider}</p>
                          <p className="text-sm text-muted-foreground">{record.date}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setSelectedRecord(record)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => onFaxRecord?.(record.id)}>
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consults">
            <Card>
              <CardHeader>
                <CardTitle>Specialist Consultations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {consultReports.map((record) => (
                    <div key={record.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{record.description}</h4>
                          <p className="text-sm text-muted-foreground">{record.provider}</p>
                          <p className="text-sm text-muted-foreground">{record.date}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setSelectedRecord(record)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => onFaxRecord?.(record.id)}>
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="surgical">
            <Card>
              <CardHeader>
                <CardTitle>Surgical Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {surgicalReports.map((record) => (
                    <div key={record.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{record.description}</h4>
                          <p className="text-sm text-muted-foreground">{record.provider}</p>
                          <p className="text-sm text-muted-foreground">{record.date}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setSelectedRecord(record)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => onFaxRecord?.(record.id)}>
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {viewMode === 'timeline' && (
        <MedicalRecordsTimeline records={filteredRecords} />
      )}

      {viewMode === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Records Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Records</span>
                  <span className="font-medium">{records.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lab Results</span>
                  <span className="font-medium">{labResults.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Radiology Reports</span>
                  <span className="font-medium">{radiologyResults.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Consult Reports</span>
                  <span className="font-medium">{consultReports.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {records.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{record.description}</p>
                      <p className="text-xs text-muted-foreground">{record.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRecord && (
        <MedicalRecordDetailModal
          record={selectedRecord}
          open={!!selectedRecord}
          onOpenChange={(open) => !open && setSelectedRecord(null)}
          onFax={() => onFaxRecord?.(selectedRecord.id)}
        />
      )}
    </div>
  );
};