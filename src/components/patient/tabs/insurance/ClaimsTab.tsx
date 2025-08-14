
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InsuranceClaim } from '@/data/medicalData';
import { formatDate } from '@/utils/formatHelpers';

interface ClaimsTabProps {
  claims: InsuranceClaim[];
}

const ClaimsTab: React.FC<ClaimsTabProps> = ({ claims }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Insurance Claims History</CardTitle>
        <CardDescription>Recent insurance claims and status</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Billed</TableHead>
              <TableHead>Insurance Paid</TableHead>
              <TableHead>Patient Responsibility</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Claim #</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claims.map((claim) => (
              <TableRow key={claim.id}>
                <TableCell>{formatDate(claim.date)}</TableCell>
                <TableCell>{claim.service}</TableCell>
                <TableCell>{claim.provider}</TableCell>
                <TableCell>{claim.billed}</TableCell>
                <TableCell>{claim.insurance}</TableCell>
                <TableCell>{claim.patient}</TableCell>
                <TableCell>
                  <Badge variant={claim.status === 'Paid' ? 'success' : 'warning'}>
                    {claim.status}
                  </Badge>
                </TableCell>
                <TableCell>{claim.claimNumber}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-1" /> Export Claims
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ClaimsTab;
