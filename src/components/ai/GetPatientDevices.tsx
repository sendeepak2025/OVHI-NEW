import React from "react";
import { format } from "date-fns";

const GetPatientDevices = ({ patientAssignDevices = [] }) => {
  if (!patientAssignDevices.length) {
    return (
      <div className="p-6 text-center text-lg text-gray-500 bg-white rounded-lg shadow-sm">
        No RPM devices currently assigned to this patient.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {patientAssignDevices.map((device, index) => (
        <div
          key={device.id || index}
          className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 ease-in-out"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
            {/* Device ID and Status */}
            <div className="flex items-center mb-2 md:mb-0">
              <h3 className="text-xl font-bold text-gray-800 mr-3">
                {device.device_id}
              </h3>
              <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                Assigned
              </span>
            </div>
            {/* Last Assigned Date */}
            <div className="text-sm text-gray-500">
              <span className="font-semibold text-gray-600">
                Last Assigned:
              </span>{" "}
              {format(new Date(device.assigned_date), "dd MMM yyyy, hh:mm a")}
            </div>
          </div>

          {/* Device Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 text-gray-700 text-base">
            <div>
              <span className="font-semibold text-gray-600">Model:</span>{" "}
              {device.model_number}
            </div>
            <div>
              <span className="font-semibold text-gray-600">IMEI:</span>{" "}
              {device.imei}
            </div>
            <div>
              <span className="font-semibold text-gray-600">ICCID:</span>{" "}
              {device.iccid}
            </div>
            <div>
              <span className="font-semibold text-gray-600">Firmware:</span>{" "}
              {device.firmware_version}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GetPatientDevices;
