
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VitalSigns } from '@/data/medicalData';
import { formatDate } from '@/utils/formatHelpers';

interface VitalsTabProps {
  vitals: VitalSigns[];
  onEdit?: () => void;
}

const VitalsTab: React.FC<VitalsTabProps> = ({ vitals, onEdit }) => {
  return (
    <div className="mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Vital Signs History</CardTitle>
            <CardDescription>Patient vital measurements over time</CardDescription>
          </div>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Blood Pressure</TableHead>
                <TableHead>Pulse</TableHead>
                <TableHead>Temperature</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Height</TableHead>
                <TableHead>BMI</TableHead>
                <TableHead>Respiratory Rate</TableHead>
                <TableHead>O2 Saturation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vitals.map((vital, index) => (
                <TableRow key={index}>
                  <TableCell>{formatDate(vital.date)}</TableCell>
                  <TableCell>{vital.bp}</TableCell>
                  <TableCell>{vital.pulse} bpm</TableCell>
                  <TableCell>{vital.temp}°F</TableCell>
                  <TableCell>{vital.weight} lbs</TableCell>
                  <TableCell>{vital.height}</TableCell>
                  <TableCell>{vital.bmi}</TableCell>
                  <TableCell>{vital.respiratory}/min</TableCell>
                  <TableCell>{vital.o2}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="justify-between">
          <Button variant="outline">Download Vital History</Button>
          <Button><PlusCircle className="h-4 w-4 mr-1" /> Add New Vitals</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VitalsTab;
