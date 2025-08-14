import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  getAllPatientsAPI,
  sendConsentApi,
} from "@/services/operations/patient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

const AddPatientConsent = ({ fetchConsents }) => {
  const { token } = useSelector((state: RootState) => state.auth);

  const [open, setOpen] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    patientId: "",
  });

  useEffect(() => {
    fetchPatients();
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [token]);

  const fetchPatients = async () => {
    try {
      const res = await getAllPatientsAPI(1, token);
      if (res?.data) {
        const limited = res.data.slice(0, 50);
        setPatients(limited);
      }
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    }
  };

  const handleClickOutside = (e: any) => {
    if (
      dropdownRef.current &&
      !(dropdownRef.current as any).contains(e.target)
    ) {
      setIsDropdownOpen(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = patients.filter((p) =>
      `${p.firstname} ${p.lastname}`.toLowerCase().includes(term)
    );
    setFilteredPatients(filtered);
  };

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
    setFormData({ ...formData, patientId: patient.patientId });
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendConsentApi(formData?.patientId, token);
      setFormData({ patientId: "" });
      fetchConsents();
      setSelectedPatient(null);
      setSearchTerm("");
      setIsDropdownOpen(false);
      setOpen(false);
    } catch (error) {
      console.error("Error assigning bed:", error);
    }
  };

  return (
    <div className="px-4 pt-20">
      {/* Fixed Assign Bed Button */}
      <div className="fixed top-4 right-4 z-50">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Send Consent</Button>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-xl font-semibold text-center text-indigo-600">
                Send Consent to Patient
              </h2>

              {/* Patient Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium mb-1">
                  Patient
                </label>
                <div
                  onClick={() => {
                    setFilteredPatients(patients);
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                  className="w-full border p-2 rounded cursor-pointer bg-white"
                >
                  {selectedPatient
                    ? `${selectedPatient.firstname} ${selectedPatient.lastname}`
                    : "Select patient"}
                </div>

                {isDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-y-auto">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearch}
                      placeholder="Search patient by name..."
                      className="w-full p-2 border-b outline-none"
                      autoFocus
                    />
                    <ul>
                      {filteredPatients.map((p) => (
                        <li
                          key={p.patientId}
                          onClick={() => handlePatientSelect(p)}
                          className="p-2 hover:bg-indigo-50 cursor-pointer"
                        >
                          {p.firstname} {p.lastname}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full ">
                Submit
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AddPatientConsent;
