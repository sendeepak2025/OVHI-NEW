import React, { useState, useEffect } from "react";
import { getCcmReportsAPI } from "@/services/operations/patient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Minus, Download } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

function CcmHistory({ id }) {
  const { toast } = useToast();

  const [pcmReports, setPcmReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { token } = useSelector((state: RootState) => state.auth);

  const fetchPcmReports = async () => {
    try {
      setLoading(true);
      // Ensure your API call is correct for fetching data using the token
      const res = await getCcmReportsAPI(id, token);
      // console.log("Fetched pcm patient data:", res);

      if (res) {
        // Since the data example shows 'total_time' on each report,
        // we expect 'res' to be an array of report objects directly.
        // If 'res' is nested (e.g., { data: [...] }), adjust 'res' accordingly.
        setPcmReports(res);
      } else {
        setPcmReports([]);
      }
    } catch (error) {
      console.error("Failed to fetch patient:", error);
      toast({
        title: "Error",
        description: "Failed to fetch patient data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data only if history is meant to be shown and we don't have reports yet
    if (id && showHistory && pcmReports.length === 0) {
      fetchPcmReports();
    }
  }, [id, showHistory, pcmReports.length]);

  const toggleHistoryVisibility = () => {
    setShowHistory(!showHistory);
    // If we are about to show history and data hasn't been fetched yet, fetch it.
    if (!showHistory && pcmReports.length === 0) {
      fetchPcmReports();
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      <button
        onClick={toggleHistoryVisibility}
        className="w-full flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200 focus:outline-none transition-colors duration-200"
      >
        <h2 className="text-lg font-semibold text-gray-800">
          CCM Assessment History
        </h2>
        <span className="text-gray-600 text-xl">
          {showHistory ? <Minus /> : <Plus />}
        </span>
      </button>

      {showHistory && (
        <div className="p-4 border-t border-gray-200 animate-slide-down">
          {loading ? (
            <p className="text-center text-gray-500 py-4">Loading history...</p>
          ) : pcmReports.length > 0 ? (
            <ul className="space-y-3">
              {pcmReports.map((report) => (
                <li
                  key={report.id}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-md border border-blue-200 shadow-sm"
                >
                  {/* Left section: Document Link and Date/Time */}
                  <div className="flex flex-col flex-grow min-w-0">
                    <a
                      href={report.document_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:text-blue-900 font-medium transition-colors duration-200 truncate"
                      title={`CCM Assessment - ${new Date(
                        report.created
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })} at ${new Date(report.created).toLocaleTimeString(
                        "en-US",
                        { hour: "2-digit", minute: "2-digit", hour12: true }
                      )}`}
                    >
                      CCM Assessment -{" "}
                      {new Date(report.created).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      at{" "}
                      {new Date(report.created).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </a>
                  </div>

                  {/* Right section: Total Time and Download Button */}
                  <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                    {report.total_time && (
                      <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm font-medium rounded-full whitespace-nowrap">
                        {report.total_time}
                      </span>
                    )}
                    <a
                      href={report.document_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-200 text-blue-700 hover:bg-blue-300 transition-colors duration-200"
                      aria-label="Download document"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-4">
              No history documents found for this patient.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default CcmHistory;
