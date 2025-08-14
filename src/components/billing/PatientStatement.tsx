
import React from "react";
import { BillingDetails, formatCurrency } from "@/utils/billingUtils";
import { Button } from "@/components/ui/button";
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

interface PatientStatementProps {
  bill: BillingDetails;
  patientInfo: PatientInfo;
  onPrint?: () => void;
  onSendStatement?: () => void;
}

const PatientStatement: React.FC<PatientStatementProps> = ({
  bill,
  patientInfo,
  onPrint,
  onSendStatement,
}) => {
  // Amount paid = if paid or partially_paid, show copay or total if self-pay.
  const isPaid = bill.status === "paid";
  const isPartiallyPaid = bill.status === "partially_paid";
  const amountPaid =
    isPaid
      ? bill.totalFee
      : isPartiallyPaid
      ? (bill.copay ?? 0)
      : 0;
  const amountRemaining = Math.max(bill.totalFee - amountPaid, 0);

  return (
    <div className="bg-white text-gray-900 p-6 rounded-lg max-w-2xl mx-auto">
      <div className="flex justify-between items-center border-b pb-3">
        <div>
          <h2 className="text-lg font-bold">Patient Statement</h2>
          <div className="text-xs mt-2">
            Statement Date: {new Date().toLocaleDateString()}
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="bg-primary text-white" onClick={onPrint}>
            Print
          </Button>
          <Button
            className="bg-blue-600 text-white"
            onClick={() => {
              if (onSendStatement) {
                onSendStatement();
              } else {
                toast.success("Patient statement sent (mock)!");
              }
            }}
            variant="outline"
          >
            Send Statement
          </Button>
        </div>
      </div>
      <div className="mt-5 mb-3">
        <h3 className="font-medium mb-1">Patient Information</h3>
        <div className="text-sm">
          <div>{patientInfo.name}</div>
          <div>
            DOB: {patientInfo.dateOfBirth} | Gender: {patientInfo.gender}
          </div>
          <div>
            {patientInfo.address}, {patientInfo.city}, {patientInfo.state} {patientInfo.zip}
          </div>
          <div>Phone: {patientInfo.phone}</div>
        </div>
      </div>

      <div className="mb-3">
        <h3 className="font-medium mb-1">Bill & Visit Details</h3>
        <div className="text-sm grid grid-cols-2 gap-2">
          <div>
            <span className="font-semibold">Bill #:</span> {bill.id}
          </div>
          <div>
            <span className="font-semibold">Date of Service:</span>{" "}
            {bill.dateOfService instanceof Date
              ? bill.dateOfService.toLocaleDateString()
              : bill.dateOfService}
          </div>
          <div>
            <span className="font-semibold">Status:</span>{" "}
            {bill.status.charAt(0).toUpperCase() + bill.status.slice(1).replace("_", " ")}
          </div>
          <div>
            <span className="font-semibold">Provider:</span> {bill.providerId}
          </div>
          <div className="col-span-2">
            <span className="font-semibold">Visit/Aid:</span>{" "}
            {bill.procedures && bill.procedures.length > 0
              ? bill.procedures
                  .map((proc) => proc.description)
                  .join(", ")
              : "N/A"}
          </div>
        </div>
      </div>

      <table className="w-full text-sm border mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-2 border">Description</th>
            <th className="py-2 px-2 border">Code</th>
            <th className="py-2 px-2 border">Qty</th>
            <th className="py-2 px-2 border">Amount</th>
          </tr>
        </thead>
        <tbody>
          {bill.procedures.map(proc => (
            <tr key={proc.id}>
              <td className="py-1 px-2 border">{proc.description}</td>
              <td className="py-1 px-2 border">{proc.cptCode}</td>
              <td className="py-1 px-2 border text-center">{proc.quantity}</td>
              <td className="py-1 px-2 border text-right">
                {formatCurrency(proc.fee * proc.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="mb-2">
        {bill.diagnoses.map(d => (
          <li key={d.id} className="text-xs">
            <span className="font-semibold">Diagnosis ({d.icd10Code}):</span> {d.description}
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-1 items-end mt-4 border-t pt-3 text-base font-medium">
        <div className="flex items-center">
          <span>Total Amount Due:</span>
          <span className="ml-3 text-primary">{formatCurrency(bill.totalFee)}</span>
        </div>
        <div className="flex items-center text-sm text-green-700">
          <span>Amount Paid:</span>
          <span className="ml-3">{formatCurrency(amountPaid)}</span>
        </div>
        <div className="flex items-center text-sm text-red-700">
          <span>Amount Remaining:</span>
          <span className="ml-3">{formatCurrency(amountRemaining)}</span>
        </div>
      </div>
      <div className="text-xs text-muted-foreground mt-2">
        This statement is for informational purposes. If you have questions, please contact the billing department.
      </div>
    </div>
  );
};

export default PatientStatement;
