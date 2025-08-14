
import React from "react";
import { ShieldCheck } from "lucide-react";

const HipaaNotice: React.FC = () => (
  <div className="flex items-center gap-3 p-3 rounded-lg border bg-blue-50 border-blue-200 mb-4">
    <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0" aria-label="HIPAA" />
    <div>
      <span className="font-semibold">HIPAA Notice:</span>{" "}
      This section contains protected health information (PHI). Access, disclosure, and handling are governed by HIPAA regulations. All actions are logged for compliance.
    </div>
  </div>
);

export default HipaaNotice;
