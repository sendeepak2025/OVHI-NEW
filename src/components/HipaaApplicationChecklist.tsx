
import React from "react";
import { Shield, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import HipaaNotice from "./HipaaNotice";

type ChecklistItemStatus = "complete" | "incomplete" | "warning" | "not-applicable";

interface ChecklistItemProps {
  title: string;
  description: string;
  status: ChecklistItemStatus;
  notes?: string;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ title, description, status, notes }) => {
  const getStatusIcon = () => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "incomplete":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      case "not-applicable":
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case "complete":
        return "bg-green-50 border-green-200";
      case "incomplete":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-amber-50 border-amber-200";
      case "not-applicable":
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className={`p-4 border rounded-md mb-3 ${getStatusClass()}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getStatusIcon()}</div>
        <div>
          <h4 className="font-medium text-base">{title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          {notes && (
            <p className="text-sm bg-white/50 p-2 rounded mt-2 border border-dashed">
              <span className="font-medium">Notes:</span> {notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const HipaaApplicationChecklist: React.FC = () => {
  return (
    <div className="space-y-6">
      <HipaaNotice />
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            HIPAA Compliance Pre-Launch Checklist
          </CardTitle>
          <CardDescription>
            Review these critical items before deploying this healthcare application to production
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Authentication & Access Control */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Authentication & Access Control</h3>
            <ChecklistItem 
              title="Multi-Factor Authentication"
              description="Implement MFA for all users with access to PHI"
              status="incomplete"
              notes="Requires implementation before go-live"
            />
            <ChecklistItem 
              title="Role-Based Access Controls"
              description="Ensure users can only access data appropriate for their role"
              status="warning"
              notes="Basic roles exist but need more granular controls"
            />
            <ChecklistItem 
              title="Session Timeout"
              description="Automatic logout after period of inactivity"
              status="complete"
              notes="Currently set to 30 minutes in Privacy Settings"
            />
            <ChecklistItem 
              title="Strong Password Policy"
              description="Enforce complex passwords and regular changes"
              status="warning"
              notes="Basic password requirements exist but need enhancement"
            />
          </div>

          {/* Audit & Logging */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Audit & Logging</h3>
            <ChecklistItem 
              title="Access Logging"
              description="All PHI access events are logged with user, timestamp, and action"
              status="incomplete"
              notes="Needs implementation with comprehensive tracking"
            />
            <ChecklistItem 
              title="Modification Logging"
              description="All changes to PHI are logged with before/after states"
              status="incomplete"
              notes="Required for maintaining change history"
            />
            <ChecklistItem 
              title="Log Retention"
              description="Logs are securely stored and retained per policy requirements"
              status="incomplete"
              notes="Implement retention policy of at least 6 years"
            />
            <ChecklistItem 
              title="Log Review Process"
              description="Regular review of access logs for unauthorized activity"
              status="incomplete"
              notes="Implement weekly review procedure"
            />
          </div>

          {/* Data Security */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Data Security</h3>
            <ChecklistItem 
              title="Data Encryption at Rest"
              description="All PHI is encrypted in the database and storage"
              status="warning"
              notes="Database encryption needs verification"
            />
            <ChecklistItem 
              title="Data Encryption in Transit"
              description="All communications use HTTPS/TLS 1.2+ with strong ciphers"
              status="complete"
            />
            <ChecklistItem 
              title="Secure File Uploads"
              description="Uploaded files are scanned and stored securely"
              status="warning"
              notes="File scanning not yet implemented"
            />
            <ChecklistItem 
              title="Data Backup & Recovery"
              description="Regular encrypted backups with tested recovery process"
              status="incomplete"
              notes="Implement automated daily backups"
            />
          </div>

          {/* Application Security */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Application Security</h3>
            <ChecklistItem 
              title="Error Handling"
              description="Errors don't expose sensitive information to users"
              status="warning"
              notes="Needs review for information leakage"
            />
            <ChecklistItem 
              title="Input Validation"
              description="All user inputs are validated and sanitized"
              status="warning"
              notes="Basic validation exists but needs enhancement"
            />
            <ChecklistItem 
              title="API Security"
              description="APIs are secured and require authentication"
              status="incomplete"
              notes="API security review needed"
            />
            <ChecklistItem 
              title="Third-Party Components"
              description="All third-party libraries are up-to-date and scanned"
              status="incomplete"
              notes="Dependency security audit required"
            />
          </div>

          {/* Documentation & Policies */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Documentation & Policies</h3>
            <ChecklistItem 
              title="Privacy Policy"
              description="Clear privacy policy that addresses PHI handling"
              status="incomplete"
              notes="Draft exists but needs legal review"
            />
            <ChecklistItem 
              title="Terms of Service"
              description="Terms that address HIPAA requirements and responsibilities"
              status="incomplete"
              notes="Needs development and legal review"
            />
            <ChecklistItem 
              title="Breach Notification Plan"
              description="Documented plan for handling potential data breaches"
              status="incomplete"
              notes="Critical requirement before go-live"
            />
            <ChecklistItem 
              title="Business Associate Agreements"
              description="BAAs in place with all relevant third parties"
              status="incomplete"
              notes="Identify all vendors requiring BAAs"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HipaaApplicationChecklist;
