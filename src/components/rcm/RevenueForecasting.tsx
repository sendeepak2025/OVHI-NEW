import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  Brain,
  Target,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';

const RevenueForecasting: React.FC = () => {
  const [forecastPeriod, setForecastPeriod] = useState('6m');
  const [confidenceLevel, setConfidenceLevel] = useState(85);

  // Mock forecasting data
  const historicalData = [
    { month: 'Jul 23', actual: 485000, predicted: null },
    { month: 'Aug 23', actual: 520000, predicted: null },
    { month: 'Sep 23', actual: 475000, predicted: null },
    { month: 'Oct 23', actual: 610000, predicted: null },
    { month: 'Nov 23', actual: 555000, predicted: null },
    { month: 'Dec 23', actual: 625000, predicted: null }
  ];

  const forecastData = [
    { month: 'Dec 23', actual: 625000, predicted: 625000, upper: 650000, lower: 600000 },
    { month: 'Jan 24', actual: null, predicted: 640000, upper: 680000, lower: 600000 },
    { month: 'Feb 24', actual: null, predicted: 655000, upper: 695000, lower: 615000 },
    { month: 'Mar 24', actual: null, predicted: 670000, upper: 715000, lower: 625000 },
    { month: 'Apr 24', actual: null, predicted: 685000, upper: 730000, lower: 640000 },
    { month: 'May 24', actual: null, predicted: 695000, upper: 745000, lower: 645000 },
    { month: 'Jun 24', actual: null, predicted: 710000, upper: 760000, lower: 660000 }
  ];

  const seasonalityData = [
    { month: 'Jan', factor: 0.95, revenue: 608000 },
    { month: 'Feb', factor: 0.98, revenue: 627200 },
    { month: 'Mar', factor: 1.05, revenue: 672000 },
    { month: 'Apr', factor: 1.02, revenue: 652800 },
    { month: 'May', factor: 0.97, revenue: 620800 },
    { month: 'Jun', factor: 1.03, revenue: 659200 },
    { month: 'Jul', factor: 0.94, revenue: 601600 },
    { month: 'Aug', factor: 1.06, revenue: 678400 },
    { month: 'Sep', factor: 0.99, revenue: 633600 },
    { month: 'Oct', factor: 1.08, revenue: 691200 },
    { month: 'Nov', factor: 1.01, revenue: 646400 },
    { month: 'Dec', factor: 1.04, revenue: 665600 }
  ];

  const forecastMetrics = {
    predictedRevenue: 4255000,
    confidence: 85,
    growthRate: 8.5,
    seasonalVariation: 12.8,
    riskFactors: ['Seasonal decline in Q1', 'New competitor entry'],
    opportunities: ['New service line launch', 'Insurance contract renewal']
  };

  const ModelAccuracy = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm">Model Accuracy</span>
        <Badge variant="secondary">{confidenceLevel}%</Badge>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span>Historical Variance</span>
          <span>±5.2%</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Seasonal Adjustment</span>
          <span>Enabled</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>External Factors</span>
          <span>Included</span>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Revenue Forecasting
        </CardTitle>
        <div className="flex items-center gap-2">
          <select 
            value={forecastPeriod} 
            onChange={(e) => setForecastPeriod(e.target.value)}
            className="border rounded-md px-3 py-1 text-sm"
          >
            <option value="3m">3 Months</option>
            <option value="6m">6 Months</option>
            <option value="12m">12 Months</option>
          </select>
          <Button size="sm" variant="outline">
            <Target className="h-4 w-4 mr-2" />
            Set Goals
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Forecast Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Predicted Revenue</span>
            </div>
            <p className="text-2xl font-bold">${forecastMetrics.predictedRevenue.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Next 6 months</p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Confidence</span>
            </div>
            <p className="text-2xl font-bold">{forecastMetrics.confidence}%</p>
            <p className="text-sm text-muted-foreground">Model accuracy</p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Growth Rate</span>
            </div>
            <p className="text-2xl font-bold">{forecastMetrics.growthRate}%</p>
            <p className="text-sm text-muted-foreground">Year over year</p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">Volatility</span>
            </div>
            <p className="text-2xl font-bold">{forecastMetrics.seasonalVariation}%</p>
            <p className="text-sm text-muted-foreground">Seasonal variation</p>
          </div>
        </div>

        {/* Revenue Forecast Chart */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Revenue Forecast with Confidence Intervals</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
              <Area 
                dataKey="upper" 
                stackId="1" 
                stroke="none" 
                fill="#E5E7EB" 
                fillOpacity={0.5}
              />
              <Area 
                dataKey="lower" 
                stackId="1" 
                stroke="none" 
                fill="#FFFFFF" 
                fillOpacity={1}
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#10B981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Seasonality Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Seasonal Patterns</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={seasonalityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'factor' ? `${(Number(value) * 100).toFixed(1)}%` : `$${Number(value).toLocaleString()}`,
                    name === 'factor' ? 'Seasonal Factor' : 'Expected Revenue'
                  ]} 
                />
                <Bar dataKey="factor" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Model Performance</h3>
            <ModelAccuracy />
          </div>
        </div>

        {/* Risk Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">Risk Factors</span>
            </div>
            <ul className="space-y-2 text-sm text-red-700">
              {forecastMetrics.riskFactors.map((risk, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Growth Opportunities</span>
            </div>
            <ul className="space-y-2 text-sm text-green-700">
              {forecastMetrics.opportunities.map((opportunity, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>{opportunity}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Forecast Actions */}
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Recommended Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Schedule capacity planning meeting</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Target className="h-6 w-6" />
              <span className="text-sm">Adjust Q1 collection targets</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">Review payer contracts</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueForecasting;