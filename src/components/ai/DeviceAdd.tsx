import React, { useState } from "react";
import {
  getAllDevices,
  assignDeviceToPatientApi,
} from "@/services/operations/device";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

interface DeviceAddProps {
  patientId: string;
  fetchPatientDevices: () => void;
}

const DeviceAdd: React.FC<DeviceAddProps> = ({
  patientId,
  fetchPatientDevices,
}) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [showForm, setShowForm] = useState(false);
  const [allDevices, setAllDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImei, setSelectedImei] = useState("");

  const fetchDevices = async () => {
    const response = await getAllDevices(token, "");
    if (response?.success) {
      setAllDevices(response.data);
      setFilteredDevices(response.data);
    }
  };

  const handleToggle = () => {
    setShowForm((prev) => !prev);
    if (!showForm) fetchDevices();
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filtered = allDevices.filter((device: any) =>
      device.imei.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredDevices(filtered);
  };

  const handleAssign = async () => {
    if (!selectedImei) {
      toast.error("Please select a device");
      return;
    }

    const data = {
      patientId,
      imei: selectedImei,
    };

    try {
      await assignDeviceToPatientApi(data, token);
      fetchPatientDevices();
      setShowForm(false); // optionally hide the form
    } catch (err) {
      toast.error("Failed to assign device");
    }
  };

  return (
    <div className="relative mx-auto p-4 space-y-4 border rounded-md shadow-sm">
      {/* Fixed button top right */}
      <div className="flex justify-end">
        <Button onClick={handleToggle} className="bg-blue-600 text-white">
          {showForm ? "Cancel" : "Add Device"}
        </Button>
      </div>

      {/* Show form only when toggled */}
      {showForm && (
        <div className="space-y-4 mt-4">
          <Input
            placeholder="Search IMEI..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />

          <div className="max-h-40 overflow-y-auto border rounded-md">
            {filteredDevices.map((device: any) => (
              <div
                key={device.id}
                onClick={() => setSelectedImei(device.imei)}
                className={`px-3 py-2 cursor-pointer hover:bg-blue-100 ${
                  selectedImei === device.imei ? "bg-blue-200" : ""
                }`}
              >
                <div className="text-sm font-medium">{device.imei}</div>
                <div className="text-xs text-gray-600">
                  {device.model_number} | {device.iccid}
                </div>
              </div>
            ))}
          </div>

          <Button
            className="w-full bg-green-600 text-white"
            onClick={handleAssign}
            disabled={!selectedImei}
          >
            Assign Device
          </Button>
        </div>
      )}
    </div>
  );
};

export default DeviceAdd;
