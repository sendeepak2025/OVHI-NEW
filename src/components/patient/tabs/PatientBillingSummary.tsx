import React, { useState } from "react";
import { FileText, Send, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  BillingDetails,
  formatCurrency,
  mockBillingData,
} from "@/utils/billingUtils";
import { useParams } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import HipaaNotice from "@/components/HipaaNotice";

interface PatientBillingSummaryProps {
  patientId: string;
  patientName: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800 border-green-500";
    case "submitted":
      return "bg-blue-100 text-blue-800 border-blue-500";
    case "denied":
      return "bg-red-100 text-red-800 border-red-500";
    case "partially_paid":
      return "bg-yellow-100 text-yellow-800 border-yellow-500";
    case "draft":
    default:
      return "bg-gray-100 text-gray-800 border-gray-500";
  }
};

const PatientBillingSummary: React.FC<PatientBillingSummaryProps> = ({
  patientId,
  patientName,
}) => {
  const [showConsentDialog, setShowConsentDialog] = useState<boolean>(false);
  const [selectedBillId, setSelectedBillId] = useState<string>("");
  const [selectedChannel, setSelectedChannel] = useState<
    "mail" | "email" | "fax"
  >("mail");

  const bills: BillingDetails[] = mockBillingData.filter(
    (bill) => bill.patientId === patientId
  );

  if (bills.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No billing records for this patient.
      </div>
    );
  }

  const initiateStatementSend = (
    billId: string,
    channel: "mail" | "email" | "fax"
  ) => {
    setSelectedBillId(billId);
    setSelectedChannel(channel);
    setShowConsentDialog(true);
  };

  const handleSendStatementWithConsent = () => {
    let label = "";
    let icon;
    switch (selectedChannel) {
      case "email":
        label = "Email";
        icon = <Mail className="inline w-4 h-4 mr-1" />;
        break;
      case "fax":
        label = "Fax";
        icon = <Send className="inline w-4 h-4 mr-1" rotate={90} />;
        break;
      case "mail":
      default:
        label = "Mail";
        icon = <Send className="inline w-4 h-4 mr-1" />;
        break;
    }

    // console.log(`HIPAA LOG: Statement for Bill #${selectedBillId} sent via ${label} to ${patientName} at ${new Date().toISOString()}`);

    toast.success(
      <>
        {icon}
        Statement sent via {label} for Bill #{selectedBillId} to {patientName}{" "}
        (mock)
      </>
    );

    setShowConsentDialog(false);
  };

  return (
    <div className="overflow-x-auto w-full">
      <HipaaNotice />
      <h3 className="text-lg font-semibold mb-4">Billing Summary</h3>

      <table className="min-w-full bg-white rounded shadow border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-2 border">Bill #</th>
            <th className="py-2 px-2 border">Visit Date</th>
            <th className="py-2 px-2 border">Procedures (Aid)</th>
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
            const amountPaid = isPaid
              ? bill.totalFee
              : isPartiallyPaid
              ? bill.copay ?? 0
              : 0;
            const amountPending = Math.max(bill.totalFee - amountPaid, 0);
            return (
              <tr key={bill.id} className="hover:bg-muted/20 transition">
                <td className="border px-2 py-1">{bill.id}</td>
                <td className="border px-2 py-1">
                  {bill.dateOfService instanceof Date
                    ? bill.dateOfService.toLocaleDateString()
                    : bill.dateOfService}
                </td>
                <td className="border px-2 py-1">
                  {bill.procedures && bill.procedures.length > 0
                    ? bill.procedures.map((p) => p.description).join(", ")
                    : "N/A"}
                </td>
                <td className="border px-2 py-1">
                  <Badge className={getStatusColor(bill.status)}>
                    {bill.status.charAt(0).toUpperCase() +
                      bill.status.slice(1).replace("_", " ")}
                  </Badge>
                </td>
                <td className="border px-2 py-1 text-right">
                  {formatCurrency(bill.totalFee)}
                </td>
                <td className="border px-2 py-1 text-right">
                  {formatCurrency(amountPaid)}
                </td>
                <td className="border px-2 py-1 text-right text-red-700 font-medium">
                  {amountPending > 0 ? formatCurrency(amountPending) : "-"}
                </td>
                <td className="border px-2 py-1 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" className="bg-blue-600 text-white mr-2">
                        <Send className="w-4 h-4 mr-1" />
                        Send Statement
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => initiateStatementSend(bill.id, "email")}
                      >
                        <Mail className="w-4 h-4 mr-2" /> Send via Email
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => initiateStatementSend(bill.id, "fax")}
                      >
                        <Send className="w-4 h-4 mr-2" rotate={90} /> Send via
                        Fax
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => initiateStatementSend(bill.id, "mail")}
                      >
                        <Send className="w-4 h-4 mr-2" /> Send via Mail
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // console.log(`HIPAA LOG: Bill details viewed for Bill #${bill.id} at ${new Date().toISOString()}`);
                      toast.info(`View details for Bill #${bill.id}`);
                    }}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Dialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Confirm Protected Health Information Disclosure
            </DialogTitle>
            <DialogDescription>
              You are about to send protected health information (PHI) to this
              patient. This action will be logged for HIPAA compliance.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <p>
                <strong>Patient:</strong> {patientName}
              </p>
              <p>
                <strong>Bill ID:</strong> {selectedBillId}
              </p>
              <p>
                <strong>Method:</strong>{" "}
                {selectedChannel.charAt(0).toUpperCase() +
                  selectedChannel.slice(1)}
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                By proceeding, you confirm that you have authorization to share
                this information and it complies with HIPAA regulations.
              </p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSendStatementWithConsent}>
              Confirm and Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientBillingSummary;
