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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Feather } from "lucide-react";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { addPatinetAllergiesAPI } from "@/services/operations/patient";
import { useParams } from "react-router-dom";

const allergySchema = z.object({
  allergen: z.string().min(1, "Allergy Name is required."),
  reaction: z.string().min(1, "Reaction is required."),
  category: z.enum(["Mild", "Moderate", "Severe", "Life-threatening"], {
    errorMap: () => ({ message: "Please select an allergy category." }),
  }),
});

type AllergyFormValues = z.infer<typeof allergySchema>;

interface AddAllergiesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fetchPatient: () => void;
}

const AddAllergiesDialog: React.FC<AddAllergiesDialogProps> = ({
  open,
  onOpenChange,
  fetchPatient,
}) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const { id } = useParams();

  const form = useForm<AllergyFormValues>({
    resolver: zodResolver(allergySchema),
    defaultValues: {
      allergen: "",
      reaction: "",
      category: "Mild",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, form]);

  const onSubmit = async (data: AllergyFormValues) => {
    try {
      await addPatinetAllergiesAPI(data, token, id);

      toast.success("Allergy added successfully!");
      fetchPatient();
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding allergy:", error);
      toast.error("Failed to add allergy. Please try again.");
    }
  };

  const stackedShowError = (text: string) => {
    const container = document.getElementById("custom-toast-container");
    if (!container) return;

    const toastElement = document.createElement("div");

    toastElement.innerHTML = `
      <div style="
        background: #fee2e2;
        color: #991b1b;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        font-size: 14px;
        font-weight: 500;
        min-width: 200px;
        max-width: 300px;
        animation: slideIn 0.3s ease;
      ">
        ❌ ${text}
      </div>
    `;

    container.appendChild(toastElement);

    setTimeout(() => {
      toastElement.remove();
    }, 3000);
  };

  const onError = (errors: any) => {
    Object.values(errors).forEach((error: any) => {
      if (error?.message) {
        stackedShowError(error.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Feather className="h-5 w-5 text-blue-600" />
            Add New Allergy
          </DialogTitle>
          <DialogDescription>
            Enter allergy details to create a new record.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
              <FormField
                control={form.control}
                name="allergen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allergy Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Allergy Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reaction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reaction</FormLabel>
                    <FormControl>
                      <Input placeholder="Reaction" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category" // Changed name to category
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>{" "}
                    {/* Changed label to Category */}
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />{" "}
                          {/* Changed placeholder */}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Mild">Mild</SelectItem>
                        <SelectItem value="Moderate">Moderate</SelectItem>
                        <SelectItem value="Severe">Severe</SelectItem>
                        <SelectItem value="Life-threatening">
                          Life-threatening
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Add Allergy
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAllergiesDialog;
