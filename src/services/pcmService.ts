
import { ccmService, CareCoordinationActivity, CCMTimeEntry } from './ccmService';

export interface PCMCareActivity extends Omit<CareCoordinationActivity, 'type'> {
  type: 'comprehensive_assessment' | 'care_plan_development' | 'medication_reconciliation' | 
        'patient_education' | 'care_transitions' | 'health_monitoring' | 'provider_communication';
  condition: string; // The primary condition being managed
  conditionSpecific: boolean; // Whether this activity is specific to the primary condition
}

export interface PCMPatient {
  id: string;
  name: string;
  primaryCondition: string;
  riskLevel: 'low' | 'medium' | 'high';
  enrollmentDate: Date;
  lastContact: Date;
  careManager: string;
  status: 'active' | 'inactive' | 'completed';
}

class PCMService {
  private pcmActivities = new Map<string, PCMCareActivity[]>();
  private pcmPatients = new Map<string, PCMPatient>();

  // PCM-specific care activity creation
  createPCMCareActivity(params: {
    patientId: string;
    type: PCMCareActivity['type'];
    condition: string;
    status: PCMCareActivity['status'];
    priority: PCMCareActivity['priority'];
    dueDate: Date;
    assignedTo: string;
    assignedBy: string;
    notes: string;
    timeTrackingMode?: 'automated' | 'manual';
  }): string {
    const activityId = `pcm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const activity: PCMCareActivity = {
      id: activityId,
      patientId: params.patientId,
      type: params.type,
      condition: params.condition,
      conditionSpecific: true,
      status: params.status,
      priority: params.priority,
      dueDate: params.dueDate,
      assignedTo: params.assignedTo,
      assignedBy: params.assignedBy,
      notes: params.notes,
      timeTrackingMode: params.timeTrackingMode || 'automated',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const patientActivities = this.pcmActivities.get(params.patientId) || [];
    patientActivities.push(activity);
    this.pcmActivities.set(params.patientId, patientActivities);

    return activityId;
  }

  // Get PCM activities for a patient
  getPCMActivities(patientId: string): PCMCareActivity[] {
    return this.pcmActivities.get(patientId) || [];
  }

  // Update PCM activity
  updatePCMActivity(patientId: string, activityId: string, updates: Partial<PCMCareActivity>): void {
    const activities = this.pcmActivities.get(patientId) || [];
    const activityIndex = activities.findIndex(a => a.id === activityId);
    
    if (activityIndex !== -1) {
      activities[activityIndex] = {
        ...activities[activityIndex],
        ...updates,
        updatedAt: new Date()
      };
      this.pcmActivities.set(patientId, activities);
    }
  }

  // Get condition-specific activity templates
  getConditionSpecificActivities(condition: string): Partial<PCMCareActivity>[] {
    const templates: Record<string, Partial<PCMCareActivity>[]> = {
      'diabetes': [
        {
          type: 'comprehensive_assessment',
          notes: 'Complete diabetes assessment including HbA1c, foot exam, and eye screening',
          priority: 'high'
        },
        {
          type: 'medication_reconciliation',
          notes: 'Review diabetes medications, insulin regimen, and adherence',
          priority: 'high'
        },
        {
          type: 'patient_education',
          notes: 'Diabetes self-management education and glucose monitoring training',
          priority: 'medium'
        }
      ],
      'hypertension': [
        {
          type: 'comprehensive_assessment',
          notes: 'Blood pressure monitoring and cardiovascular risk assessment',
          priority: 'high'
        },
        {
          type: 'medication_reconciliation',
          notes: 'Review antihypertensive medications and dosing',
          priority: 'high'
        },
        {
          type: 'health_monitoring',
          notes: 'Home blood pressure monitoring setup and training',
          priority: 'medium'
        }
      ],
      'heart_failure': [
        {
          type: 'comprehensive_assessment',
          notes: 'Heart failure symptom assessment and functional capacity evaluation',
          priority: 'high'
        },
        {
          type: 'patient_education',
          notes: 'Heart failure self-care education including daily weights and symptom monitoring',
          priority: 'high'
        },
        {
          type: 'care_transitions',
          notes: 'Coordinate with cardiology and manage transitions of care',
          priority: 'medium'
        }
      ]
    };

    return templates[condition.toLowerCase()] || [];
  }

  // Delegate time tracking to CCM service
  startTimeTracking(patientId: string, providerId: string, description: string): string {
    return ccmService.startTimeTracking(patientId, providerId, 'care_coordination', description);
  }

  stopTimeTracking(entryId: string): CCMTimeEntry | null {
    return ccmService.stopTimeTracking(entryId);
  }

  // Get PCM-specific statistics
  getPCMStats(patientId: string) {
    const activities = this.getPCMActivities(patientId);
    
    return {
      total: activities.length,
      completed: activities.filter(a => a.status === 'completed').length,
      inProgress: activities.filter(a => a.status === 'in_progress').length,
      overdue: activities.filter(a => 
        a.status !== 'completed' && new Date(a.dueDate) < new Date()
      ).length,
      byCondition: activities.reduce((acc, activity) => {
        acc[activity.condition] = (acc[activity.condition] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

export const pcmService = new PCMService();
