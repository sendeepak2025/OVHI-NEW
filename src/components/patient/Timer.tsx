import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { submiteDurationApi } from "@/services/operations/patient";
import { useParams } from "react-router-dom";

const Timer = () => {
  const [duration, setDuration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("");
  const { token } = useSelector((state: RootState) => state.auth);
  const { id } = useParams();
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => setDuration((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleStop = () => {
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      const data = {
        note,
        category,
        duration,
      };
      await submiteDurationApi(data, token, id);

      setIsRunning(false); // Timer stops here
      setShowModal(false);
      setDuration(0);
      setNote("");
      setCategory("");
    } catch (error) {
      console.error("Error submitting timer:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-br p-6">
      <div className="grid grid-cols-2 items-center gap-3">
        <div className="text-xl font-mono font-bold text-gray-800 tracking-widest border border-gray-300 px-6 py-2 rounded-lg bg-white shadow-inner">
          {formatTime(duration)}
        </div>

        <div className="space-x-4">
          {!isRunning ? (
            <button
              onClick={() => setIsRunning(true)}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition"
            >
              Start
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition"
            >
              Stop
            </button>
          )}
        </div>
      </div>

      {showModal &&
        createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition">
            <div className="bg-white p-6 rounded-2xl w-[90%] max-w-md shadow-xl space-y-4">
              <h2 className="text-2xl font-bold text-gray-700">📝 Add Notes</h2>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={category}
                  onValueChange={(value) => setCategory(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medication_review">
                      Medication Review
                    </SelectItem>
                    <SelectItem value="specialist_consult">
                      Specialist Consultation
                    </SelectItem>
                    <SelectItem value="lab_follow_up">Lab Follow-up</SelectItem>
                    <SelectItem value="patient_education">
                      Patient Education
                    </SelectItem>
                    <SelectItem value="care_plan_update">
                      Care Plan Update
                    </SelectItem>
                    <SelectItem value="family_engagement">
                      Family Engagement
                    </SelectItem>
                    <SelectItem value="discharge_planning">
                      Discharge Planning
                    </SelectItem>
                    <SelectItem value="RPM">
                      RPM
                    </SelectItem>
                    <SelectItem value="CCM">
                      CCM
                    </SelectItem>
                    <SelectItem value="discharge_planning">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter notes here..."
              />

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default Timer;
