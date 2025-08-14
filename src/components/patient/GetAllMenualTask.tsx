import React, { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Play,
  CheckCircle,
  Activity,
  Heart,
  Stethoscope,
} from "lucide-react";
import EditTaskModal from "./EditTaskModal";

const GetAllMenualTask = ({ tasks, fetchTask }) => {
  const [editTask, setEditTask] = useState(null);

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-yellow-500 text-black";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const formatDuration = (duration) => {
    if (isNaN(duration)) return "Invalid duration";
    const totalSeconds = parseInt(duration, 10);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
      return `${minutes} min${minutes > 1 ? "s" : ""} ${seconds} sec${
        seconds !== 1 ? "s" : ""
      }`;
    }
    return `${seconds} sec${seconds !== 1 ? "s" : ""}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-blue-500 text-white";
      case "in_progress":
        return "bg-orange-500 text-white";
      case "completed":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const getProgramIcon = (programType) => {
    switch (programType?.toUpperCase()) {
      case "RPM":
        return Activity;
      case "CCM":
        return Heart;
      case "PCM":
        return Stethoscope;
      default:
        return CheckCircle;
    }
  };

  const getProgramColor = (programType) => {
    switch (programType?.toUpperCase()) {
      case "RPM":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CCM":
        return "bg-green-100 text-green-800 border-green-200";
      case "PCM":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-4 p-4 relative">
      {tasks?.length > 0 ? (
        tasks?.map((task) => {
          const ProgramIcon = getProgramIcon(task.program_type);
          return (
            <div key={task.id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 pr-4">
                  <h3 className="font-semibold flex items-center gap-2 text-lg">
                    {task.program_type && <ProgramIcon className="h-4 w-4" />}
                    {task.task_title}
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    {task.device_triggered && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-orange-50 text-orange-600 border-orange-200"
                      >
                        Device Alert
                      </Badge>
                    )}
                  </h3>
                  <p className="text-gray-600 mt-1 text-sm">
                    {task.task_description}
                  </p>
                  {task.program_type && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getProgramColor(task.program_type)}>
                        {task.program_type} Program
                      </Badge>
                      {task.cpt_code && (
                        <Badge variant="outline" className="text-xs">
                          CPT: {task.cpt_code}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <Badge className={getStatusColor(task.status)}>
                  {task.status?.replace("_", " ")}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Est: {formatDuration(Number(task.duration))}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {task?.frequency_type} {task?.frequency}
                  </div>
                </div>

                <div className="absolute top-2 right-2 flex flex-col sm:flex-row gap-3 min-w-0">
                  <Button
                    size="sm"
                    onClick={() => setEditTask(task)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-2 w-4 mr-1" />
                    Edit Task
                  </Button>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-center text-gray-500">
          No manual tasks found for this patient.
        </p>
      )}

      {editTask && (
        <EditTaskModal
          task={editTask}
          fetchTask={fetchTask}
          isOpen={!!editTask}
          onClose={() => setEditTask(null)}
        />
      )}
    </div>
  );
};

export default GetAllMenualTask;
