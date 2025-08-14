import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { editTask } from "@/services/operations/task";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Repeat } from "lucide-react";
import { Textarea } from "../ui/textarea";

const EditTaskModal = ({ task, fetchTask, isOpen, onClose }) => {
  const [formData, setFormData] = useState({ ...task });
  const { token } = useSelector((state: RootState) => state.auth);
  const { id } = useParams();

  useEffect(() => {
    if (task) {
      setFormData({ ...task });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    const dataToSend = {
      taskId: task.id,
      title: formData.task_title,
      type: formData.type || "basic",
      description: formData.task_description,
      priority: formData.priority,
      dueDate: formData.due_date,
      duration: Number(formData.duration),
      frequency: formData.frequency,
      frequencyType: formData.frequency_type,
      status: formData.status,
    };

    await editTask(task.id, dataToSend, id, token);
    fetchTask();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label>Title</Label>
            <Input
              name="task_title"
              value={formData.task_title || ""}
              onChange={handleChange}
            />
          </div>

         <div>
  <Label htmlFor="task_description">Description</Label>
  <Textarea
    id="task_description"
    name="task_description"
    value={formData.task_description || ""}
    onChange={handleChange}
    rows={4}
  />
</div>

          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Priority</Label>
              <Select
                value={formData.priority || ""}
                onValueChange={(value) => handleSelectChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Label>Status</Label>
              <Select
                value={formData.status || ""}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Due Date</Label>
            <Input
              type="date"
              name="due_date"
              value={formData.due_date?.split("T")[0] || ""}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <Label className="flex items-center gap-1">
                <Repeat className="h-4 w-4" /> Frequency Type
              </Label>
              <Select
                value={formData.frequency_type || ""}
                onValueChange={(value) =>
                  handleSelectChange("frequency_type", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Label>Frequency</Label>
              <Input
                type="number"
                name="frequency"
                value={formData.frequency || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* ✅ Duration Field */}
          <div>
            <Label>Duration (in minutes)</Label>
            <Input
              type="number"
              name="duration"
              placeholder="Enter your time in minutes"
              value={formData.duration || ""}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmit}>Update Task</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskModal;
