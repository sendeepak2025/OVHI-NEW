
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Activity,
  AlertTriangle,
  Battery,
  Clock,
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  Smartphone,
  Users,
  Calendar,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { rpmService, RPMDevice, RPMReading, RPMAlert, RPMAnalytics } from '@/services/rpmService';

interface RPMDashboardProps {
  patientId: string;
  patientName: string;
}

const RPMDashboard: React.FC<RPMDashboardProps> = ({ patientId, patientName }) => {
  const [devices, setDevices] = useState<RPMDevice[]>([]);
  const [recentReadings, setRecentReadings] = useState<RPMReading[]>([]);
  const [alerts, setAlerts] = useState<RPMAlert[]>([]);
  const [analytics, setAnalytics] = useState<RPMAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>('all');

  useEffect(() => {
    loadRPMData();
  }, [patientId]);

  const loadRPMData = async () => {
    setLoading(true);
    try {
      const patientDevices = rpmService.getPatientDevices(patientId);
      const readings = rpmService.getPatientReadings(patientId).slice(-50);
      const patientAlerts = rpmService.getPatientAlerts(patientId, true);
      const analyticsData = rpmService.generateAnalytics(patientId);

      setDevices(patientDevices);
      setRecentReadings(readings);
      setAlerts(patientAlerts);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading RPM data:', error);
      toast.error('Failed to load RPM data');
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    if (rpmService.acknowledgeAlert(patientId, alertId, 'current-provider')) {
      toast.success('Alert acknowledged');
      loadRPMData();
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'blood_pressure': return <Heart className="h-4 w-4" />;
      case 'glucometer': return <Activity className="h-4 w-4" />;
      case 'scale': return <TrendingUp className="h-4 w-4" />;
      case 'pulse_oximeter': return <Activity className="h-4 w-4" />;
      case 'thermometer': return <Activity className="h-4 w-4" />;
      default: return <Smartphone className="h-4 w-4" />;
    }
  };

  const getDeviceStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'battery_low': return 'secondary';
      case 'maintenance': return 'destructive';
      case 'inactive': return 'outline';
      default: return 'outline';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDeviceType = (deviceType: string) => {
    return deviceType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) return <div>Loading RPM dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Remote Patient Monitoring</h2>
          <p className="text-muted-foreground">Comprehensive monitoring for {patientName}</p>
        </div>
        <Button onClick={loadRPMData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Critical Alerts */}
      {alerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Active Alerts ({alerts.length})</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex justify-between items-center">
                  <span className="text-sm">{alert.message}</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => acknowledgeAlert(alert.id)}
                  >
                    Acknowledge
                  </Button>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Devices</p>
                <p className="text-2xl font-bold">
                  {devices.filter(d => d.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Adherence Rate</p>
                <p className="text-2xl font-bold">
                  {analytics ? Math.round(analytics.adherence.overall) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Risk Score</p>
                <p className="text-2xl font-bold">
                  {analytics ? analytics.riskScore : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="readings">Readings</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {devices.map((device) => (
                    <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getDeviceIcon(device.deviceType)}
                        <div>
                          <p className="font-medium">{formatDeviceType(device.deviceType)}</p>
                          <p className="text-sm text-muted-foreground">{device.deviceModel}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getDeviceStatusColor(device.status)}>
                          {device.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {device.batteryLevel && (
                          <div className="flex items-center gap-1">
                            <Battery className="h-4 w-4" />
                            <span className="text-sm">{device.batteryLevel}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Readings</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {recentReadings.slice(-10).reverse().map((reading) => (
                      <div key={reading.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(reading.deviceType)}
                            <span className="font-medium">{formatDeviceType(reading.deviceType)}</span>
                          </div>
                          <Badge variant={getRiskColor(reading.riskLevel)}>
                            {reading.riskLevel.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(reading.values).map(([key, value]) => (
                            <div key={key}>
                              <span className="text-muted-foreground">{key}: </span>
                              <span className="font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatTimestamp(reading.timestamp)}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>Device Management</CardTitle>
              <CardDescription>Monitor and manage patient's RPM devices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devices.map((device) => (
                  <div key={device.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        {getDeviceIcon(device.deviceType)}
                        <div>
                          <h4 className="font-medium">{formatDeviceType(device.deviceType)}</h4>
                          <p className="text-sm text-muted-foreground">
                            {device.deviceModel} • SN: {device.serialNumber}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getDeviceStatusColor(device.status)}>
                        {device.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Last Sync</p>
                        <p className="font-medium">{formatTimestamp(device.lastSyncTime)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Battery</p>
                        <p className="font-medium">
                          {device.batteryLevel ? `${device.batteryLevel}%` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Firmware</p>
                        <p className="font-medium">{device.firmwareVersion || 'N/A'}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Configure
                        </Button>
                        <Button size="sm" variant="outline">
                          Test
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {devices.length === 0 && (
                  <div className="text-center py-8">
                    <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No devices registered</p>
                    <Button className="mt-4">Add Device</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="readings">
          <Card>
            <CardHeader>
              <CardTitle>Reading History</CardTitle>
              <CardDescription>View and analyze patient data over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {recentReadings.reverse().map((reading) => (
                    <div key={reading.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(reading.deviceType)}
                          <div>
                            <h4 className="font-medium">{formatDeviceType(reading.deviceType)}</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatTimestamp(reading.timestamp)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={getRiskColor(reading.riskLevel)}>
                            {reading.riskLevel.toUpperCase()}
                          </Badge>
                          {reading.isAnomaly && (
                            <Badge variant="outline">ANOMALY</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(reading.values).map(([key, value]) => (
                          <div key={key} className="border rounded p-2">
                            <p className="text-xs text-muted-foreground uppercase">{key}</p>
                            <p className="text-lg font-semibold">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Alert Management</CardTitle>
              <CardDescription>Monitor and respond to critical patient alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <Alert key={alert.id} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="flex justify-between items-center">
                      <span>{alert.alertType.replace('_', ' ').toUpperCase()}</span>
                      <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">{alert.message}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {formatTimestamp(alert.timestamp)}
                        </span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
                
                {alerts.length === 0 && (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">No active alerts</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            {analytics && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Adherence Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Overall Adherence</span>
                          <span>{Math.round(analytics.adherence.overall)}%</span>
                        </div>
                        <Progress value={analytics.adherence.overall} />
                      </div>
                      
                      {Object.entries(analytics.adherence.byDevice).map(([deviceType, rate]) => (
                        <div key={deviceType}>
                          <div className="flex justify-between text-sm mb-2">
                            <span>{formatDeviceType(deviceType)}</span>
                            <span>{Math.round(rate)}%</span>
                          </div>
                          <Progress value={rate} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Trend Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analytics.trends).map(([param, trend]) => (
                        <div key={param} className="flex items-center justify-between border rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            {getTrendIcon(trend.direction)}
                            <span className="font-medium">{param}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">{trend.direction.toUpperCase()}</p>
                            <p className="text-xs text-muted-foreground">
                              {trend.change.toFixed(1)}% change
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.recommendations.map((recommendation, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <p className="text-sm">{recommendation}</p>
                        </div>
                      ))}
                      
                      {analytics.recommendations.length === 0 && (
                        <p className="text-muted-foreground text-sm">
                          No specific recommendations at this time.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RPMDashboard;
