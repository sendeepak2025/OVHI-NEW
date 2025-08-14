import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Mic, 
  MicOff,
  Target,
  Timer,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  timeRequired: number;
  priority: 'high' | 'medium' | 'low';
  category: string;
  aiSuggested?: boolean;
  completedAt?: Date;
}

interface DynamicChecklistManagerProps {
  sessionPlan: any;
  isRecording: boolean;
  transcription: string;
  onItemComplete: (itemId: string) => void;
  onAddCustomItem: (item: string) => void;
}

const DynamicChecklistManager: React.FC<DynamicChecklistManagerProps> = ({
  sessionPlan,
  isRecording,
  transcription,
  onItemComplete,
  onAddCustomItem
}) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [newItem, setNewItem] = useState('');
  const [voiceMode, setVoiceMode] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Initialize checklist from session plan
  useEffect(() => {
    if (sessionPlan) {
      const initialChecklist: ChecklistItem[] = [
        // Focus areas
        ...sessionPlan.focusAreas.map((area: string, index: number) => ({
          id: `focus-${index}`,
          text: area,
          completed: false,
          timeRequired: 5,
          priority: 'high' as const,
          category: 'Focus Area'
        })),
        // Required exams
        ...sessionPlan.requiredExams.map((exam: string, index: number) => ({
          id: `exam-${index}`,
          text: exam,
          completed: false,
          timeRequired: 3,
          priority: 'high' as const,
          category: 'Physical Exam'
        })),
        // Suggested tests
        ...sessionPlan.suggestedTests.map((test: string, index: number) => ({
          id: `test-${index}`,
          text: test,
          completed: false,
          timeRequired: 2,
          priority: 'medium' as const,
          category: 'Diagnostic Test'
        })),
        // Custom items
        ...sessionPlan.customItems.map((item: string, index: number) => ({
          id: `custom-${index}`,
          text: item,
          completed: false,
          timeRequired: 3,
          priority: 'medium' as const,
          category: 'Custom'
        }))
      ];
      setChecklist(initialChecklist);
    }
  }, [sessionPlan]);

  // Track session time
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // AI-powered transcription analysis
  useEffect(() => {
    if (transcription && isRecording) {
      analyzeTranscription(transcription);
    }
  }, [transcription, isRecording]);

  const analyzeTranscription = (text: string) => {
    const lowerText = text.toLowerCase();
    const suggestions: string[] = [];

    // Auto-complete items based on transcription
    checklist.forEach(item => {
      if (!item.completed && lowerText.includes(item.text.toLowerCase())) {
        handleItemToggle(item.id, true);
        toast.success(`Auto-completed: ${item.text}`);
      }
    });

    // Suggest new items based on conversation
    if (lowerText.includes('blood pressure') && !checklist.some(item => item.text.includes('Blood Pressure'))) {
      suggestions.push('Check Blood Pressure');
    }
    if (lowerText.includes('weight') && !checklist.some(item => item.text.includes('Weight'))) {
      suggestions.push('Measure Weight');
    }
    if (lowerText.includes('medication') && !checklist.some(item => item.text.includes('Medication Review'))) {
      suggestions.push('Medication Review');
    }
    if (lowerText.includes('follow up') && !checklist.some(item => item.text.includes('Schedule Follow-up'))) {
      suggestions.push('Schedule Follow-up');
    }

    if (suggestions.length > 0) {
      setAiSuggestions(prev => [...new Set([...prev, ...suggestions])]);
    }
  };

  const handleItemToggle = (itemId: string, completed: boolean) => {
    setChecklist(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, completed, completedAt: completed ? new Date() : undefined }
        : item
    ));
    
    if (completed) {
      setCompletedCount(prev => prev + 1);
      onItemComplete(itemId);
    } else {
      setCompletedCount(prev => prev - 1);
    }
  };

  const addCustomItem = () => {
    if (newItem.trim()) {
      const newChecklistItem: ChecklistItem = {
        id: `custom-${Date.now()}`,
        text: newItem.trim(),
        completed: false,
        timeRequired: 3,
        priority: 'medium',
        category: 'Custom'
      };
      
      setChecklist(prev => [...prev, newChecklistItem]);
      onAddCustomItem(newItem.trim());
      setNewItem('');
      toast.success('Custom item added to checklist');
    }
  };

  const addAiSuggestion = (suggestion: string) => {
    const newChecklistItem: ChecklistItem = {
      id: `ai-${Date.now()}`,
      text: suggestion,
      completed: false,
      timeRequired: 3,
      priority: 'medium',
      category: 'AI Suggestion',
      aiSuggested: true
    };
    
    setChecklist(prev => [...prev, newChecklistItem]);
    setAiSuggestions(prev => prev.filter(s => s !== suggestion));
    toast.success(`Added AI suggestion: ${suggestion}`);
  };

  const completionPercentage = checklist.length > 0 ? (completedCount / checklist.length) * 100 : 0;
  const estimatedTimeRemaining = checklist
    .filter(item => !item.completed)
    .reduce((total, item) => total + item.timeRequired, 0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const categoryColors = {
    'Focus Area': 'bg-blue-100 text-blue-800',
    'Physical Exam': 'bg-green-100 text-green-800',
    'Diagnostic Test': 'bg-yellow-100 text-yellow-800',
    'Custom': 'bg-purple-100 text-purple-800',
    'AI Suggestion': 'bg-orange-100 text-orange-800'
  };

  const priorityIcons = {
    high: <AlertTriangle className="h-4 w-4 text-red-500" />,
    medium: <Clock className="h-4 w-4 text-yellow-500" />,
    low: <Activity className="h-4 w-4 text-green-500" />
  };

  return (
    <div className="space-y-4">
      {/* Session Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Session Progress
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Timer className="h-4 w-4" />
                {formatTime(sessionTime)}
              </div>
              <Badge variant="outline">
                {completedCount}/{checklist.length} Complete
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress: {Math.round(completionPercentage)}%</span>
              <span>Est. Time Remaining: {estimatedTimeRemaining} min</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              AI Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                  <span className="text-sm">{suggestion}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addAiSuggestion(suggestion)}
                  >
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checklist Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Session Checklist</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setVoiceMode(!voiceMode)}
              >
                {voiceMode ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {checklist.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                item.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
              }`}
            >
              <Checkbox
                checked={item.completed}
                onCheckedChange={(checked) => handleItemToggle(item.id, checked as boolean)}
              />
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {item.text}
                  </span>
                  {priorityIcons[item.priority]}
                  {item.aiSuggested && (
                    <Badge variant="outline" className="text-xs">
                      AI
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className={`text-xs ${categoryColors[item.category as keyof typeof categoryColors]}`}
                  >
                    {item.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ~{item.timeRequired} min
                  </span>
                  {item.completedAt && (
                    <span className="text-xs text-green-600">
                      ✓ {item.completedAt.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>

              {item.completed && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
            </div>
          ))}

          {/* Add Custom Item */}
          <div className="flex gap-2 pt-2 border-t">
            <Input
              placeholder="Add custom item..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomItem()}
            />
            <Button onClick={addCustomItem} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DynamicChecklistManager;