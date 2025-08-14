import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { unAssignBedApi } from "@/services/operations/patient";
import { useNavigate } from "react-router-dom";

const GetAllBeds = ({
  beds,
  fetchAllBeds,
}: {
  beds: any[];
  fetchAllBeds: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const { token } = useSelector((state: RootState) => state.auth);
  const router = useNavigate();

  const handleUnassignClick = (patientId: any) => {
    setSelectedPatientId(patientId);
    setOpen(true);
  };

  const confirmUnassign = async () => {
    if (!selectedPatientId) return;
    const response = await unAssignBedApi(selectedPatientId, token);
    if (response) {
      fetchAllBeds(); // refresh table
    }
    setOpen(false);
  };

  const statusColors: any = {
    Assigned: "bg-green-100 text-green-700",
    Unassigned: "bg-red-100 text-red-700",
    Pending: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="border rounded-lg shadow p-4 bg-white">
      <h2 className="text-lg font-semibold mb-4">Assigned Beds</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Assignment ID</TableHead>
            <TableHead>Patient Name</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Bed No</TableHead>
            <TableHead>Ward</TableHead>
            <TableHead>Room Type</TableHead>
            <TableHead>Assigned At</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {beds.map((bed) => (
            <TableRow key={bed.assignmentId}>
              <TableCell>{bed.assignmentId}</TableCell>
              <TableCell>{bed.patientName}</TableCell>
              <TableCell>{bed.gender}</TableCell>
              <TableCell>{bed.phone}</TableCell>
              <TableCell>{bed.bedNo}</TableCell>
              <TableCell>{bed.wardNo}</TableCell>
              <TableCell>{bed.roomType}</TableCell>
              <TableCell>{new Date(bed.assignedAt).toLocaleString()}</TableCell>
              <TableCell>
                <span
                  className={`text-xs px-2 py-1 rounded font-medium ${
                    statusColors[bed.bedStatus] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {bed.bedStatus}
                </span>
              </TableCell>
              <TableCell className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleUnassignClick(bed.patientId)}
                >
                  Unassign
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router(`/provider/patients/${bed.patientId}`)}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Confirmation Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Confirm Unassign</h2>
            <p className="mb-4">Do you really want to unassign this bed?</p>
            <div className="flex justify-end space-x-2">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmUnassign}>
                Unassign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GetAllBeds;
