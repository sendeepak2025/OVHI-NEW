import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Download,
  Upload,
  Settings,
  RefreshCw,
  BarChart,
  PieChart,
  Activity,
  Users,
  Calendar,
  Target,
  Filter,
  Search,
  Eye,
  ArrowUpCircle,
  ArrowDownCircle,
  Zap,
  Bot,
  Shield
} from 'lucide-react';

// Import RCM Components
import ClaimMDConnector from '@/components/rcm/ClaimMDConnector';
import EDITransactionManager from '@/components/rcm/EDITransactionManager';
import ClaimsStatusTracker from '@/components/rcm/ClaimsStatusTracker';
import IntelligentClaimsScrubber from '@/components/rcm/IntelligentClaimsScrubber';

// Additional RCM Components
import DenialManagementWorkflow from '@/components/rcm/DenialManagementWorkflow';
import PaymentPostingEngine from '@/components/rcm/PaymentPostingEngine';
import RCMAnalyticsDashboard from '@/components/rcm/RCMAnalyticsDashboard';
import ARAgingIntelligence from '@/components/rcm/ARAgingIntelligence';
import RevenueForecasting from '@/components/rcm/RevenueForecasting';
import PatientFinancialPortal from '@/components/rcm/PatientFinancialPortal';
import CollectionsWorkflowManager from '@/components/rcm/CollectionsWorkflowManager';
import ERAProcessor from '@/components/rcm/ERAProcessor';

const RCMManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshing, setRefreshing] = useState(false);

  // Mock KPI data
  const kpiData = {
    totalRevenue: 485200,
    collectionRate: 94.7,
    denialRate: 3.2,
    daysInAR: 23,
    cleanClaimRate: 97.8,
    costToCollect: 2.8,
    firstPassRate: 89.5,
    arOver90: 8.2
  };

  const handleRefreshData = async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('RCM data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const KPICard = ({ title, value, icon: Icon, trend, color }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? <ArrowUpCircle className="h-4 w-4" /> : <ArrowDownCircle className="h-4 w-4" />}
                {Math.abs(trend)}%
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Revenue Cycle Management</h1>
          <p className="text-muted-foreground">
            Comprehensive RCM automation and analytics platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefreshData} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            RCM Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="denials">Denials</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="ar-aging">A/R Aging</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* KPI Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Total Revenue (MTD)"
              value={`$${kpiData.totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              trend={12.5}
              color="bg-green-500"
            />
            <KPICard
              title="Collection Rate"
              value={`${kpiData.collectionRate}%`}
              icon={TrendingUp}
              trend={2.1}
              color="bg-blue-500"
            />
            <KPICard
              title="Denial Rate"
              value={`${kpiData.denialRate}%`}
              icon={AlertTriangle}
              trend={-0.8}
              color="bg-orange-500"
            />
            <KPICard
              title="Days in A/R"
              value={kpiData.daysInAR}
              icon={Clock}
              trend={-3.2}
              color="bg-purple-500"
            />
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Upload className="h-6 w-6" />
                  <span className="text-sm">Batch Claims</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Download className="h-6 w-6" />
                  <span className="text-sm">ERA Files</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Bot className="h-6 w-6" />
                  <span className="text-sm">Auto-Correct</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Shield className="h-6 w-6" />
                  <span className="text-sm">Scrub Claims</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <BarChart className="h-6 w-6" />
                  <span className="text-sm">AR Reports</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Target className="h-6 w-6" />
                  <span className="text-sm">Collections</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main RCM Components */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ClaimMDConnector />
            <RCMAnalyticsDashboard />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ClaimsStatusTracker />
            <ARAgingIntelligence />
          </div>
        </TabsContent>

        <TabsContent value="claims" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EDITransactionManager />
            <IntelligentClaimsScrubber />
          </div>
          <ClaimsStatusTracker />
        </TabsContent>

        <TabsContent value="denials" className="space-y-6">
          <DenialManagementWorkflow />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PaymentPostingEngine />
            <ERAProcessor />
          </div>
        </TabsContent>

        <TabsContent value="ar-aging" className="space-y-6">
          <ARAgingIntelligence />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RCMAnalyticsDashboard />
            <RevenueForecasting />
          </div>
        </TabsContent>

        <TabsContent value="collections" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CollectionsWorkflowManager />
            <PatientFinancialPortal />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>RCM Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Clearinghouse</label>
                  <p className="text-sm text-muted-foreground">Claim.MD Integration</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Auto-Posting</label>
                  <p className="text-sm text-muted-foreground">Enabled</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Denial Management</label>
                  <p className="text-sm text-muted-foreground">AI-Powered</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Collections</label>
                  <p className="text-sm text-muted-foreground">Automated Workflows</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RCMManagement;