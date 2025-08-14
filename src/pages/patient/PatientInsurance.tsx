
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { formatDate } from '@/utils/formatHelpers';

const PatientInsurance: React.FC = () => {
  const { patients } = useData();
  const patient = patients[0]; // Demo patient

  if (!patient) {
    return <div>No patient data available</div>;
  }

  const primaryInsurance = patient.insurance?.find(ins => ins.type === 'primary');
  const secondaryInsurance = patient.insurance?.find(ins => ins.type === 'secondary');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Insurance Information</h1>

      {primaryInsurance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Primary Insurance
            </CardTitle>
            <p className="text-muted-foreground">{primaryInsurance.provider} - {primaryInsurance.planName}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Policy Information</p>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Policy Number:</span>
                      <span className="text-sm font-medium">{primaryInsurance.policyNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Group Number:</span>
                      <span className="text-sm font-medium">{primaryInsurance.groupNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Subscriber ID:</span>
                      <span className="text-sm font-medium">{primaryInsurance.subscriberID}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Coverage Period</p>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Effective Date:</span>
                      <span className="text-sm font-medium">{formatDate(primaryInsurance.effectiveDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Expiration Date:</span>
                      <span className="text-sm font-medium">{formatDate(primaryInsurance.expirationDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {primaryInsurance.copay && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-3">Copay Information</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center mb-1">
                        <CreditCard className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Primary Care</span>
                      </div>
                      <p className="text-lg font-semibold text-green-600">{primaryInsurance.copay.primaryCare}</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center mb-1">
                        <CreditCard className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Specialist</span>
                      </div>
                      <p className="text-lg font-semibold text-blue-600">{primaryInsurance.copay.specialist}</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center mb-1">
                        <CreditCard className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Emergency</span>
                      </div>
                      <p className="text-lg font-semibold text-red-600">{primaryInsurance.copay.emergency}</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center mb-1">
                        <CreditCard className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Urgent Care</span>
                      </div>
                      <p className="text-lg font-semibold text-orange-600">{primaryInsurance.copay.urgent}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-3">
                <p className="text-sm font-medium text-muted-foreground">Deductible</p>
                <p className="text-xl font-bold">{primaryInsurance.deductible}</p>
              </div>
              <div className="border rounded-lg p-3">
                <p className="text-sm font-medium text-muted-foreground">Out-of-Pocket Max</p>
                <p className="text-xl font-bold">{primaryInsurance.outOfPocketMax}</p>
              </div>
              <div className="border rounded-lg p-3">
                <p className="text-sm font-medium text-muted-foreground">Coverage</p>
                <p className="text-xl font-bold">{primaryInsurance.coveragePercentage}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <h4 className="font-medium">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Member Services: {primaryInsurance.memberServices}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Authorization: {primaryInsurance.authorizationPhone}</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                  <span>Claims: {primaryInsurance.claimsAddress}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {secondaryInsurance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Secondary Insurance
            </CardTitle>
            <p className="text-muted-foreground">{secondaryInsurance.provider} - {secondaryInsurance.planName}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Policy Number</p>
                <p className="font-semibold">{secondaryInsurance.policyNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Group Number</p>
                <p className="font-semibold">{secondaryInsurance.groupNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Subscriber</p>
                <p className="font-semibold">{secondaryInsurance.subscriberName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Coverage Details</p>
                <p className="font-semibold">{secondaryInsurance.coverageDetails}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!primaryInsurance && !secondaryInsurance && (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Insurance Information</h3>
            <p className="text-muted-foreground">No insurance information is currently on file.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientInsurance;
