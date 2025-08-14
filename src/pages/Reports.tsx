
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Filter, Download, Search, Calendar, PlusCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock report data
const patientReportData = [
  { 
    id: '1', 
    name: 'James Wilson', 
    type: 'Health Assessment',
    date: '2025-03-12',
    doctor: 'Dr. Sarah Johnson',
    status: 'Complete'
  },
  { 
    id: '2', 
    name: 'Maria Garcia', 
    type: 'Lab Results',
    date: '2025-03-08',
    doctor: 'Dr. Sarah Johnson',
    status: 'Pending'
  },
  { 
    id: '3', 
    name: 'Robert Chen', 
    type: 'Progress Notes',
    date: '2025-03-01',
    doctor: 'Dr. Sarah Johnson',
    status: 'Complete'
  },
  { 
    id: '4', 
    name: 'Emily Johnson', 
    type: 'Diagnostic Report',
    date: '2025-02-25',
    doctor: 'Dr. Sarah Johnson',
    status: 'Complete'
  },
  { 
    id: '5', 
    name: 'David Rodriguez', 
    type: 'Treatment Plan',
    date: '2025-02-20',
    doctor: 'Dr. Sarah Johnson',
    status: 'Pending'
  }
];

// Mock clinic reports data
const clinicReportData = [
  { 
    id: '1', 
    name: 'Monthly Patient Summary',
    date: '2025-03-01',
    category: 'Analytics',
    status: 'Generated'
  },
  { 
    id: '2', 
    name: 'Quarterly Performance Review',
    date: '2025-01-01',
    category: 'Performance',
    status: 'Generated'
  },
  { 
    id: '3', 
    name: 'Annual Financial Report',
    date: '2024-12-31',
    category: 'Financial',
    status: 'Generated'
  }
];

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'complete':
    case 'generated':
      return 'bg-health-green border-health-green text-white';
    case 'pending':
      return 'bg-health-blue border-health-blue text-white';
    default:
      return 'bg-secondary border-secondary text-secondary-foreground';
  }
};

const Reports: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('patient');
  
  // Filter reports based on search term
  const filteredPatientReports = patientReportData.filter(report => 
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredClinicReports = clinicReportData.filter(report => 
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Manage and generate patient and clinic reports
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Generate New Report
        </Button>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="patient">Patient Reports</TabsTrigger>
          <TabsTrigger value="clinic">Clinic Reports</TabsTrigger>
        </TabsList>
        
        <div className="flex flex-col md:flex-row items-center gap-4 my-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="health">Health Assessment</SelectItem>
                <SelectItem value="lab">Lab Results</SelectItem>
                <SelectItem value="progress">Progress Notes</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <TabsContent value="patient" className="mt-0">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Patient Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Report Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatientReports.length > 0 ? (
                    filteredPatientReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.name}</TableCell>
                        <TableCell>{report.type}</TableCell>
                        <TableCell>{formatDate(report.date)}</TableCell>
                        <TableCell>{report.doctor}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4 mr-2" /> View
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4 mr-2" /> Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No reports found. Try adjusting your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="clinic" className="mt-0">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Clinic Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Date Generated</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClinicReports.length > 0 ? (
                    filteredClinicReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.name}</TableCell>
                        <TableCell>{formatDate(report.date)}</TableCell>
                        <TableCell>{report.category}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4 mr-2" /> View
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4 mr-2" /> Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No clinic reports found. Try adjusting your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
