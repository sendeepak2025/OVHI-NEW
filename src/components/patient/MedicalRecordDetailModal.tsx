import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  Send, 
  Calendar, 
  User, 
  ClipboardList,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { MedicalRecord } from '@/types/dataTypes';

interface MedicalRecordDetailModalProps {
  record: MedicalRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFax: () => void;
}

export const MedicalRecordDetailModal: React.FC<MedicalRecordDetailModalProps> = ({
  record,
  open,
  onOpenChange,
  onFax
}) => {
  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'Lab Results': return <Activity className="h-5 w-5" />;
      case 'Radiology': return <FileText className="h-5 w-5" />;
      case 'Specialist Consult': return <User className="h-5 w-5" />;
      case 'Surgical Report': return <ClipboardList className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'Lab Results': return 'bg-blue-100 text-blue-800';
      case 'Radiology': return 'bg-green-100 text-green-800';
      case 'Specialist Consult': return 'bg-purple-100 text-purple-800';
      case 'Surgical Report': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderLabResults = (details: any) => {
    if (!details) return null;
    
    return (
      <div className="space-y-4">
        <h4 className="font-medium">Lab Values</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(details).map(([key, value]) => (
            <div key={key} className="p-3 border rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-sm">{value as string}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRadiologyResults = (details: any) => {
    if (!details) return null;
    
    return (
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Findings</h4>
          <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
            {details.findings}
          </p>
        </div>
        {details.impression && (
          <div>
            <h4 className="font-medium mb-2">Impression</h4>
            <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
              {details.impression}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderConsultResults = (details: any) => {
    if (!details) return null;
    
    return (
      <div className="space-y-4">
        {details.reason && (
          <div>
            <h4 className="font-medium mb-2">Reason for Consultation</h4>
            <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
              {details.reason}
            </p>
          </div>
        )}
        {details.findings && (
          <div>
            <h4 className="font-medium mb-2">Clinical Findings</h4>
            <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
              {details.findings}
            </p>
          </div>
        )}
        {details.recommendations && (
          <div>
            <h4 className="font-medium mb-2">Recommendations</h4>
            <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
              {details.recommendations}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderSurgicalResults = (details: any) => {
    if (!details) return null;
    
    return (
      <div className="space-y-4">
        {details.procedure && (
          <div>
            <h4 className="font-medium mb-2">Procedure</h4>
            <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
              {details.procedure}
            </p>
          </div>
        )}
        {details.findings && (
          <div>
            <h4 className="font-medium mb-2">Surgical Findings</h4>
            <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
              {details.findings}
            </p>
          </div>
        )}
        {details.complications && (
          <div>
            <h4 className="font-medium mb-2">Complications</h4>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              {details.complications === 'None' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              )}
              <span className="text-sm text-muted-foreground">{details.complications}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRecordDetails = () => {
    switch (record.type) {
      case 'Lab Results':
        return renderLabResults(record.details);
      case 'Radiology':
        return renderRadiologyResults(record.details);
      case 'Specialist Consult':
        return renderConsultResults(record.details);
      case 'Surgical Report':
        return renderSurgicalResults(record.details);
      default:
        return (
          <div className="p-3 bg-muted/50 rounded-lg">
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(record.details, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getRecordTypeIcon(record.type)}
            <div>
              <DialogTitle className="text-xl">{record.description}</DialogTitle>
              <div className="flex items-center gap-3 mt-2">
                <Badge className={getRecordTypeColor(record.type)}>
                  {record.type}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(record.date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  {record.provider}
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Record Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Record Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <p className="mt-1">{new Date(record.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Provider</label>
                  <p className="mt-1">{record.provider}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="mt-1">{record.type}</p>
                </div>
                {record.file && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">File</label>
                    <p className="mt-1 text-blue-600">{record.file}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Record Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Clinical Details</CardTitle>
            </CardHeader>
            <CardContent>
              {renderRecordDetails()}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button onClick={onFax} className="flex-1 sm:flex-none">
              <Send className="h-4 w-4 mr-2" />
              Send Fax
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none">
              <FileText className="h-4 w-4 mr-2" />
              View PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};