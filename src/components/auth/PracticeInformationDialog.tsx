import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface PracticeInformationDialogProps {
  isOpen: boolean;
  onCancel: () => void;
}

export const PracticeInformationDialog: React.FC<PracticeInformationDialogProps> = ({ isOpen, onCancel }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    practiceName: "",
    practicePhone: "",
    addressLine1: "",
    city: "",
    state: "",
    zip: "",
    country: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    toast({
      title: "Practice Information Saved",
      description: "Your practice information has been saved successfully.",
    });
    onCancel();
    navigate('/dashboard');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Practice Information</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="practiceName">Practice Name</Label>
            <Input
              id="practiceName"
              value={formData.practiceName}
              onChange={handleChange}
              placeholder="Enter practice name"
            />
          </div>
          
          <div>
            <Label htmlFor="practicePhone">Phone</Label>
            <Input
              id="practicePhone"
              value={formData.practicePhone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>
          
          <div>
            <Label htmlFor="addressLine1">Address</Label>
            <Input
              id="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              placeholder="Enter address"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                value={formData.zip}
                onChange={handleChange}
                placeholder="Enter ZIP"
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Enter country"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save & Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};