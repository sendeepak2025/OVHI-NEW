import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, DollarSign } from 'lucide-react';

interface BillingCodesProps {
  billingCodes: {
    icd10Codes: string[];
    primaryCpt: string;
    secondaryCpts: string[];
  };
  onBillingCodesChange: (codes: any) => void;
}

export const BillingSection: React.FC<BillingCodesProps> = ({ 
  billingCodes, 
  onBillingCodesChange 
}) => {
  const addICD10Code = () => {
    const newCodes = [...billingCodes.icd10Codes, ''];
    onBillingCodesChange({ ...billingCodes, icd10Codes: newCodes });
  };

  const updateICD10Code = (index: number, value: string) => {
    const newCodes = [...billingCodes.icd10Codes];
    newCodes[index] = value;
    onBillingCodesChange({ ...billingCodes, icd10Codes: newCodes });
  };

  const removeICD10Code = (index: number) => {
    const newCodes = billingCodes.icd10Codes.filter((_, i) => i !== index);
    onBillingCodesChange({ ...billingCodes, icd10Codes: newCodes });
  };

  const addSecondaryCPT = () => {
    const newCpts = [...billingCodes.secondaryCpts, ''];
    onBillingCodesChange({ ...billingCodes, secondaryCpts: newCpts });
  };

  const updateSecondaryCPT = (index: number, value: string) => {
    const newCpts = [...billingCodes.secondaryCpts];
    newCpts[index] = value;
    onBillingCodesChange({ ...billingCodes, secondaryCpts: newCpts });
  };

  const removeSecondaryCPT = (index: number) => {
    const newCpts = billingCodes.secondaryCpts.filter((_, i) => i !== index);
    onBillingCodesChange({ ...billingCodes, secondaryCpts: newCpts });
  };

  return (
    <div className="space-y-6">
      {/* Primary CPT Code */}
      <div className="space-y-2">
        <Label className="text-base font-medium">Primary CPT Code</Label>
        <Input
          value={billingCodes.primaryCpt}
          onChange={(e) => onBillingCodesChange({ ...billingCodes, primaryCpt: e.target.value })}
          placeholder="99205"
          className="max-w-xs"
        />
        <p className="text-sm text-gray-600">Primary procedure code for billing</p>
      </div>

      {/* ICD-10 Codes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">ICD-10 Diagnosis Codes</Label>
          <Button onClick={addICD10Code} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add ICD-10
          </Button>
        </div>
        <div className="space-y-2">
          {billingCodes.icd10Codes.map((code, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={code}
                onChange={(e) => updateICD10Code(index, e.target.value)}
                placeholder="Z00.00"
                className="max-w-xs"
              />
              <Button
                onClick={() => removeICD10Code(index)}
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Secondary CPT Codes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Secondary CPT Codes</Label>
          <Button onClick={addSecondaryCPT} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Secondary CPT
          </Button>
        </div>
        <div className="space-y-2">
          {billingCodes.secondaryCpts.map((code, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={code}
                onChange={(e) => updateSecondaryCPT(index, e.target.value)}
                placeholder="99213"
                className="max-w-xs"
              />
              <Button
                onClick={() => removeSecondaryCPT(index)}
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </Button>
            </div>
          ))}
          {billingCodes.secondaryCpts.length === 0 && (
            <p className="text-gray-500 text-sm">No secondary CPT codes added</p>
          )}
        </div>
      </div>

      {/* Billing Summary */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium mb-2">Billing Summary</h4>
        <div className="space-y-1 text-sm">
          <p><strong>Primary CPT:</strong> {billingCodes.primaryCpt || 'Not set'}</p>
          <p><strong>ICD-10 Codes:</strong> {billingCodes.icd10Codes.filter(code => code.trim()).join(', ') || 'None'}</p>
          <p><strong>Secondary CPTs:</strong> {billingCodes.secondaryCpts.filter(code => code.trim()).join(', ') || 'None'}</p>
        </div>
      </div>
    </div>
  );
};
