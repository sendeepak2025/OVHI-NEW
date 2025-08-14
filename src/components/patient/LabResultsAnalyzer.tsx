import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  CheckCircle,
  Activity,
  Eye
} from 'lucide-react';
import { MedicalRecord } from '@/types/dataTypes';

interface LabResultsAnalyzerProps {
  records: MedicalRecord[];
}

interface LabValue {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'high' | 'low' | 'critical';
  trend?: 'up' | 'down' | 'stable';
}

export const LabResultsAnalyzer: React.FC<LabResultsAnalyzerProps> = ({ records }) => {
  // Extract lab values from records
  const getLabValues = (record: MedicalRecord): LabValue[] => {
    const values: LabValue[] = [];
    
    if (record.details) {
      // Parse common lab values
      if (record.details.wbc) {
        values.push({
          name: 'White Blood Cells',
          value: record.details.wbc.replace(' K/uL', ''),
          unit: 'K/uL',
          referenceRange: '4.5-11.0',
          status: parseFloat(record.details.wbc) >= 4.5 && parseFloat(record.details.wbc) <= 11.0 ? 'normal' : 'abnormal' as any
        });
      }
      
      if (record.details.rbc) {
        values.push({
          name: 'Red Blood Cells',
          value: record.details.rbc.replace(' M/uL', ''),
          unit: 'M/uL',
          referenceRange: '4.2-5.4',
          status: parseFloat(record.details.rbc) >= 4.2 && parseFloat(record.details.rbc) <= 5.4 ? 'normal' : 'abnormal' as any
        });
      }
      
      if (record.details.hgb) {
        values.push({
          name: 'Hemoglobin',
          value: record.details.hgb.replace(' g/dL', ''),
          unit: 'g/dL',
          referenceRange: '12.0-16.0',
          status: parseFloat(record.details.hgb) >= 12.0 && parseFloat(record.details.hgb) <= 16.0 ? 'normal' : 'abnormal' as any
        });
      }
      
      if (record.details.hct) {
        values.push({
          name: 'Hematocrit',
          value: record.details.hct.replace('%', ''),
          unit: '%',
          referenceRange: '36-46',
          status: parseFloat(record.details.hct) >= 36 && parseFloat(record.details.hct) <= 46 ? 'normal' : 'abnormal' as any
        });
      }
      
      if (record.details.plt) {
        values.push({
          name: 'Platelets',
          value: record.details.plt.replace(' K/uL', ''),
          unit: 'K/uL',
          referenceRange: '150-450',
          status: parseFloat(record.details.plt) >= 150 && parseFloat(record.details.plt) <= 450 ? 'normal' : 'abnormal' as any
        });
      }
    }
    
    return values;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'abnormal':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'abnormal':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-red-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-blue-600" />;
      case 'stable':
        return <Minus className="h-3 w-3 text-gray-400" />;
      default:
        return null;
    }
  };

  // Get the most recent lab record for detailed analysis
  const mostRecentRecord = records.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];

  const currentLabValues = mostRecentRecord ? getLabValues(mostRecentRecord) : [];
  
  // Count abnormal values
  const abnormalCount = currentLabValues.filter(v => v.status !== 'normal').length;
  const criticalCount = currentLabValues.filter(v => v.status === 'critical').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Lab Reports</p>
                <p className="text-2xl font-bold">{records.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Abnormal Values</p>
                <p className="text-2xl font-bold text-yellow-600">{abnormalCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Values</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Most Recent Lab Results */}
      {mostRecentRecord && currentLabValues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Most Recent Lab Results</CardTitle>
            <p className="text-sm text-muted-foreground">
              {new Date(mostRecentRecord.date).toLocaleDateString()} - {mostRecentRecord.provider}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {currentLabValues.map((labValue, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(labValue.status)}
                      <span className="font-medium">{labValue.name}</span>
                      {labValue.trend && getTrendIcon(labValue.trend)}
                    </div>
                    <Badge className={getStatusColor(labValue.status)}>
                      {labValue.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Value:</span>
                      <span className="text-sm font-medium">
                        {labValue.value} {labValue.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Reference:</span>
                      <span className="text-sm">{labValue.referenceRange} {labValue.unit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Lab Records */}
      <Card>
        <CardHeader>
          <CardTitle>Lab History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{record.description}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>{new Date(record.date).toLocaleDateString()}</span>
                      <span>{record.provider}</span>
                    </div>
                    {record.details && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(record.details).slice(0, 3).map(([key, value]) => (
                          <Badge key={key} variant="secondary" className="text-xs">
                            {key.toUpperCase()}: {value as string}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <TrendingUp className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};