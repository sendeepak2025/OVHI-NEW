
import { CarePlanTask } from '../types/medicalTypes';

export const carePlanTasksData: CarePlanTask[] = [
  {
    id: 'TASK001',
    task: 'Daily blood pressure measurement',
    frequency: 'Daily, morning and evening',
    status: 'Ongoing',
    assigned: '2025-01-10',
    goal: 'Keep BP under 130/80 mmHg',
    type: 'Monitoring',
    progress: 50
  },
  {
    id: 'TASK002',
    task: 'Follow DASH diet plan',
    frequency: 'Daily',
    status: 'Ongoing',
    assigned: '2025-01-10',
    goal: 'Reduce sodium intake, increase potassium',
    type: 'Lifestyle',
    progress: 40
  },
  {
    id: 'TASK003',
    task: 'Exercise - 30 minutes walking',
    frequency: '5 times per week',
    status: 'Ongoing',
    assigned: '2025-01-10',
    goal: 'Improve cardiovascular health',
    type: 'Exercise',
    progress: 70
  },
  {
    id: 'TASK004',
    task: 'Schedule follow-up lab work',
    frequency: 'One-time',
    status: 'Completed',
    assigned: '2025-02-01',
    completed: '2025-02-10',
    goal: 'Monitor lipid panel',
    type: 'Testing',
    progress: 100,
    completedDate: '2025-02-10'
  },
  {
    id: 'TASK005',
    task: 'Medication review with pharmacist',
    frequency: 'One-time',
    status: 'Pending',
    assigned: '2025-03-01',
    due: '2025-03-31',
    goal: 'Ensure medication effectiveness and avoid interactions',
    type: 'Consultation',
    progress: 0
  }
];
