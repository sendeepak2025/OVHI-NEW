
import { toast } from 'sonner';
import { ccmService } from './ccmService';

export interface AutomatedTask {
  id: string;
  task_title: string;
  task_description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  tasks_category_name: string;
  task_type: string;
  due_date: string;
  frequency: 'monthly' | 'quarterly' | 'annually';
  condition_based: boolean;
  required_conditions?: string[];
  auto_generated: boolean;
}

export interface TaskTemplate {
  title: string;
  description: string;
  category: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  daysFromNow: number;
  conditions: string[];
  frequency: 'monthly' | 'quarterly' | 'annually';
}

// Task templates based on patient conditions
export const CONDITION_BASED_TASKS: Record<string, TaskTemplate[]> = {
  'diabetes': [
    {
      title: 'Quarterly HbA1c Lab Review',
      description: 'Review HbA1c results and adjust treatment plan if necessary. Target <7% for most patients.',
      category: 'laboratory',
      type: 'assessment',
      priority: 'high',
      daysFromNow: 90,
      conditions: ['diabetes', 'type_2_diabetes', 'type_1_diabetes'],
      frequency: 'quarterly'
    },
    {
      title: 'Monthly Blood Glucose Monitoring Review',
      description: 'Review patient blood glucose logs and assess medication adherence.',
      category: 'monitoring',
      type: 'assessment',
      priority: 'medium',
      daysFromNow: 30,
      conditions: ['diabetes'],
      frequency: 'monthly'
    },
    {
      title: 'Annual Diabetic Eye Exam Reminder',
      description: 'Schedule annual comprehensive eye examination for diabetic retinopathy screening.',
      category: 'preventive_care',
      type: 'referral',
      priority: 'medium',
      daysFromNow: 365,
      conditions: ['diabetes'],
      frequency: 'annually'
    }
  ],
  'hypertension': [
    {
      title: 'Monthly Blood Pressure Review',
      description: 'Review home blood pressure readings and assess medication effectiveness. Target <140/90 mmHg.',
      category: 'monitoring',
      type: 'assessment',
      priority: 'high',
      daysFromNow: 30,
      conditions: ['hypertension', 'high_blood_pressure'],
      frequency: 'monthly'
    },
    {
      title: 'Quarterly Medication Review',
      description: 'Review antihypertensive medications for effectiveness and side effects.',
      category: 'medication_management',
      type: 'consultation',
      priority: 'medium',
      daysFromNow: 90,
      conditions: ['hypertension'],
      frequency: 'quarterly'
    }
  ],
  'heart_disease': [
    {
      title: 'Monthly Cardiac Monitoring',
      description: 'Review cardiac symptoms, medication adherence, and activity tolerance.',
      category: 'monitoring',
      type: 'assessment',
      priority: 'high',
      daysFromNow: 30,
      conditions: ['heart_disease', 'coronary_artery_disease', 'heart_failure'],
      frequency: 'monthly'
    },
    {
      title: 'Quarterly Cardiology Follow-up',
      description: 'Schedule follow-up with cardiologist for ongoing cardiac care management.',
      category: 'care_coordination',
      type: 'referral',
      priority: 'high',
      daysFromNow: 90,
      conditions: ['heart_disease'],
      frequency: 'quarterly'
    }
  ],
  'copd': [
    {
      title: 'Monthly Respiratory Assessment',
      description: 'Assess breathing patterns, medication adherence, and inhaler technique.',
      category: 'monitoring',
      type: 'assessment',
      priority: 'high',
      daysFromNow: 30,
      conditions: ['copd', 'chronic_obstructive_pulmonary_disease'],
      frequency: 'monthly'
    },
    {
      title: 'Annual Pulmonary Function Test',
      description: 'Schedule annual pulmonary function testing to monitor disease progression.',
      category: 'laboratory',
      type: 'assessment',
      priority: 'medium',
      daysFromNow: 365,
      conditions: ['copd'],
      frequency: 'annually'
    }
  ],
  'kidney_disease': [
    {
      title: 'Monthly Kidney Function Monitoring',
      description: 'Review creatinine levels, GFR, and proteinuria. Monitor for progression.',
      category: 'laboratory',
      type: 'assessment',
      priority: 'high',
      daysFromNow: 30,
      conditions: ['kidney_disease', 'chronic_kidney_disease'],
      frequency: 'monthly'
    },
    {
      title: 'Quarterly Nephrology Consultation',
      description: 'Follow-up with nephrology for ongoing kidney disease management.',
      category: 'care_coordination',
      type: 'referral',
      priority: 'high',
      daysFromNow: 90,
      conditions: ['kidney_disease'],
      frequency: 'quarterly'
    }
  ]
};

