import { RootState } from "@/redux/store";
import { getAllTaskApi } from "@/services/operations/task";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { CardDescription, CardTitle } from "../ui/card";

const OfficeLobby = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [tasks, setTasks] = useState([]);

  const fetchAllTask = async () => {
    const response = await getAllTaskApi(token);
    if (response?.success && Array.isArray(response.data)) {
      const filteredTasks = response.data.map((task: any) => ({
        title: task.task_title,
        status: task.status,
        task_description: task.task_description,
        priority: task.priority,
        type: task.type,
      }));
      setTasks(filteredTasks);
    }
  };

  useEffect(() => {
    fetchAllTask();
  }, []);

  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <CardTitle>Patients Tasks</CardTitle>
      </div>

      {/* Scrollable Task Card Area */}
      <div className="max-h-[35vh] overflow-y-auto space-y-3 pr-1">
        {tasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          tasks.map((task, index) => (
            <div
              key={index}
              className="bg-[#f8fcff] p-4 rounded-xl flex justify-between items-start shadow-sm"
            >
              {/* Left */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {task.title}
                </h2>
                <span className="text-sm text-gray-600">
                  {task.task_description}
                </span>
                <div className="mt-1 text-sm text-gray-500">
                  <span className="mr-2">
                    Priority: <strong>{task.priority}</strong>
                  </span>
                  <span>
                    Type: <strong>{task.type}</strong>
                  </span>
                </div>
              </div>

              {/* Right */}
              <div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    task.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : task.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {task.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OfficeLobby;
