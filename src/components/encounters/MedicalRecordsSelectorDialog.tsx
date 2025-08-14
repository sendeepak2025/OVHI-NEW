import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, Search, Filter, Calendar, 
  Stethoscope, FileImage, Pill, TestTube
} from 'lucide-react';
import { MedicalRecord } from '@/types/dataTypes';

interface MedicalRecordsSelectorDialogProps {
  medicalRecords: MedicalRecord[];
  selectedRecords: string[];
  onSelectionChange: (recordIds: string[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export const MedicalRecordsSelectorDialog: React.FC<MedicalRecordsSelectorDialogProps> = ({
  medicalRecords,
  selectedRecords,
  onSelectionChange,
  open,
  onOpenChange,
  title = "Select Medical Records",
  description = "Choose medical records to attach"
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  // Get unique record types for filtering
  const recordTypes = [...new Set(medicalRecords.map(record => record.type))];

  // Filter and sort records
  const filteredRecords = medicalRecords
    .filter(record => {
      const matchesSearch = record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.provider.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || record.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'type':
          return a.type.localeCompare(b.type);
        case 'provider':
          return a.provider.localeCompare(b.provider);
        default:
          return 0;
      }
    });

  const handleRecordSelection = (recordId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedRecords, recordId]);
    } else {
      onSelectionChange(selectedRecords.filter(id => id !== recordId));
    }
  };

  const handleSelectAll = () => {
    if (selectedRecords.length === filteredRecords.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredRecords.map(record => record.id));
    }
  };

  const getRecordIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('lab') || lowerType.includes('test')) return <TestTube className="h-4 w-4" />;
    if (lowerType.includes('image') || lowerType.includes('xray') || lowerType.includes('scan')) return <FileImage className="h-4 w-4" />;
    if (lowerType.includes('medication') || lowerType.includes('prescription')) return <Pill className="h-4 w-4" />;
    if (lowerType.includes('visit') || lowerType.includes('encounter')) return <Stethoscope className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getRecordTypeColor = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('lab')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (lowerType.includes('image')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (lowerType.includes('medication')) return 'bg-green-100 text-green-800 border-green-200';
    if (lowerType.includes('visit')) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            {title}
          </DialogTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </DialogHeader>

        {/* Search and Filter Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-4 w-4 mr-2" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="search">Search Records</Label>
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by description, type, or provider..."
                  className="w-full"
                />
              </div>
              
              <div>
                <Label htmlFor="filterType">Filter by Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {recordTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="sortBy">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Date (Newest)</SelectItem>
                    <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                    <SelectItem value="provider">Provider</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedRecords.length === filteredRecords.length ? 'Deselect All' : 'Select All'}
              </Button>
              
              <div className="text-sm text-muted-foreground">
                {selectedRecords.length} of {filteredRecords.length} records selected
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Records List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Medical Records ({filteredRecords.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No records found matching your criteria
                </div>
              ) : (
                filteredRecords.map((record) => (
                  <div key={record.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id={`record-${record.id}`}
                      checked={selectedRecords.includes(record.id)}
                      onCheckedChange={(checked) => 
                        handleRecordSelection(record.id, checked as boolean)
                      }
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        {getRecordIcon(record.type)}
                        <Label 
                          htmlFor={`record-${record.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {record.type}
                        </Label>
                        <Badge className={getRecordTypeColor(record.type)}>
                          {record.type}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {record.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(record.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Stethoscope className="h-3 w-3" />
                          <span>{record.provider}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary and Actions */}
        {selectedRecords.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <strong>{selectedRecords.length}</strong> medical record(s) selected for attachment
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => onOpenChange(false)}>
                    Confirm Selection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};