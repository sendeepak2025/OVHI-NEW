import React from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const GetAllConsents = ({ consents }) => {
  if (!consents?.length) {
    return (
      <div className="text-gray-500 text-center mt-4">No consents found.</div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {consents.map((consent) => {
        const isNotReceived = consent?.status === "Not Received";
        const status = consent?.status || "N/A";

        const statusColor =
          status === "Received"
            ? "bg-green-100 text-green-700"
            : status === "Pending"
            ? "bg-yellow-100 text-yellow-700"
            : status === "Not Received"
            ? "bg-red-100 text-red-700"
            : "bg-gray-100 text-gray-700";

        return (
          <div
            key={consent?.id}
            className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                {consent?.patientName}
              </h2>
              <p className="text-sm text-gray-600">{consent?.email}</p>
              <p className="text-sm text-gray-600">📞 {consent?.phone}</p>
            </div>

            <div className="text-sm text-gray-700 space-y-1">
              <p>
                <span className="font-semibold">Gender:</span>{" "}
                {consent?.gender || "N/A"}
              </p>
              <p>
                <span className="font-semibold">DOB:</span>{" "}
                {consent?.dob
                  ? new Date(consent?.dob).toLocaleDateString()
                  : "N/A"}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{" "}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}
                >
                  {status}
                </span>
              </p>
              <p>
                <span className="font-semibold">Send At:</span>{" "}
                {consent?.created
                  ? new Date(consent?.created).toLocaleString()
                  : "N/A"}
              </p>
            </div>

            {!isNotReceived && (
              <div className="mt-4">
                <a
                  href={consent?.s3_bucket_url_rpm}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    View PDF
                  </Button>
                </a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GetAllConsents;
