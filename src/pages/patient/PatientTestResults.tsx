
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Download, Eye, FileText } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { formatDate } from '@/utils/formatHelpers';

const PatientTestResults: React.FC = () => {
  const { patients } = useData();
  const patient = patients[0]; // Demo patient

  // Mock test results data
  const testResults = [
    {
      id: '1',
      testName: 'Complete Blood Count (CBC)',
      date: '2025-03-01',
      status: 'Completed',
      results: 'Normal',
      orderedBy: patient?.primaryDoctor || 'Dr. Sarah Johnson',
      lab: 'LabCorp',
      notes: 'All values within normal range'
    },
    {
      id: '2',
      testName: 'Lipid Panel',
      date: '2025-02-28',
      status: 'Completed',
      results: 'Abnormal',
      orderedBy: patient?.primaryDoctor || 'Dr. Sarah Johnson',
      lab: 'Quest Diagnostics',
      notes: 'Elevated cholesterol levels - follow up recommended'
    },
    {
      id: '3',
      testName: 'HbA1c (Diabetes)',
      date: '2025-02-25',
      status: 'Completed',
      results: 'Normal',
      orderedBy: patient?.primaryDoctor || 'Dr. Sarah Johnson',
      lab: 'LabCorp',
      notes: 'Good diabetes control'
    },
    {
      id: '4',
      testName: 'Thyroid Function Panel',
      date: '2025-02-20',
      status: 'Pending',
      results: 'Pending',
      orderedBy: patient?.primaryDoctor || 'Dr. Sarah Johnson',
      lab: 'Quest Diagnostics',
      notes: 'Results expected within 24-48 hours'
    }
  ];

  const getResultColor = (result: string) => {
    switch (result.toLowerCase()) {
      case 'normal': return 'bg-green-100 text-green-800 border-green-200';
      case 'abnormal': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!patient) {
    return <div>No patient data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Test Results</h1>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download All Results
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testResults.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {testResults.filter(t => t.status === 'Completed').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Activity className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {testResults.filter(t => t.status === 'Pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abnormal</CardTitle>
            <Activity className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {testResults.filter(t => t.results === 'Abnormal').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Recent Test Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testResults.map((test) => (
              <div key={test.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-semibold">{test.testName}</h4>
                    <p className="text-sm text-muted-foreground">
                      Ordered by {test.orderedBy} • {test.lab}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(test.status)}>
                      {test.status}
                    </Badge>
                    <Badge className={getResultColor(test.results)}>
                      {test.results}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Test Date</p>
                    <p className="font-medium">{formatDate(test.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Lab</p>
                    <p className="font-medium">{test.lab}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <p className="font-medium">{test.status}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="text-sm">{test.notes}</p>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientTestResults;
