
import React, { useState } from "react";
import { getBillsForPatient, getBillingSummary, formatCurrency, BillingDetails } from "@/utils/billingUtils";
import { Button } from "@/components/ui/button";
import PatientStatement from "@/components/billing/PatientStatement";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface PatientInfo {
  name: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

interface Props {
  patientId: string;
  patientInfo: PatientInfo;
}

const PatientAllBillsSummary: React.FC<Props> = ({ patientId, patientInfo }) => {
  const bills: BillingDetails[] = getBillsForPatient(patientId);
  const summary = getBillingSummary(bills);

  const [selectedBill, setSelectedBill] = useState<BillingDetails | null>(null);

  if (bills.length === 0) {
    return (
      <div className="p-4 text-muted-foreground">No billing records for this patient.</div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">All Bills Summary</h3>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="bg-blue-50 rounded p-3 min-w-[160px]">
          <div className="text-xs text-muted-foreground">Total Billed</div>
          <div className="text-xl font-bold text-blue-800">{formatCurrency(summary.totalBilled)}</div>
        </div>
        <div className="bg-green-50 rounded p-3 min-w-[160px]">
          <div className="text-xs text-muted-foreground">Total Paid</div>
          <div className="text-xl font-bold text-green-800">{formatCurrency(summary.totalPaid)}</div>
        </div>
        <div className="bg-yellow-50 rounded p-3 min-w-[160px]">
          <div className="text-xs text-muted-foreground">Total Pending</div>
          <div className="text-xl font-bold text-yellow-800">{formatCurrency(summary.totalPending)}</div>
        </div>
      </div>

      <div className="overflow-x-auto mb-4">
        <table className="min-w-full text-sm bg-white rounded shadow border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-2 border">Bill #</th>
              <th className="py-2 px-2 border">Date</th>
              <th className="py-2 px-2 border">Status</th>
              <th className="py-2 px-2 border">Total</th>
              <th className="py-2 px-2 border">Paid</th>
              <th className="py-2 px-2 border">Pending</th>
              <th className="py-2 px-2 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => {
              const isPaid = bill.status === "paid";
              const isPartiallyPaid = bill.status === "partially_paid";
              const paid = isPaid ? bill.totalFee : isPartiallyPaid ? (bill.copay ?? 0) : 0;
              const pending = Math.max(bill.totalFee - paid, 0);

              return (
                <tr key={bill.id} className="hover:bg-muted/20">
                  <td className="border px-2 py-1">{bill.id}</td>
                  <td className="border px-2 py-1">
                    {bill.dateOfService instanceof Date
                      ? bill.dateOfService.toLocaleDateString()
                      : bill.dateOfService}
                  </td>
                  <td className="border px-2 py-1 capitalize">{bill.status.replace("_", " ")}</td>
                  <td className="border px-2 py-1 text-right">{formatCurrency(bill.totalFee)}</td>
                  <td className="border px-2 py-1 text-right">{formatCurrency(paid)}</td>
                  <td className="border px-2 py-1 text-right">{pending > 0 ? formatCurrency(pending) : "-"}</td>
                  <td className="border px-2 py-1 text-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setSelectedBill(bill)}>
                          View Statement
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Patient Statement</DialogTitle>
                          <DialogDescription>
                            View, print or send a statement for this patient's bill.
                          </DialogDescription>
                        </DialogHeader>
                        {selectedBill && (
                          <PatientStatement
                            bill={selectedBill}
                            patientInfo={patientInfo}
                            onPrint={() => {
                              window.print();
                              toast.success("Printed patient statement!");
                            }}
                            onSendStatement={() =>
                              toast.success(`Patient statement sent for ${patientInfo.name}`)
                            }
                          />
                        )}
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="ghost">Close</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientAllBillsSummary;
