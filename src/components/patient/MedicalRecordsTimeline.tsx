import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  FileText, 
  User, 
  ClipboardList, 
  Calendar,
  ChevronRight,
  Eye
} from 'lucide-react';
import { MedicalRecord } from '@/types/dataTypes';

interface MedicalRecordsTimelineProps {
  records: MedicalRecord[];
}

export const MedicalRecordsTimeline: React.FC<MedicalRecordsTimelineProps> = ({ records }) => {
  // Sort records by date (newest first)
  const sortedRecords = [...records].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'Lab Results': return <Activity className="h-4 w-4" />;
      case 'Radiology': return <FileText className="h-4 w-4" />;
      case 'Specialist Consult': return <User className="h-4 w-4" />;
      case 'Surgical Report': return <ClipboardList className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'Lab Results': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Radiology': return 'bg-green-100 text-green-800 border-green-200';
      case 'Specialist Consult': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Surgical Report': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      year: date.getFullYear(),
      time: date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      })
    };
  };

  const groupRecordsByMonth = (records: MedicalRecord[]) => {
    const groups: { [key: string]: MedicalRecord[] } = {};
    
    records.forEach(record => {
      const date = new Date(record.date);
      const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      if (!groups[monthName]) {
        groups[monthName] = [];
      }
      groups[monthName].push(record);
    });
    
    return groups;
  };

  const groupedRecords = groupRecordsByMonth(sortedRecords);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Medical Records Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {Object.entries(groupedRecords).map(([monthYear, monthRecords]) => (
            <div key={monthYear}>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-lg font-semibold text-primary">{monthYear}</h3>
                <div className="flex-1 h-px bg-border"></div>
                <Badge variant="secondary" className="text-xs">
                  {monthRecords.length} records
                </Badge>
              </div>
              
              <div className="space-y-4 ml-6">
                {monthRecords.map((record, index) => {
                  const dateInfo = formatDate(record.date);
                  
                  return (
                    <div key={record.id} className="relative">
                      {/* Timeline connector */}
                      {index !== monthRecords.length - 1 && (
                        <div className="absolute left-6 top-12 w-px h-16 bg-border"></div>
                      )}
                      
                      <div className="flex gap-4">
                        {/* Date indicator */}
                        <div className="flex flex-col items-center min-w-[48px]">
                          <div className={`
                            w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center text-xs font-medium
                            ${getRecordTypeColor(record.type)}
                          `}>
                            <span className="text-xs font-bold">{dateInfo.day}</span>
                            <span className="text-[10px] leading-none">{dateInfo.month}</span>
                          </div>
                        </div>
                        
                        {/* Record content */}
                        <div className="flex-1 min-w-0">
                          <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className={`
                                      p-1.5 rounded-md ${getRecordTypeColor(record.type)}
                                    `}>
                                      {getRecordTypeIcon(record.type)}
                                    </div>
                                    <Badge className={getRecordTypeColor(record.type)}>
                                      {record.type}
                                    </Badge>
                                  </div>
                                  
                                  <h4 className="font-medium text-foreground mb-1">
                                    {record.description}
                                  </h4>
                                  
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                    <div className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {record.provider}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {dateInfo.time}
                                    </div>
                                  </div>
                                  
                                  {/* Record preview */}
                                  {record.details && (
                                    <div className="text-sm text-muted-foreground">
                                      {record.type === 'Lab Results' && record.details.wbc && (
                                        <span>WBC: {record.details.wbc}, RBC: {record.details.rbc}</span>
                                      )}
                                      {record.type === 'Radiology' && record.details.findings && (
                                        <span className="line-clamp-2">{record.details.findings}</span>
                                      )}
                                      {record.type === 'Specialist Consult' && record.details.reason && (
                                        <span className="line-clamp-2">{record.details.reason}</span>
                                      )}
                                      {record.type === 'Surgical Report' && record.details.procedure && (
                                        <span>{record.details.procedure}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                  {record.file && (
                                    <Button size="sm" variant="ghost" className="text-xs">
                                      <FileText className="h-3 w-3 mr-1" />
                                      PDF
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          
          {sortedRecords.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No medical records found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};