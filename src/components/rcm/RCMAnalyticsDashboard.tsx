import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Target,
  Activity
} from 'lucide-react';

const RCMAnalyticsDashboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState('30d');

  // Mock analytics data
  const revenueData = [
    { month: 'Jan', revenue: 485000, collections: 460000 },
    { month: 'Feb', revenue: 520000, collections: 495000 },
    { month: 'Mar', revenue: 475000, collections: 465000 },
    { month: 'Apr', revenue: 610000, collections: 580000 },
    { month: 'May', revenue: 555000, collections: 540000 },
    { month: 'Jun', revenue: 625000, collections: 605000 }
  ];

  const denialTrendData = [
    { month: 'Jan', rate: 4.2 },
    { month: 'Feb', rate: 3.8 },
    { month: 'Mar', rate: 4.5 },
    { month: 'Apr', rate: 3.2 },
    { month: 'May', rate: 2.9 },
    { month: 'Jun', rate: 3.1 }
  ];

  const payerMixData = [
    { name: 'Medicare', value: 35, color: '#0088FE' },
    { name: 'Medicaid', value: 25, color: '#00C49F' },
    { name: 'Commercial', value: 30, color: '#FFBB28' },
    { name: 'Self-Pay', value: 10, color: '#FF8042' }
  ];

  const kpiMetrics = [
    {
      title: 'Net Collection Rate',
      value: '94.7%',
      change: '+2.3%',
      trend: 'up',
      target: '95%',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Days in A/R',
      value: '23',
      change: '-5.2%',
      trend: 'down',
      target: '25',
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      title: 'First Pass Rate',
      value: '89.5%',
      change: '+1.8%',
      trend: 'up',
      target: '90%',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Denial Rate',
      value: '3.1%',
      change: '-0.8%',
      trend: 'down',
      target: '3%',
      icon: AlertTriangle,
      color: 'text-orange-600'
    }
  ];

  const benchmarkData = [
    { metric: 'Collection Rate', practice: 94.7, industry: 92.3 },
    { metric: 'Days in A/R', practice: 23, industry: 28 },
    { metric: 'Denial Rate', practice: 3.1, industry: 4.2 },
    { metric: 'Cost to Collect', practice: 2.8, industry: 3.5 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          RCM Analytics Dashboard
        </CardTitle>
        <div className="flex items-center gap-2">
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            className="border rounded-md px-3 py-1 text-sm"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiMetrics.map((metric) => (
            <div key={metric.title} className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
                <Badge variant="secondary" className="text-xs">
                  Target: {metric.target}
                </Badge>
              </div>
              <p className="text-2xl font-bold">{metric.value}</p>
              <p className="text-sm text-muted-foreground">{metric.title}</p>
              <div className={`flex items-center gap-1 text-sm ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {metric.change}
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Revenue vs Collections</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                <Bar dataKey="collections" fill="#10B981" name="Collections" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Denial Rate Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={denialTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Denial Rate']} />
                <Line type="monotone" dataKey="rate" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payer Mix and Benchmarks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Payer Mix</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={payerMixData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {payerMixData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Industry Benchmarks</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={benchmarkData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="practice" fill="#3B82F6" name="Your Practice" />
                <Bar dataKey="industry" fill="#9CA3AF" name="Industry Average" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Collection rate exceeds industry average</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>A/R days below target threshold</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span>First pass rate needs improvement</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RCMAnalyticsDashboard;