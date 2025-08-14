import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  AlertTriangle,
  FileText,
  Bot,
  CheckCircle,
  Clock,
  RefreshCw,
  Eye,
  ArrowRight,
  Zap,
  TrendingDown,
  Filter,
  Search
} from 'lucide-react';

interface Denial {
  id: string;
  claimId: string;
  patientName: string;
  denialCode: string;
  denialReason: string;
  amount: number;
  denialDate: string;
  category: 'technical' | 'clinical' | 'authorization' | 'eligibility';
  priority: 'high' | 'medium' | 'low';
  status: 'new' | 'in_progress' | 'appealed' | 'resolved' | 'write_off';
  autoCorrection?: string;
  appealSuggestion?: string;
}

const DenialManagementWorkflow: React.FC = () => {
  const [denials, setDenials] = useState<Denial[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock denial data
  useEffect(() => {
    const mockDenials: Denial[] = [
      {
        id: 'D001',
        claimId: 'CLM001',
        patientName: 'John Smith',
        denialCode: 'CO-97',
        denialReason: 'The benefit for this service is included in the payment/allowance for another service/procedure',
        amount: 250.00,
        denialDate: '2024-01-15',
        category: 'technical',
        priority: 'high',
        status: 'new',
        autoCorrection: 'Separate claim needed with modifier -59',
        appealSuggestion: 'Submit documentation showing procedures were distinct'
      },
      {
        id: 'D002',
        claimId: 'CLM002',
        patientName: 'Sarah Johnson',
        denialCode: 'CO-16',
        denialReason: 'Claim/service lacks information or has submission/billing error',
        amount: 180.00,
        denialDate: '2024-01-14',
        category: 'technical',
        priority: 'medium',
        status: 'in_progress',
        autoCorrection: 'Missing diagnosis code - add ICD-10 Z51.11',
        appealSuggestion: 'Resubmit with complete diagnosis information'
      },
      {
        id: 'D003',
        claimId: 'CLM003',
        patientName: 'Michael Brown',
        denialCode: 'CO-50',
        denialReason: 'These are non-covered services because this is not deemed a medical necessity',
        amount: 450.00,
        denialDate: '2024-01-13',
        category: 'clinical',
        priority: 'high',
        status: 'new',
        appealSuggestion: 'Submit clinical documentation proving medical necessity'
      }
    ];
    setDenials(mockDenials);
  }, []);

  const handleAutoCorrection = async (denialId: string) => {
    setLoading(true);
    try {
      // Simulate AI auto-correction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setDenials(prev => 
        prev.map(denial => 
          denial.id === denialId 
            ? { ...denial, status: 'in_progress' as const }
            : denial
        )
      );
      
      toast.success('Auto-correction applied successfully');
    } catch (error) {
      toast.error('Auto-correction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAppeal = async (denialId: string) => {
    setLoading(true);
    try {
      // Simulate appeal generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setDenials(prev => 
        prev.map(denial => 
          denial.id === denialId 
            ? { ...denial, status: 'appealed' as const }
            : denial
        )
      );
      
      toast.success('Appeal generated and submitted');
    } catch (error) {
      toast.error('Appeal generation failed');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'appealed': return 'bg-purple-500';
      case 'resolved': return 'bg-green-500';
      case 'write_off': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredDenials = denials.filter(denial => {
    const matchesFilter = filter === 'all' || denial.status === filter;
    const matchesSearch = denial.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         denial.denialCode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const denialStats = {
    total: denials.length,
    new: denials.filter(d => d.status === 'new').length,
    inProgress: denials.filter(d => d.status === 'in_progress').length,
    appealed: denials.filter(d => d.status === 'appealed').length,
    totalAmount: denials.reduce((sum, d) => sum + d.amount, 0)
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Denials</p>
                <p className="text-2xl font-bold">{denialStats.total}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Denials</p>
                <p className="text-2xl font-bold">{denialStats.new}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{denialStats.inProgress}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">${denialStats.totalAmount.toLocaleString()}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Denial Management Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI-Powered Denial Management
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Search denials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="appealed">Appealed</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDenials.map((denial) => (
              <div key={denial.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{denial.claimId}</Badge>
                    <span className="font-medium">{denial.patientName}</span>
                    <Badge className={getPriorityColor(denial.priority)}>
                      {denial.priority}
                    </Badge>
                    <Badge className={getStatusColor(denial.status)}>
                      {denial.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${denial.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{denial.denialDate}</p>
                  </div>
                </div>

                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm">
                    <span className="font-medium">{denial.denialCode}:</span> {denial.denialReason}
                  </p>
                </div>

                {denial.autoCorrection && (
                  <div className="bg-blue-50 p-3 rounded-md border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Auto-Correction Suggestion</span>
                    </div>
                    <p className="text-sm text-blue-700">{denial.autoCorrection}</p>
                  </div>
                )}

                {denial.appealSuggestion && (
                  <div className="bg-green-50 p-3 rounded-md border-l-4 border-green-500">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">Appeal Strategy</span>
                    </div>
                    <p className="text-sm text-green-700">{denial.appealSuggestion}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleAutoCorrection(denial.id)}
                    disabled={loading || denial.status !== 'new'}
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    Auto-Correct
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleAppeal(denial.id)}
                    disabled={loading || denial.status === 'appealed'}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Appeal
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
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

export default DenialManagementWorkflow;