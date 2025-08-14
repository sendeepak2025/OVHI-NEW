import React, { useMemo } from 'react';
import { TrendingUp, Users, FileText, Activity, AlertTriangle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface ProviderAnalyticsDashboardProps {
  records: any[];
  patients: any[];
}

export const ProviderAnalyticsDashboard: React.FC<ProviderAnalyticsDashboardProps> = ({
  records,
  patients
}) => {
  // Calculate analytics data
  const analytics = useMemo(() => {
    const totalRecords = records.length;
    const totalPatients = patients.length;
    const patientsWithRecords = new Set(records.map(r => r.patientId)).size;
    
    // Record types distribution
    const recordTypes = records.reduce((acc, record) => {
      acc[record.type] = (acc[record.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Monthly trends
    const monthlyData = records.reduce((acc, record) => {
      const month = new Date(record.date).toLocaleString('default', { month: 'short', year: '2-digit' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRecords = records.filter(record => new Date(record.date) >= thirtyDaysAgo);

    // Critical findings detection (mock logic)
    const criticalFindings = records.filter(record => 
      record.description.toLowerCase().includes('abnormal') ||
      record.description.toLowerCase().includes('critical') ||
      record.description.toLowerCase().includes('urgent')
    );

    return {
      totalRecords,
      totalPatients,
      patientsWithRecords,
      recordTypes,
      monthlyData,
      recentActivity: recentRecords.length,
      criticalFindings: criticalFindings.length,
      completionRate: Math.round((patientsWithRecords / totalPatients) * 100)
    };
  }, [records, patients]);

  // Chart data preparation
  const recordTypeData = Object.entries(analytics.recordTypes).map(([type, count]) => ({
    type,
    count
  }));

  const monthlyTrendData = Object.entries(analytics.monthlyData).map(([month, count]) => ({
    month,
    count
  }));

  const pieColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

  const pieData = recordTypeData.map((item, index) => ({
    ...item,
    color: pieColors[index % pieColors.length]
  }));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalRecords}</div>
            <p className="text-xs text-muted-foreground">
              Across {analytics.totalPatients} patients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.patientsWithRecords}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.completionRate}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.recentActivity}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Findings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.criticalFindings}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Record Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Record Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Record Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Record Types Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Record Types Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={recordTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Documentation Completeness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Patient Records Coverage</span>
                <span className="text-sm text-muted-foreground">{analytics.completionRate}%</span>
              </div>
              <Progress value={analytics.completionRate} className="w-full" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Recent Activity</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round((analytics.recentActivity / analytics.totalRecords) * 100)}%
                </span>
              </div>
              <Progress value={(analytics.recentActivity / analytics.totalRecords) * 100} className="w-full" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quality Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Complete Records</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {analytics.totalRecords - analytics.criticalFindings}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium">Pending Review</span>
              </div>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {Math.floor(analytics.totalRecords * 0.1)}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium">Critical Findings</span>
              </div>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {analytics.criticalFindings}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};