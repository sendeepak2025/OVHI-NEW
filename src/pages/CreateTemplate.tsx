import React, { useEffect, useState } from "react";
import {
  createTemplateApi,
  getTemplateApi,
  updateTemplateApi,
  deleteTemplate,
} from "@/services/operations/encounter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface Template {
  template_id?: number; // Optional as it's not present during creation
  template_name: string;
  encounter_type: string;
  default_reason: string;
  default_notes: string;
  default_diagnosis_codes: string;
  default_procedure_codes: string;
  // 'created' field is deliberately excluded from this interface for frontend form data
}

const CreateTemplate = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false); // For initial template data fetching
  const [isOperationLoading, setIsOperationLoading] = useState(false); // For create, update, delete operations

  const initialFormData: Omit<Template, "template_id"> = {
    template_name: "",
    encounter_type: "",
    default_reason: "",
    default_notes: "",
    default_diagnosis_codes: "",
    default_procedure_codes: "",
  };

  const [formData, setFormData] =
    useState<Omit<Template, "template_id">>(initialFormData);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchTemplates = async () => {
    setIsLoadingTemplates(true); // Start loading for template data
    try {
      const res = await getTemplateApi(token);
      console.log(res, "template");
      setTemplates(res?.data || []);
    } catch (error) {
      console.error("Failed to fetch templates:", error);
      toast.error("Failed to fetch templates");
    } finally {
      setIsLoadingTemplates(false); // End loading for template data
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOperationLoading(true); // Start loading for submit operation
    try {
      if (isEdit && editId) {
        await updateTemplateApi(editId, formData, token);
      } else {
        await createTemplateApi(formData, token);
      }

      setFormData(initialFormData);
      setOpen(false);
      setIsEdit(false);
      setEditId(null);
      fetchTemplates(); // Re-fetch templates after successful operation
    } catch (error) {
      console.error("Failed to save template:", error);
      toast.error("Failed to save template");
    } finally {
      setIsOperationLoading(false); // End loading for submit operation
    }
  };

  const handleEdit = (template: Template) => {
    const { template_id, ...rest } = template;
    setFormData(rest);
    setIsEdit(true);
    setEditId(template_id || null);
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    setIsOperationLoading(true); // Start loading for delete operation
    try {
      await deleteTemplate(id, token);
      fetchTemplates(); // Re-fetch templates after successful deletion
    } catch (error) {
      console.error("Failed to delete template:", error);
      toast.error("Failed to delete template");
    } finally {
      setIsOperationLoading(false); // End loading for delete operation
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return (
    <div className="w-full p-4">
      <div className="flex justify-end mb-4">
        <Button
          className="bg-blue-600 text-white"
          onClick={() => {
            setOpen(true);
            setIsEdit(false);
            setEditId(null);
            setFormData(initialFormData);
          }}
          disabled={isOperationLoading} // Disable if any operation is ongoing
        >
          {isOperationLoading ? "Loading..." : "Add Template"}
        </Button>
      </div>

      <div className="overflow-x-auto">
        {isLoadingTemplates ? ( // Display loading message while fetching templates
          <div className="text-center py-4">Loading templates...</div>
        ) : (
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">Encounter Type</th>
                <th className="border px-2 py-1">Reason</th>
                <th className="border px-2 py-1">Notes</th>
                <th className="border px-2 py-1">Diagnosis</th>
                <th className="border px-2 py-1">Procedure</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.length === 0 && (
                <tr>
                  <td colSpan={7} className="border px-2 py-1 text-center">
                    No templates found.
                  </td>
                </tr>
              )}
              {templates.map((t) => (
                <tr key={t.template_id}>
                  <td className="border px-2 py-1">{t.template_name}</td>
                  <td className="border px-2 py-1">{t.encounter_type}</td>
                  <td className="border px-2 py-1">{t.default_reason}</td>
                  <td className="border px-2 py-1">{t.default_notes}</td>
                  <td className="border px-2 py-1">
                    {t.default_diagnosis_codes}
                  </td>
                  <td className="border px-2 py-1">
                    {t.default_procedure_codes}
                  </td>
                  <td className="border px-2 py-1 space-x-2">
                    <Button
                      className="bg-yellow-500 text-white px-2 py-1"
                      onClick={() => handleEdit(t)}
                      disabled={isOperationLoading} // Disable button when an operation is ongoing
                    >
                      Edit
                    </Button>
                    <Button
                      className="bg-red-600 text-white px-2 py-1"
                      onClick={() => handleDelete(t.template_id as number)}
                      disabled={isOperationLoading} // Disable button when an operation is ongoing
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setFormData(initialFormData);
            setIsEdit(false);
            setEditId(null);
          }
        }}
      >
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit Template" : "Create Template"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <Input
              name="template_name"
              value={formData.template_name}
              onChange={handleChange}
              placeholder="Template Name"
              disabled={isOperationLoading} // Disable input when an operation is ongoing
            />
            <Input
              name="encounter_type"
              value={formData.encounter_type}
              onChange={handleChange}
              placeholder="Encounter Type"
              disabled={isOperationLoading} // Disable input when an operation is ongoing
            />
            <Input
              name="default_reason"
              value={formData.default_reason}
              onChange={handleChange}
              placeholder="Default Reason"
              disabled={isOperationLoading} // Disable input when an operation is ongoing
            />
            <Input
              name="default_notes"
              value={formData.default_notes}
              onChange={handleChange}
              placeholder="Default Notes"
              disabled={isOperationLoading} // Disable input when an operation is ongoing
            />
            <Input
              name="default_diagnosis_codes"
              value={formData.default_diagnosis_codes}
              onChange={handleChange}
              placeholder="Default Diagnosis Codes"
              disabled={isOperationLoading} // Disable input when an operation is ongoing
            />
            <Input
              name="default_procedure_codes"
              value={formData.default_procedure_codes}
              onChange={handleChange}
              placeholder="Default Procedure Codes"
              disabled={isOperationLoading} // Disable input when an operation is ongoing
            />
            <Button
              type="submit"
              className="w-full bg-blue-600 text-white"
              disabled={isOperationLoading} // Disable button when an operation is ongoing
            >
              {isOperationLoading
                ? isEdit
                  ? "Updating..."
                  : "Creating..."
                : isEdit
                ? "Update Template"
                : "Create Template"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateTemplate;
