import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Send, 
  UserPlus, 
  FileText, 
  Printer, 
  Copy,
  Edit,
  Trash2
} from 'lucide-react';
import { PatientEncounterData } from '@/types/dataTypes';

interface EncounterActionsPanelProps {
  encounter: PatientEncounterData;
  onEdit: (encounter: PatientEncounterData) => void;
  onDelete: (encounterId: string) => void;
  onFax: (encounter: PatientEncounterData) => void;
  onCreateReferral: (encounter: PatientEncounterData) => void;
  onGenerateSuperbill: (encounter: PatientEncounterData) => void;
  onPrint: (encounter: PatientEncounterData) => void;
  onClone: (encounter: PatientEncounterData) => void;
}

export const EncounterActionsPanel: React.FC<EncounterActionsPanelProps> = ({
  encounter,
  onEdit,
  onDelete,
  onFax,
  onCreateReferral,
  onGenerateSuperbill,
  onPrint,
  onClone
}) => {
  return (
    <div className="flex gap-2">
      {/* Primary Edit Button */}
      <Button
        onClick={() => onEdit(encounter)}
        variant="outline"
        size="sm"
      >
        <Edit className="h-4 w-4" />
      </Button>

      {/* Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onFax(encounter)}>
            <Send className="h-4 w-4 mr-2" />
            Fax Encounter
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => onCreateReferral(encounter)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Create Referral
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => onGenerateSuperbill(encounter)}>
            <FileText className="h-4 w-4 mr-2" />
            Generate Superbill
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => onPrint(encounter)}>
            <Printer className="h-4 w-4 mr-2" />
            Print/Export
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => onClone(encounter)}>
            <Copy className="h-4 w-4 mr-2" />
            Clone Encounter
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => onDelete(encounter.encounter_id?.toString() || encounter._id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Encounter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};