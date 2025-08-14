
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenLine, Printer } from 'lucide-react';
import { Patient } from '@/data/patientData';
import { formatDate } from '@/utils/formatHelpers';

interface SecondaryInsuranceTabProps {
  patient: Patient;
}

const SecondaryInsuranceTab: React.FC<SecondaryInsuranceTabProps> = ({ patient }) => {
  const insurance = patient.insurance.find(ins => ins.type === 'secondary');
  
  if (!insurance) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Secondary Insurance Details</CardTitle>
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
          
          <div>
            {insurance.coverageDetails && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Coverage Details</h4>
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">Coverage Information</p>
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
};

export default SecondaryInsuranceTab;
