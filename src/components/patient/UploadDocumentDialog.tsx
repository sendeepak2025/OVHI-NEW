import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { HeartPulse } from "lucide-react";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { uploadDocApi } from "@/services/operations/documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getDocumentTypeApi, getDocApi } from "@/services/operations/documents";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface UploadDocumentDialog {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UploadDocumentDialog: React.FC<UploadDocumentDialog> = ({
  open,
  onOpenChange,
}) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const { id } = useParams();

  const [description, setDescription] = useState("");
  const [pdf, setPdf] = useState<File | null>(null);
  const [types, setTypes] = useState<
    { document_type_id: number; document_type: string }[]
  >([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);

  const statusOptions = [
    { id: 1, label: "Approved" },
    { id: 2, label: "Not Approved" },
    { id: 3, label: "Hold" },
  ];

  const fetchType = async () => {
    const response = await getDocumentTypeApi(id, token);
    if (response?.types) {
      setTypes(response.types);
    }
  };
  const fetchDoc = async () => {
    const response = await getDocApi(id, token);

    console.log(response, "docs");
  };

  useEffect(() => {
    fetchType();
    fetchDoc();
  }, []);

  const handleSubmit = async () => {
    if (!pdf || !description.trim() || !selectedTypeId || !selectedStatusId) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("pdf", pdf);
      formData.append("description", description);
      formData.append("document_type_id", String(selectedTypeId));
      formData.append("status", String(selectedStatusId));

      console.log("FormData entries:");
      for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }

      await uploadDocApi(formData, token, id);

      setDescription("");
      setPdf(null);
      setSelectedTypeId(null);
      setSelectedStatusId(null);
      onOpenChange(false);
      toast.success("Document uploaded successfully.");
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-blue-600" />
            Upload Document
          </DialogTitle>
          <DialogDescription>
            Please upload a PDF document and provide additional information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setPdf(e.target.files[0]);
              }
            }}
          />

          <Select onValueChange={(val) => setSelectedTypeId(Number(val))}>
            <SelectTrigger>
              <SelectValue placeholder="Select Document Type" />
            </SelectTrigger>
            <SelectContent>
              {types.map((type) => (
                <SelectItem
                  key={type.document_type_id}
                  value={String(type.document_type_id)}
                >
                  {type.document_type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(val) => setSelectedStatusId(Number(val))}>
            <SelectTrigger>
              <SelectValue placeholder="Select Document Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status.id} value={String(status.id)}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            placeholder="Enter description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={handleSubmit}>Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDocumentDialog;
