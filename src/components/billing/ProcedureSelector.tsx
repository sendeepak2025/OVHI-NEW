
import React, { useState } from 'react';
import { commonCPTCodes, ProcedureCode, formatCurrency } from '@/utils/billingUtils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, X, Plus, Minus } from 'lucide-react';

interface ProcedureSelectorProps {
  selectedProcedures: ProcedureCode[];
  onProcedureChange: (procedures: ProcedureCode[]) => void;
  maxSelections?: number;
}

const ProcedureSelector: React.FC<ProcedureSelectorProps> = ({
  selectedProcedures,
  onProcedureChange,
  maxSelections = 8
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleSelect = (cptCode: string, description: string, fee: number) => {
    // Check if this procedure is already selected
    const existingIndex = selectedProcedures.findIndex(p => p.cptCode === cptCode);
    
    if (existingIndex >= 0) {
      // Increase quantity of existing procedure
      const updatedProcedures = [...selectedProcedures];
      updatedProcedures[existingIndex] = {
        ...updatedProcedures[existingIndex],
        quantity: updatedProcedures[existingIndex].quantity + 1
      };
      onProcedureChange(updatedProcedures);
    } else {
      // Check if we're at max unique selections
      if (selectedProcedures.length >= maxSelections) return;
      
      // Add new procedure
      const newProcedure: ProcedureCode = {
        id: `proc-${Math.random().toString(36).substr(2, 9)}`,
        cptCode,
        description,
        fee,
        quantity: 1
      };
      
      onProcedureChange([...selectedProcedures, newProcedure]);
    }
    
    setOpen(false);
  };

  const removeProcedure = (id: string) => {
    onProcedureChange(selectedProcedures.filter(proc => proc.id !== id));
  };

  const adjustQuantity = (id: string, change: number) => {
    const updatedProcedures = selectedProcedures.map(proc => {
      if (proc.id === id) {
        const newQuantity = Math.max(1, proc.quantity + change);
        return { ...proc, quantity: newQuantity };
      }
      return proc;
    });
    
    onProcedureChange(updatedProcedures);
  };

  const filteredCodes = commonCPTCodes.filter(code => 
    code.code.toLowerCase().includes(searchValue.toLowerCase()) || 
    code.description.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        {selectedProcedures.map(procedure => (
          <div key={procedure.id} className="flex items-center justify-between p-2 border rounded-md">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">{procedure.cptCode}</Badge>
                <span className="font-medium">{procedure.description}</span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {formatCurrency(procedure.fee)} per unit × {procedure.quantity} = {formatCurrency(procedure.fee * procedure.quantity)}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => adjustQuantity(procedure.id, -1)}
                disabled={procedure.quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center">{procedure.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => adjustQuantity(procedure.id, 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 ml-2"
                onClick={() => removeProcedure(procedure.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            role="combobox" 
            aria-expanded={open}
            className="w-full justify-between"
            disabled={selectedProcedures.length >= maxSelections}
          >
            {selectedProcedures.length === 0 ? "Select procedures..." : `${selectedProcedures.length} procedure codes selected`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput 
              placeholder="Search CPT codes..." 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            {filteredCodes.length === 0 ? (
              <CommandEmpty>No CPT codes found.</CommandEmpty>
            ) : (
              <CommandGroup className="max-h-64 overflow-y-auto">
                {filteredCodes.map(code => (
                  <CommandItem
                    key={code.code}
                    value={`${code.code} ${code.description}`}
                    onSelect={() => handleSelect(code.code, code.description, code.fee)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            selectedProcedures.some(p => p.cptCode === code.code)
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        />
                        <span className="font-mono mr-2">{code.code}</span>
                        <span className="text-sm text-muted-foreground">{code.description}</span>
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(code.fee)}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ProcedureSelector;
