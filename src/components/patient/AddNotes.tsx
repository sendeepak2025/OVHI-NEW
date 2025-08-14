import type React from "react";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { FileText, UserPlus } from "lucide-react";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { addPatinetNotes } from "@/services/operations/patient";
import { useParams } from "react-router-dom";

interface AddPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fetchPatientNotes: () => void;
  patient: any;
}

const serviceTypeMap: { [key: number]: string } = {
  1: "RPM",
  2: "CCM",
  3: "PCM",
};

const noteSchema = z.object({
  note: z.string().min(1, "Note cannot be empty."),
  type: z.string().min(1, "Please select a service"),
  duration: z.string().refine((val) => /^\d+$/.test(val), {
    message: "Duration must be a number",
  }),
});

type NoteFormValues = z.infer<typeof noteSchema>;

const AddNotes: React.FC<AddPatientDialogProps> = ({
  open,
  onOpenChange,
  fetchPatientNotes,
  patient,
}) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const { id } = useParams();

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      note: "",
      type: "",
      duration: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        note: "",
        type: "",
        duration: "",
      });
    }
  }, [open, form]);

  const onSubmit = async (data: NoteFormValues) => {
    try {
      const payload = {
        ...data,
        type: data.type.toLowerCase(), // convert to lowercase before sending
        duration: Number(data.duration), // ensure numeric value
      };
      await addPatinetNotes(payload, token, id);
      form.reset();
      fetchPatientNotes();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Something went wrong while adding the note.");
    }
  };

  const onError = (errors: any) => {
    console.error("Form validation errors:", errors);
    toast.error("Please correct the form errors.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Add New Note
          </DialogTitle>
          <DialogDescription>
            Enter your note below. Only one note can be added at a time.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="space-y-6"
          >
            <Tabs defaultValue="note" className="w-full">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="note">Note</TabsTrigger>
              </TabsList>

              <TabsContent value="note" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-medium">Patient Note</h3>
                </div>

                <div className="grid grid-cols-1 gap-4 p-4 border rounded-lg">
                  {/* Type Dropdown */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Select Service Type
                    </label>
                    <Controller
                      name="type"
                      control={form.control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-3 py-2 mt-1 border rounded-md text-sm"
                        >
                          <option value="">Select a service</option>
                          {patient?.patientService?.length > 0 &&
                            patient.patientService
                              .filter((id: number) => serviceTypeMap[id])
                              .map((id: number) => (
                                <option key={id} value={serviceTypeMap[id]}>
                                  {serviceTypeMap[id]}
                                </option>
                              ))}
                        </select>
                      )}
                    />
                    {form.formState.errors.type && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.type.message}
                      </p>
                    )}
                  </div>

                  {/* Duration Input */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Duration (in minutes)
                    </label>
                    <Controller
                      name="duration"
                      control={form.control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          placeholder="Enter your total time in minutes"
                          className="w-full px-3 py-2 mt-1 border rounded-md text-sm"
                        />
                      )}
                    />
                    {form.formState.errors.duration && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.duration.message}
                      </p>
                    )}
                  </div>

                  {/* Note Textarea */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Note
                    </label>
                    <Controller
                      name="note"
                      control={form.control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Enter your note here..."
                          className="w-full"
                          rows={4}
                        />
                      )}
                    />
                    {form.formState.errors.note && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.note.message}
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Add Note
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNotes;
