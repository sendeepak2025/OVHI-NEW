import React, { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { FileText, UserPlus, Clock, Save } from "lucide-react";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { addPatinetNotes } from "@/services/operations/patient";

interface AddPatientDialogProps {
  open: boolean;
  type?: string;
  onOpenChange: (open: boolean, updated?: boolean) => void;
}

const formSchema = z.object({
  note: z.string().min(1, "Please enter a note."),
  duration: z
    .string()
    .min(1, "Please enter duration in minutes.")
    .refine((val) => /^\d+$/.test(val), {
      message: "Duration must be a valid number.",
    }),
});

type FormValues = z.infer<typeof formSchema>;

const AddPcmNoteDialog: React.FC<AddPatientDialogProps> = ({
  open,
  onOpenChange,
  type = "pcm",
}) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      note: "",
      duration: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);

      const payload = {
        note: data.note.trim(),
        duration: Number(data.duration),
        type: type.toLowerCase(),
      };

      await addPatinetNotes(payload, token, id);

      toast.success(`Note saved! Duration: ${data.duration} minutes`);

      form.reset();
      onOpenChange(false, true);
    } catch (error) {
      console.error("Error submitting note:", error);
      toast.error("Failed to submit note.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = (errors: any) => {
    console.error("Form errors:", errors);
    toast.error("Please fix the errors in the form.");
  };

  return (
    <Dialog open={open} onOpenChange={(open) => onOpenChange(open, false)}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Add Patient Care Notes
          </DialogTitle>
          <DialogDescription>
            Enter patient care notes and manually input the time duration.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="space-y-6"
          >
            <Tabs defaultValue="notes" className="w-full">
              <TabsContent value="notes" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-medium">Care Documentation</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <Badge variant="outline" className="text-blue-600">
                      Manual Duration Entry
                    </Badge>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                  {/* Note Input */}
                  <div>
                    <Textarea
                      placeholder="Enter care note..."
                      {...form.register("note")}
                      className="min-h-[100px]"
                      rows={4}
                    />
                    {form.formState.errors.note && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.note.message}
                      </p>
                    )}
                  </div>

                  {/* Duration Input */}
                  <div>
                    <input
                      type="number"
                      min="1"
                      placeholder="Enter your total time in minutes"
                      {...form.register("duration")}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                    {form.formState.errors.duration && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.duration.message}
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
                onClick={() => onOpenChange(false, false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save {type?.toUpperCase()} Note
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPcmNoteDialog;
