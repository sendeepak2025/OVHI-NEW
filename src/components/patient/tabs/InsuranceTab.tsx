
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Printer, PenLine } from 'lucide-react';
import { Patient } from '@/data/patientData';
import { InsuranceClaim, Referral } from '@/data/medicalData';
import { formatDate } from '@/utils/formatHelpers';
import ClaimsTab from './insurance/ClaimsTab';
import ReferralsTab from './insurance/ReferralsTab';

interface InsuranceTabProps {
  patient: Patient;
  claims: InsuranceClaim[];
  referrals: Referral[];
  onEdit?: () => void;
}

const InsuranceTab: React.FC<InsuranceTabProps> = ({ patient, claims, referrals, onEdit }) => {
  const [activeInsuranceTab, setActiveInsuranceTab] = useState('insurance');
  
  const primaryInsurance = patient.insurance.find(ins => ins.type === 'primary');
  const secondaryInsurance = patient.insurance.find(ins => ins.type === 'secondary');
  const tertiaryInsurance = patient.insurance.find(ins => ins.type === 'tertiary');
  
  const renderInsuranceCard = (insurance: any, title: string) => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{insurance.provider} - {insurance.planName}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Policy Information</h4>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-xs text-muted-foreground">Policy Number</p>
                  <p className="font-medium">{insurance.policyNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Group Number</p>
                  <p className="font-medium">{insurance.groupNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Effective Date</p>
                  <p className="font-medium">{formatDate(insurance.effectiveDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Expiration Date</p>
                  <p className="font-medium">{formatDate(insurance.expirationDate)}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Subscriber Information</h4>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-xs text-muted-foreground">Subscriber Name</p>
                  <p className="font-medium">{insurance.subscriberName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Subscriber ID</p>
                  <p className="font-medium">{insurance.subscriberID}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Relation to Subscriber</p>
                  <p className="font-medium">{insurance.relationToSubscriber}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {insurance.copay && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Copay Information</h4>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Primary Care</p>
                    <p className="font-medium">{insurance.copay.primaryCare}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Specialist</p>
                    <p className="font-medium">{insurance.copay.specialist}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Emergency Room</p>
                    <p className="font-medium">{insurance.copay.emergency}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Urgent Care</p>
                    <p className="font-medium">{insurance.copay.urgent}</p>
                  </div>
                </div>
              </div>
            )}
            
            {insurance.deductible && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Coverage Details</h4>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Deductible</p>
                    <p className="font-medium">{insurance.deductible}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Out-of-Pocket Max</p>
                    <p className="font-medium">{insurance.outOfPocketMax}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Coverage Percentage</p>
                    <p className="font-medium">{insurance.coveragePercentage}</p>
                  </div>
                </div>
              </div>
            )}
            
            {insurance.coverageDetails && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Coverage Details</h4>
                <div className="mt-2">
                  <p className="font-medium">{insurance.coverageDetails}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">
          <Printer className="h-4 w-4 mr-1" /> Print Insurance Card
        </Button>
        <Button>
          <PenLine className="h-4 w-4 mr-1" /> Update Insurance
        </Button>
      </CardFooter>
    </Card>
  );
  
  return (
    <div className="mt-6 space-y-6">
      {onEdit && (
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Insurance Information</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Insurance
            </Button>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Insurance
            </Button>
          </div>
        </div>
      )}
      
      <Tabs 
        defaultValue="insurance" 
        value={activeInsuranceTab} 
        onValueChange={setActiveInsuranceTab}
        className="w-full"
      >
        <TabsList className="w-[300px] mb-4">
          <TabsTrigger value="insurance">Insurance Plans</TabsTrigger>
          <TabsTrigger value="claims">Claims History</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="insurance" className="space-y-4">
          {primaryInsurance && renderInsuranceCard(primaryInsurance, "Primary Insurance")}
          {secondaryInsurance && renderInsuranceCard(secondaryInsurance, "Secondary Insurance")}
          {tertiaryInsurance && renderInsuranceCard(tertiaryInsurance, "Tertiary Insurance")}
          
          {patient.insurance.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground mb-4">No insurance information available</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Insurance Plan
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="claims">
          <ClaimsTab claims={claims} />
        </TabsContent>
        
        <TabsContent value="referrals">
          <ReferralsTab referrals={referrals} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InsuranceTab;
