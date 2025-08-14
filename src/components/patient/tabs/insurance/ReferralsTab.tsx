
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, PlusCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Referral } from '@/data/medicalData';
import { formatDate } from '@/utils/formatHelpers';

interface ReferralsTabProps {
  referrals: Referral[];
}

const ReferralsTab: React.FC<ReferralsTabProps> = ({ referrals }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Referrals and Authorizations</CardTitle>
        <CardDescription>Specialist referrals and insurance authorizations</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Specialist Type</TableHead>
              <TableHead>Specialist</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Referred By</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {referrals.map((referral) => (
              <TableRow key={referral.id}>
                <TableCell>{formatDate(referral.date)}</TableCell>
                <TableCell>{referral.specialistType}</TableCell>
                <TableCell>{referral.specialist}</TableCell>
                <TableCell>{referral.reason}</TableCell>
                <TableCell>
                  <Badge 
                    className={
                      referral.status === 'Completed' 
                        ? 'bg-green-500 text-white' 
                        : referral.status === 'Scheduled' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-amber-500 text-white'
                    }
                  >
                    {referral.status}
                  </Badge>
                </TableCell>
                <TableCell>{referral.referredBy}</TableCell>
                <TableCell>{referral.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">
          <Download className="h-4 w-4 mr-1" /> Export Referrals
        </Button>
        <Button>
          <PlusCircle className="h-4 w-4 mr-1" /> New Referral
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReferralsTab;
