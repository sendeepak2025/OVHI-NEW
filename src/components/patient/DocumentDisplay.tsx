import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  CheckCircle,
  FileText,
  Calendar,
  FileCheck2,
} from "lucide-react";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getDocApi } from "@/services/operations/documents";

interface Document {
  id: number;
  patient_id: number;
  document_type_id: number;
  description: string;
  aws_url: string;
  status: number;
  created: string;
}

interface DocumentDisplayProps {
  refreshTrigger: boolean;
}

const DocumentDisplay: React.FC<DocumentDisplayProps> = ({
  refreshTrigger,
}) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const { id } = useParams();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [visibleDetailsIds, setVisibleDetailsIds] = useState<Set<number>>(
    new Set()
  );

  const fetchDocuments = async () => {
    const response = await getDocApi(id, token);
    if (response?.types) {
      setDocuments(response.types);
    }
  };

  useEffect(() => {
    fetchDocuments();
    setVisibleDetailsIds(new Set());
  }, [id, token, refreshTrigger]);

  const handleToggleDetails = (docId: number) => {
    const newVisibleDetailsIds = new Set(visibleDetailsIds);
    if (newVisibleDetailsIds.has(docId)) {
      newVisibleDetailsIds.delete(docId);
    } else {
      newVisibleDetailsIds.add(docId);
    }
    setVisibleDetailsIds(newVisibleDetailsIds);
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 1:
        return "Approved";
      case 2:
        return "Not Approved";
      case 3:
        return "Hold";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return "bg-green-100 text-green-700";
      case 2:
        return "bg-red-100 text-red-700";
      case 3:
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
        Uploaded Documents
      </h2>

      {documents.length === 0 ? (
        <p className="text-gray-500">No documents uploaded yet.</p>
      ) : (
        <div className="space-y-6">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="border border-gray-200 rounded-xl shadow-sm p-5 bg-white"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="flex items-center gap-2 text-lg font-medium text-gray-800">
                    <FileText className="w-5 h-5 text-blue-500" />
                    {doc.description}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Calendar className="w-4 h-4" />
                    Uploaded on: {new Date(doc.created).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      doc.status
                    )}`}
                  >
                    {getStatusLabel(doc.status)}
                  </span>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleDetails(doc.id)}
                    title={
                      visibleDetailsIds.has(doc.id)
                        ? "Hide Details"
                        : "View Full Details"
                    }
                  >
                    {visibleDetailsIds.has(doc.id) ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <PlusCircle className="h-5 w-5 text-blue-500" />
                    )}
                  </Button>
                </div>
              </div>

              {visibleDetailsIds.has(doc.id) && (
                <div className="mt-4 bg-gray-50 p-4 rounded-lg border text-sm text-gray-800">
                  <div className="flex items-center gap-2 mb-3 text-gray-700 font-semibold">
                    <FileCheck2 className="w-4 h-4" />
                    Full Document Details
                  </div>

                  <div className="space-y-2 grid grid-cols-2">
                    <p>
                      <span className="font-semibold text-gray-600">
                        Document ID:
                      </span>{" "}
                      {doc.id}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-600">
                        Patient ID:
                      </span>{" "}
                      {doc.patient_id}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-600">
                        Document Type ID:
                      </span>{" "}
                      {doc.document_type_id}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-600">
                        Description:
                      </span>{" "}
                      {doc.description}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-600">
                        Status:
                      </span>{" "}
                      {getStatusLabel(doc.status)}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-600">
                        Created On:
                      </span>{" "}
                      {new Date(doc.created).toLocaleString()}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-600">
                        Document:
                      </span>{" "}
                      <a
                        href={doc.aws_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="link"
                          className="text-blue-600 p-0 h-auto"
                        >
                          See Document
                        </Button>
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentDisplay;