// General CCM mandatory tasks
export const CCM_MANDATORY_TASKS: TaskTemplate[] = [
  {
    title: 'Monthly Care Plan Review',
    description: 'Review and update comprehensive care plan based on patient progress and changing needs.',
    category: 'care_coordination',
    type: 'assessment',
    priority: 'high',
    daysFromNow: 30,
    conditions: [],
    frequency: 'monthly'
  },
  {
    title: 'Monthly Medication Reconciliation',
    description: 'Complete medication reconciliation including review of adherence, side effects, and interactions.',
    category: 'medication_management',
    type: 'consultation',
    priority: 'high',
    daysFromNow: 30,
    conditions: [],
    frequency: 'monthly'
  },
  {
    title: 'Monthly Quality Measures Assessment',
    description: 'Review HEDIS and CMS quality measures for compliance and improvement opportunities.',
    category: 'quality_improvement',
    type: 'assessment',
    priority: 'medium',
    daysFromNow: 30,
    conditions: [],
    frequency: 'monthly'
  },
  {
    title: 'Monthly Care Coordination Activities',
    description: 'Coordinate care with specialists, review referrals, and ensure continuity of care.',
    category: 'care_coordination',
    type: 'coordination',
    priority: 'medium',
    daysFromNow: 30,
    conditions: [],
    frequency: 'monthly'
  }
];

class TaskService {
  // Generate automated tasks based on patient conditions
  generateAutomatedTasks(patientId: string, patientConditions: string[]): AutomatedTask[] {
    const tasks: AutomatedTask[] = [];
    const currentDate = new Date();

    // Add CCM mandatory tasks
    CCM_MANDATORY_TASKS.forEach(template => {
      const dueDate = new Date(currentDate);
      dueDate.setDate(dueDate.getDate() + template.daysFromNow);

      tasks.push({
        id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        task_title: template.title,
        task_description: template.description,
        priority: template.priority,
        status: 'pending',
        tasks_category_name: template.category,
        task_type: template.type,
        due_date: dueDate.toISOString().split('T')[0],
        frequency: template.frequency,
        condition_based: false,
        auto_generated: true
      });
    });

    // Add condition-based tasks
    patientConditions.forEach(condition => {
      const conditionTasks = CONDITION_BASED_TASKS[condition.toLowerCase()];
      if (conditionTasks) {
        conditionTasks.forEach(template => {
          const dueDate = new Date(currentDate);
          dueDate.setDate(dueDate.getDate() + template.daysFromNow);

          tasks.push({
            id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            task_title: template.title,
            task_description: template.description,
            priority: template.priority,
            status: 'pending',
            tasks_category_name: template.category,
            task_type: template.type,
            due_date: dueDate.toISOString().split('T')[0],
            frequency: template.frequency,
            condition_based: true,
            required_conditions: template.conditions,
            auto_generated: true
          });
        });
      }
    });

    return tasks;
  }

  // Check if tasks need to be generated for the current month
  shouldGenerateMonthlyTasks(lastGeneratedDate?: Date): boolean {
    if (!lastGeneratedDate) return true;

    const currentDate = new Date();
    const lastGenerated = new Date(lastGeneratedDate);

    return currentDate.getMonth() !== lastGenerated.getMonth() || 
           currentDate.getFullYear() !== lastGenerated.getFullYear();
  }

  // Get tasks that are due soon
  getUpcomingTasks(tasks: AutomatedTask[], daysAhead: number = 7): AutomatedTask[] {
    const currentDate = new Date();
    const futureDate = new Date(currentDate);
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return tasks.filter(task => {
      const taskDate = new Date(task.due_date);
      return taskDate >= currentDate && taskDate <= futureDate && task.status === 'pending';
    });
  }

  // Get overdue tasks
  getOverdueTasks(tasks: AutomatedTask[]): AutomatedTask[] {
    const currentDate = new Date();
    return tasks.filter(task => {
      const taskDate = new Date(task.due_date);
      return taskDate < currentDate && task.status === 'pending';
    });
  }

  // Link tasks to CCM activities
  linkTaskToCCMActivity(taskId: string, patientId: string, providerId: string): void {
    // Start CCM time tracking when task is started
    const activityType = this.mapTaskToActivityType(taskId);
    const description = `Automated task completion: ${taskId}`;
    
    ccmService.startTimeTracking(patientId, providerId, activityType, description);
    
    toast.success('Task linked to CCM time tracking');
  }

  private mapTaskToActivityType(taskId: string): 'care_coordination' | 'medication_management' | 'remote_monitoring' | 'other' {
    if (taskId.includes('coordination')) return 'care_coordination';
    if (taskId.includes('medication')) return 'medication_management';
    if (taskId.includes('monitor')) return 'remote_monitoring';
    return 'other';
  }

  // Generate task compliance report
  generateTaskComplianceReport(tasks: AutomatedTask[]): {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    upcomingTasks: number;
    complianceRate: number;
  } {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const overdue = this.getOverdueTasks(tasks).length;
    const upcoming = this.getUpcomingTasks(tasks).length;
    const complianceRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      totalTasks: total,
      completedTasks: completed,
      overdueTasks: overdue,
      upcomingTasks: upcoming,
      complianceRate
    };
  }
}

export const taskService = new TaskService();
