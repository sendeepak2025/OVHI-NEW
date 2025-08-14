import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { updateSettingsApi } from "@/services/operations/settings";
import { 
  DollarSign, 
  Clock, 
  Calculator, 
  FileText, 
  Settings,
  Plus,
  Edit,
  Trash,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface BillingRule {
  id: string;
  name: string;
  condition: string;
  cptCode: string;
  charge: number;
  modifier?: string;
  active: boolean;
}

interface CPTCodeConfig {
  code: string;
  description: string;
  baseCharge: number;
  timeRange: {
    min: number;
    max: number;
  };
  specialty: string;
  category: 'evaluation' | 'procedure' | 'diagnostic';
}

interface BillingConfiguration {
  timeBasedBilling: boolean;
  automaticModifiers: boolean;
  chargeOptimization: boolean;
  customRules: BillingRule[];
  cptCodes: CPTCodeConfig[];
  defaultCharges: {
    [key: string]: number;
  };
}

const DEFAULT_CPT_CODES: CPTCodeConfig[] = [
  // Primary Care E/M Codes
  { code: '99201', description: 'Office visit, new patient, 15-29 min', baseCharge: 75.00, timeRange: { min: 15, max: 29 }, specialty: 'primary_care', category: 'evaluation' },
  { code: '99202', description: 'Office visit, new patient, 30-44 min', baseCharge: 109.00, timeRange: { min: 30, max: 44 }, specialty: 'primary_care', category: 'evaluation' },
  { code: '99203', description: 'Office visit, new patient, 45-59 min', baseCharge: 148.00, timeRange: { min: 45, max: 59 }, specialty: 'primary_care', category: 'evaluation' },
  { code: '99204', description: 'Office visit, new patient, 60-74 min', baseCharge: 198.00, timeRange: { min: 60, max: 74 }, specialty: 'primary_care', category: 'evaluation' },
  { code: '99205', description: 'Office visit, new patient, 75+ min', baseCharge: 248.00, timeRange: { min: 75, max: 120 }, specialty: 'primary_care', category: 'evaluation' },
  
  { code: '99212', description: 'Office visit, established, 10-19 min', baseCharge: 46.00, timeRange: { min: 10, max: 19 }, specialty: 'primary_care', category: 'evaluation' },
  { code: '99213', description: 'Office visit, established, 20-29 min', baseCharge: 74.00, timeRange: { min: 20, max: 29 }, specialty: 'primary_care', category: 'evaluation' },
  { code: '99214', description: 'Office visit, established, 30-39 min', baseCharge: 109.00, timeRange: { min: 30, max: 39 }, specialty: 'primary_care', category: 'evaluation' },
  { code: '99215', description: 'Office visit, established, 40+ min', baseCharge: 148.00, timeRange: { min: 40, max: 75 }, specialty: 'primary_care', category: 'evaluation' },

  // Mental Health Codes
  { code: '90791', description: 'Psychiatric evaluation', baseCharge: 200.00, timeRange: { min: 60, max: 90 }, specialty: 'mental_health', category: 'evaluation' },
  { code: '90834', description: 'Psychotherapy, 45 minutes', baseCharge: 120.00, timeRange: { min: 38, max: 52 }, specialty: 'mental_health', category: 'evaluation' },
  { code: '90837', description: 'Psychotherapy, 60 minutes', baseCharge: 150.00, timeRange: { min: 53, max: 75 }, specialty: 'mental_health', category: 'evaluation' },

  // Cardiology Codes
  { code: '99243', description: 'Cardiology consult, 40 min', baseCharge: 240.00, timeRange: { min: 30, max: 54 }, specialty: 'cardiology', category: 'evaluation' },
  { code: '99244', description: 'Cardiology consult, 60 min', baseCharge: 340.00, timeRange: { min: 55, max: 80 }, specialty: 'cardiology', category: 'evaluation' },
  { code: '93306', description: 'Echocardiogram', baseCharge: 150.00, timeRange: { min: 30, max: 45 }, specialty: 'cardiology', category: 'diagnostic' },

  // Urgent Care
  { code: '12001', description: 'Laceration repair, simple', baseCharge: 150.00, timeRange: { min: 15, max: 30 }, specialty: 'urgent_care', category: 'procedure' },
  { code: '29125', description: 'Splint application', baseCharge: 85.00, timeRange: { min: 10, max: 20 }, specialty: 'urgent_care', category: 'procedure' },
];

const BillingConfigurationSettings: React.FC = () => {
  const [billingConfig, setBillingConfig] = useState<BillingConfiguration>({
    timeBasedBilling: true,
    automaticModifiers: true,
    chargeOptimization: true,
    customRules: [],
    cptCodes: DEFAULT_CPT_CODES,
    defaultCharges: {}
  });
  const [isLoading, setIsLoading] = useState(false);
  const [editingRule, setEditingRule] = useState<BillingRule | null>(null);
  const [newRule, setNewRule] = useState<Partial<BillingRule>>({});
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');

  useEffect(() => {
    const savedConfig = localStorage.getItem('billingConfiguration');
    if (savedConfig) {
      setBillingConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleSaveConfiguration = async () => {
    setIsLoading(true);
    try {
      await updateSettingsApi(billingConfig);
      localStorage.setItem('billingConfiguration', JSON.stringify(billingConfig));
      toast({
        title: "Success",
        description: "Billing configuration saved successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save billing configuration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRule = () => {
    if (!newRule.name || !newRule.condition || !newRule.cptCode || !newRule.charge) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const rule: BillingRule = {
      id: Date.now().toString(),
      name: newRule.name!,
      condition: newRule.condition!,
      cptCode: newRule.cptCode!,
      charge: newRule.charge!,
      modifier: newRule.modifier,
      active: true
    };

    setBillingConfig(prev => ({
      ...prev,
      customRules: [...prev.customRules, rule]
    }));

    setNewRule({});
    toast({
      title: "Rule Added",
      description: "Custom billing rule has been added successfully.",
    });
  };

  const handleDeleteRule = (ruleId: string) => {
    setBillingConfig(prev => ({
      ...prev,
      customRules: prev.customRules.filter(rule => rule.id !== ruleId)
    }));
  };

  const handleUpdateCPTCharge = (code: string, newCharge: number) => {
    setBillingConfig(prev => ({
      ...prev,
      cptCodes: prev.cptCodes.map(cpt => 
        cpt.code === code ? { ...cpt, baseCharge: newCharge } : cpt
      )
    }));
  };

  const getFilteredCPTCodes = () => {
    if (selectedSpecialty === 'all') return billingConfig.cptCodes;
    return billingConfig.cptCodes.filter(cpt => cpt.specialty === selectedSpecialty);
  };

  const getRecommendedCPT = (duration: number, specialty: string = 'primary_care') => {
    const codes = billingConfig.cptCodes.filter(cpt => 
      cpt.specialty === specialty && 
      duration >= cpt.timeRange.min && 
      duration <= cpt.timeRange.max
    );
    return codes.length > 0 ? codes[0] : null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Billing Configuration & Automation
          </CardTitle>
          <CardDescription>
            Configure automated billing rules, CPT codes, and charges for optimal revenue cycle management.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Time-Based Billing</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically select CPT codes based on visit duration
                </p>
              </div>
              <Switch 
                checked={billingConfig.timeBasedBilling}
                onCheckedChange={(checked) => 
                  setBillingConfig(prev => ({ ...prev, timeBasedBilling: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Automatic Modifiers</Label>
                <p className="text-sm text-muted-foreground">
                  Apply billing modifiers automatically
                </p>
              </div>
              <Switch 
                checked={billingConfig.automaticModifiers}
                onCheckedChange={(checked) => 
                  setBillingConfig(prev => ({ ...prev, automaticModifiers: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Charge Optimization</Label>
                <p className="text-sm text-muted-foreground">
                  Optimize billing for maximum reimbursement
                </p>
              </div>
              <Switch 
                checked={billingConfig.chargeOptimization}
                onCheckedChange={(checked) => 
                  setBillingConfig(prev => ({ ...prev, chargeOptimization: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="cpt-codes" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cpt-codes">CPT Codes</TabsTrigger>
          <TabsTrigger value="custom-rules">Custom Rules</TabsTrigger>
          <TabsTrigger value="time-calculator">Time Calculator</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="cpt-codes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CPT Code Management</CardTitle>
              <CardDescription>
                Manage CPT codes and their associated charges for different specialties.
              </CardDescription>
              <div className="flex justify-between items-center">
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    <SelectItem value="primary_care">Primary Care</SelectItem>
                    <SelectItem value="mental_health">Mental Health</SelectItem>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="urgent_care">Urgent Care</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>CPT Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Time Range</TableHead>
                    <TableHead>Charge</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredCPTCodes().map((cpt) => (
                    <TableRow key={cpt.code}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">{cpt.code}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate">{cpt.description}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          {cpt.timeRange.min}-{cpt.timeRange.max}m
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={cpt.baseCharge}
                          onChange={(e) => handleUpdateCPTCharge(cpt.code, parseFloat(e.target.value))}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          cpt.category === 'evaluation' ? 'default' :
                          cpt.category === 'procedure' ? 'destructive' : 'secondary'
                        }>
                          {cpt.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom-rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Billing Rules</CardTitle>
              <CardDescription>
                Create custom rules for specific billing scenarios and conditions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <div>
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input
                    id="rule-name"
                    placeholder="e.g., After Hours Visit"
                    value={newRule.name || ''}
                    onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="rule-condition">Condition</Label>
                  <Input
                    id="rule-condition"
                    placeholder="e.g., time > 5:00 PM"
                    value={newRule.condition || ''}
                    onChange={(e) => setNewRule(prev => ({ ...prev, condition: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="rule-cpt">CPT Code</Label>
                  <Input
                    id="rule-cpt"
                    placeholder="e.g., 99213"
                    value={newRule.cptCode || ''}
                    onChange={(e) => setNewRule(prev => ({ ...prev, cptCode: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="rule-charge">Charge</Label>
                  <div className="flex gap-2">
                    <Input
                      id="rule-charge"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newRule.charge || ''}
                      onChange={(e) => setNewRule(prev => ({ ...prev, charge: parseFloat(e.target.value) }))}
                    />
                    <Button onClick={handleAddRule} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {billingConfig.customRules.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule Name</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>CPT Code</TableHead>
                      <TableHead>Charge</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingConfig.customRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell className="font-mono text-sm">{rule.condition}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{rule.cptCode}</Badge>
                        </TableCell>
                        <TableCell>${rule.charge.toFixed(2)}</TableCell>
                        <TableCell>
                          {rule.active ? (
                            <Badge variant="default">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDeleteRule(rule.id)}
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time-calculator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time-Based CPT Calculator</CardTitle>
              <CardDescription>
                Calculate the appropriate CPT code and charge based on visit duration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="visit-duration">Visit Duration (minutes)</Label>
                  <Input
                    id="visit-duration"
                    type="number"
                    placeholder="30"
                    onChange={(e) => {
                      const duration = parseInt(e.target.value);
                      const recommended = getRecommendedCPT(duration);
                      if (recommended) {
                        document.getElementById('recommended-result')!.innerHTML = `
                          <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h4 class="font-semibold text-green-800">Recommended CPT Code</h4>
                            <p class="text-green-700">
                              <span class="font-mono font-bold">${recommended.code}</span> - ${recommended.description}
                            </p>
                            <p class="text-green-600 font-semibold">Charge: $${recommended.baseCharge.toFixed(2)}</p>
                          </div>
                        `;
                      }
                    }}
                  />
                </div>
                <div>
                  <Label>Specialty</Label>
                  <Select defaultValue="primary_care">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary_care">Primary Care</SelectItem>
                      <SelectItem value="mental_health">Mental Health</SelectItem>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="urgent_care">Urgent Care</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div id="recommended-result" className="mt-4">
                <div className="p-4 bg-muted/50 border rounded-lg text-center text-muted-foreground">
                  Enter a visit duration to see recommended CPT code and charge
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Automation Summary</CardTitle>
              <CardDescription>
                Overview of your automated billing configuration and rules.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Active Automations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {billingConfig.timeBasedBilling && (
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Time-based CPT selection
                        </li>
                      )}
                      {billingConfig.automaticModifiers && (
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Automatic modifier application
                        </li>
                      )}
                      {billingConfig.chargeOptimization && (
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Charge optimization
                        </li>
                      )}
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {billingConfig.customRules.length} custom billing rules
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      Configuration Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span>Total CPT codes:</span>
                        <Badge variant="secondary">{billingConfig.cptCodes.length}</Badge>
                      </li>
                      <li className="flex justify-between">
                        <span>Custom rules:</span>
                        <Badge variant="secondary">{billingConfig.customRules.length}</Badge>
                      </li>
                      <li className="flex justify-between">
                        <span>Avg. charge range:</span>
                        <Badge variant="outline">
                          ${Math.min(...billingConfig.cptCodes.map(c => c.baseCharge)).toFixed(0)} - 
                          ${Math.max(...billingConfig.cptCodes.map(c => c.baseCharge)).toFixed(0)}
                        </Badge>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button 
          onClick={handleSaveConfiguration} 
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? "Saving..." : "Save Billing Configuration"}
        </Button>
      </div>
    </div>
  );
};

export default BillingConfigurationSettings;