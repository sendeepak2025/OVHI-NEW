import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, Clock, Timer } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface TimeEntry {
  id: string;
  task_id: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  activity_type: string;
}

interface TaskTimerWidgetProps {
  taskId: string;
  patientId: string;
  providerId: string;
  activityType?: string;
  onTimeUpdate?: (duration: number) => void;
}

const TaskTimerWidget: React.FC<TaskTimerWidgetProps> = ({
  taskId,
  patientId,
  providerId,
  activityType = 'task_execution',
  onTimeUpdate
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
        onTimeUpdate?.(elapsed);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, startTime, onTimeUpdate]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = async () => {
    try {
      // API call will be implemented by user
      // const response = await startTaskTimer({
      //   taskId,
      //   patientId,
      //   providerId,
      //   activity_type: activityType
      // });
      // setCurrentEntryId(response.entryId);

      // Mock implementation
      setCurrentEntryId(`entry_${Date.now()}`);
      setStartTime(new Date());
      setIsRunning(true);
      setElapsedTime(0);
      
      toast({
        title: "Timer Started",
        description: "Task timer is now running",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start timer",
        variant: "destructive",
      });
    }
  };

  const stopTimer = async () => {
    if (!currentEntryId) return;

    try {
      // API call will be implemented by user
      // await stopTaskTimer({ entryId: currentEntryId });

      setIsRunning(false);
      setCurrentEntryId(null);
      setStartTime(null);
      
      toast({
        title: "Timer Stopped",
        description: `Task completed in ${formatTime(elapsedTime)}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to stop timer",
        variant: "destructive",
      });
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
    toast({
      title: "Timer Paused",
      description: "Timer paused - click resume to continue",
    });
  };

  const resumeTimer = () => {
    if (startTime) {
      // Adjust start time to account for elapsed time
      const now = new Date();
      const adjustedStart = new Date(now.getTime() - (elapsedTime * 1000));
      setStartTime(adjustedStart);
      setIsRunning(true);
      
      toast({
        title: "Timer Resumed",
        description: "Timer is running again",
      });
    }
  };

  const getTimerStatus = () => {
    if (isRunning) return { label: 'Running', color: 'bg-green-500' };
    if (currentEntryId) return { label: 'Paused', color: 'bg-yellow-500' };
    return { label: 'Stopped', color: 'bg-gray-500' };
  };

  const status = getTimerStatus();

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Task Timer
          </div>
          <Badge variant="outline" className={`text-white ${status.color}`}>
            {status.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-mono font-bold tracking-wider">
            {formatTime(elapsedTime)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {activityType.replace('_', ' ').toUpperCase()}
          </p>
        </div>

        <div className="flex gap-2 justify-center">
          {!isRunning && !currentEntryId && (
            <Button onClick={startTimer} className="flex-1" size="sm">
              <Play className="h-4 w-4 mr-2" />
              Start
            </Button>
          )}

          {isRunning && (
            <>
              <Button onClick={pauseTimer} variant="outline" size="sm">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button onClick={stopTimer} variant="destructive" size="sm">
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </>
          )}

          {!isRunning && currentEntryId && (
            <>
              <Button onClick={resumeTimer} size="sm">
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
              <Button onClick={stopTimer} variant="destructive" size="sm">
                <Square className="h-4 w-4 mr-2" />
                Finish
              </Button>
            </>
          )}
        </div>

        {startTime && (
          <div className="text-center text-xs text-muted-foreground">
            Started at {startTime.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskTimerWidget;