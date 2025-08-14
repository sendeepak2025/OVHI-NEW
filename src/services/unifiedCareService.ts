import { toast } from 'sonner';
import { taskService, AutomatedTask, TaskTemplate } from './taskService';
import { ccmService } from './ccmService';
import { pcmService } from './pcmService';
import { rpmService } from './rpmService';

export interface UnifiedCareProgram {
  id: string;
  name: string;
  combination: string; // e.g., "RPM+CCM", "RPM+PCM", "CCM", "PCM"
  cptCodes: string[];
  monthlyReimbursement: number;
  requiredMinutes: number;
  enrolled: boolean;
  enrolledDate?: string;
}

export interface UnifiedTask extends AutomatedTask {
  program_type: 'RPM' | 'CCM' | 'PCM';
  billing_category: string;
  cpt_code: string;
  device_triggered?: boolean;
  cross_program_link?: string;
}

export interface DeviceAlert {
  id: string;
  patientId: string;
  deviceType: string;
  alertType: 'critical' | 'warning' | 'info';
  reading: any;
  timestamp: string;
  processed: boolean;
}

class UnifiedCareService {
  
  // Get current patient program enrollment
  getCurrentPrograms(patientId: string): UnifiedCareProgram[] {
    // This would typically fetch from your database
    // For now, returning mock data structure
    return [];
  }

  // Smart program selection with mutual exclusivity
  getOptimalProgramCombination(
    diagnoses: any[], 
    currentPrograms: string[] = []
  ): string | null {
    const chronicConditions = [
      "diabetes", "hypertension", "heart disease", "copd", 
      "asthma", "chronic kidney disease", "heart failure", "coronary artery disease"
    ];
    
    const rpmConditions = [
      "hypertension", "diabetes", "heart failure", "chronic kidney disease"
    ];

    const patientConditions = diagnoses.map(d => d.diagnosis?.toLowerCase() || '');
    
    const hasChronicConditions = chronicConditions.some(condition =>
      patientConditions.some(pc => pc.includes(condition))
    );
    
    const hasRpmConditions = rpmConditions.some(condition =>
      patientConditions.some(pc => pc.includes(condition))
    );

    // Mutual exclusivity logic
    if (hasRpmConditions && diagnoses.length >= 2 && hasChronicConditions) {
      return "RPM+CCM"; // Best for multiple chronic conditions with monitoring
    }
    
    if (hasRpmConditions && diagnoses.length === 1 && hasChronicConditions) {
      return "RPM+PCM"; // Best for single high-risk condition with monitoring
    }
    
    if (diagnoses.length >= 2 && hasChronicConditions) {
      return "CCM"; // Multiple chronic conditions, no monitoring
    }
    
    if (diagnoses.length >= 1 && hasChronicConditions) {
      return "PCM"; // Single chronic condition, intensive management
    }

    return null;
  }

  // Generate unified tasks based on program enrollment
  generateUnifiedTasks(
    patientId: string, 
    enrolledPrograms: string[], 
    patientConditions: string[]
  ): UnifiedTask[] {
    const tasks: UnifiedTask[] = [];
    const currentDate = new Date();

    // Extract individual programs from combinations
    const programs = new Set<string>();
    enrolledPrograms.forEach(combo => {
      if (combo.includes('+')) {
        combo.split('+').forEach(p => programs.add(p.trim()));
      } else {
        programs.add(combo);
      }
    });

    // Generate RPM tasks
    if (programs.has('RPM')) {
      tasks.push(...this.generateRPMTasks(patientId, patientConditions));
    }

    // Generate CCM tasks
    if (programs.has('CCM')) {
      tasks.push(...this.generateCCMTasks(patientId, patientConditions));
    }

    // Generate PCM tasks
    if (programs.has('PCM')) {
      tasks.push(...this.generatePCMTasks(patientId, patientConditions));
    }

    // Add cross-program orchestration
    if (programs.has('RPM') && (programs.has('CCM') || programs.has('PCM'))) {
      tasks.push(...this.generateCrossProgramTasks(patientId, Array.from(programs)));
    }

    return tasks;
  }

  private generateRPMTasks(patientId: string, conditions: string[]): UnifiedTask[] {
    const rpmTasks: UnifiedTask[] = [
      {
        id: `rpm_setup_${Date.now()}`,
        task_title: 'RPM Device Setup and Training',
        task_description: 'Set up monitoring devices and train patient on proper usage',
        priority: 'high',
        status: 'pending',
        tasks_category_name: 'device_setup',
        task_type: 'setup',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        frequency: 'monthly',
        condition_based: false,
        auto_generated: true,
        program_type: 'RPM',
        billing_category: 'setup',
        cpt_code: '99453',
        device_triggered: false
      },
      {
        id: `rpm_review_${Date.now()}`,
        task_title: 'Monthly RPM Data Review',
        task_description: 'Review 16+ days of patient device readings and assess trends',
        priority: 'high',
        status: 'pending',
        tasks_category_name: 'monitoring',
        task_type: 'review',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        frequency: 'monthly',
        condition_based: false,
        auto_generated: true,
        program_type: 'RPM',
        billing_category: 'monitoring',
        cpt_code: '99454',
        device_triggered: false
      }
    ];

    return rpmTasks;
  }

  private generateCCMTasks(patientId: string, conditions: string[]): UnifiedTask[] {
    const ccmTasks: UnifiedTask[] = [
      {
        id: `ccm_care_plan_${Date.now()}`,
        task_title: 'Monthly CCM Care Plan Review',
        task_description: 'Review and update comprehensive care plan (20+ minutes required)',
        priority: 'high',
        status: 'pending',
        tasks_category_name: 'care_coordination',
        task_type: 'care_plan',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        frequency: 'monthly',
        condition_based: false,
        auto_generated: true,
        program_type: 'CCM',
        billing_category: 'care_coordination',
        cpt_code: '99490',
        device_triggered: false
      },
      {
        id: `ccm_medication_${Date.now()}`,
        task_title: 'CCM Medication Reconciliation',
        task_description: 'Complete medication review and reconciliation for chronic conditions',
        priority: 'medium',
        status: 'pending',
        tasks_category_name: 'medication_management',
        task_type: 'medication_review',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        frequency: 'monthly',
        condition_based: false,
        auto_generated: true,
        program_type: 'CCM',
        billing_category: 'medication_management',
        cpt_code: '99490',
        device_triggered: false
      }
    ];

    return ccmTasks;
  }

  private generatePCMTasks(patientId: string, conditions: string[]): UnifiedTask[] {
    const pcmTasks: UnifiedTask[] = [
      {
        id: `pcm_assessment_${Date.now()}`,
        task_title: 'Monthly PCM Comprehensive Assessment',
        task_description: 'Intensive assessment and management of primary chronic condition (30+ minutes)',
        priority: 'high',
        status: 'pending',
        tasks_category_name: 'clinical_assessment',
        task_type: 'assessment',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        frequency: 'monthly',
        condition_based: false,
        auto_generated: true,
        program_type: 'PCM',
        billing_category: 'clinical_assessment',
        cpt_code: '99424',
        device_triggered: false
      },
      {
        id: `pcm_intervention_${Date.now()}`,
        task_title: 'PCM Targeted Intervention',
        task_description: 'Implement targeted interventions for high-risk chronic condition management',
        priority: 'high',
        status: 'pending',
        tasks_category_name: 'intervention',
        task_type: 'intervention',
        due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        frequency: 'monthly',
        condition_based: false,
        auto_generated: true,
        program_type: 'PCM',
        billing_category: 'intervention',
        cpt_code: '99424',
        device_triggered: false
      }
    ];

    return pcmTasks;
  }

  private generateCrossProgramTasks(patientId: string, programs: string[]): UnifiedTask[] {
    const crossTasks: UnifiedTask[] = [];

    if (programs.includes('RPM') && programs.includes('CCM')) {
      crossTasks.push({
        id: `cross_rpm_ccm_${Date.now()}`,
        task_title: 'RPM Data Integration with CCM Care Plan',
        task_description: 'Integrate RPM device readings into CCM care coordination activities',
        priority: 'medium',
        status: 'pending',
        tasks_category_name: 'cross_program',
        task_type: 'integration',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        frequency: 'monthly',
        condition_based: false,
        auto_generated: true,
        program_type: 'CCM',
        billing_category: 'care_coordination',
        cpt_code: '99490',
        device_triggered: false,
        cross_program_link: 'RPM'
      });
    }

    if (programs.includes('RPM') && programs.includes('PCM')) {
      crossTasks.push({
        id: `cross_rpm_pcm_${Date.now()}`,
        task_title: 'RPM Alert Response for PCM',
        task_description: 'Respond to RPM alerts with PCM intensive interventions',
        priority: 'high',
        status: 'pending',
        tasks_category_name: 'cross_program',
        task_type: 'alert_response',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        frequency: 'monthly',
        condition_based: false,
        auto_generated: true,
        program_type: 'PCM',
        billing_category: 'intervention',
        cpt_code: '99424',
        device_triggered: false,
        cross_program_link: 'RPM'
      });
    }

    return crossTasks;
  }

  // Process device alerts and trigger appropriate tasks
  processDeviceAlert(alert: DeviceAlert, enrolledPrograms: string[]): UnifiedTask[] {
    const triggeredTasks: UnifiedTask[] = [];
    const programs = new Set<string>();
    
    enrolledPrograms.forEach(combo => {
      if (combo.includes('+')) {
        combo.split('+').forEach(p => programs.add(p.trim()));
      } else {
        programs.add(combo);
      }
    });

    // High priority alert triggers immediate response
    if (alert.alertType === 'critical') {
      if (programs.has('CCM')) {
        triggeredTasks.push({
          id: `alert_ccm_${alert.id}`,
          task_title: 'URGENT: CCM Response to Critical Alert',
          task_description: `Critical ${alert.deviceType} alert requires immediate care coordination`,
          priority: 'urgent',
          status: 'pending',
          tasks_category_name: 'emergency_response',
          task_type: 'urgent_response',
          due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          frequency: 'monthly',
          condition_based: false,
          auto_generated: true,
          program_type: 'CCM',
          billing_category: 'care_coordination',
          cpt_code: '99490',
          device_triggered: true,
          cross_program_link: 'RPM'
        });
      }

      if (programs.has('PCM')) {
        triggeredTasks.push({
          id: `alert_pcm_${alert.id}`,
          task_title: 'URGENT: PCM Intervention for Critical Alert',
          task_description: `Critical ${alert.deviceType} alert requires immediate PCM intervention`,
          priority: 'urgent',
          status: 'pending',
          tasks_category_name: 'emergency_intervention',
          task_type: 'urgent_intervention',
          due_date: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString().split('T')[0],
          frequency: 'monthly',
          condition_based: false,
          auto_generated: true,
          program_type: 'PCM',
          billing_category: 'intervention',
          cpt_code: '99424',
          device_triggered: true,
          cross_program_link: 'RPM'
        });
      }
    }

    return triggeredTasks;
  }

  // Get billing allocation for time tracking
  getBillingAllocation(task: UnifiedTask): {
    service: 'RPM' | 'CCM' | 'PCM';
    cptCode: string;
    category: string;
  } {
    return {
      service: task.program_type,
      cptCode: task.cpt_code,
      category: task.billing_category
    };
  }

  // Calculate monthly compliance and billing potential
  calculateMonthlyMetrics(patientId: string, tasks: UnifiedTask[]): {
    rpmCompliance: number;
    ccmMinutes: number;
    pcmMinutes: number;
    billingPotential: number;
    complianceStatus: string;
  } {
    const rpmTasks = tasks.filter(t => t.program_type === 'RPM');
    const ccmTasks = tasks.filter(t => t.program_type === 'CCM');
    const pcmTasks = tasks.filter(t => t.program_type === 'PCM');

    const rpmCompleted = rpmTasks.filter(t => t.status === 'completed');
    const rpmCompliance = rpmTasks.length > 0 ? (rpmCompleted.length / rpmTasks.length) * 100 : 0;

    // Estimate minutes based on task completion (would be actual tracked time)
    const ccmMinutes = ccmTasks.filter(t => t.status === 'completed').length * 10; // avg 10 min per task
    const pcmMinutes = pcmTasks.filter(t => t.status === 'completed').length * 15; // avg 15 min per task

    let billingPotential = 0;
    if (rpmCompliance >= 75) billingPotential += 90; // RPM billing
    if (ccmMinutes >= 20) billingPotential += 42; // CCM billing
    if (pcmMinutes >= 30) billingPotential += 65; // PCM billing

    const complianceStatus = 
      rpmCompliance >= 75 && ccmMinutes >= 20 ? 'Excellent' :
      rpmCompliance >= 50 || ccmMinutes >= 10 ? 'Good' : 'Needs Improvement';

    return {
      rpmCompliance,
      ccmMinutes,
      pcmMinutes,
      billingPotential,
      complianceStatus
    };
  }

  // Link task completion to appropriate service time tracking
  linkTaskToBilling(task: UnifiedTask, timeSpent: number, providerId: string): void {
    const billing = this.getBillingAllocation(task);
    
    switch (billing.service) {
      case 'RPM':
        // Link to RPM service time tracking - method may not exist yet
        // rpmService.trackDeviceReviewTime?.(task.id.split('_')[1], providerId, timeSpent);
        break;
      case 'CCM':
        // Link to CCM service time tracking
        ccmService.startTimeTracking(task.id.split('_')[1], providerId, 'care_coordination', task.task_description);
        break;
      case 'PCM':
        // Link to PCM service time tracking - method may not exist yet
        // pcmService.trackAssessmentTime?.(task.id.split('_')[1], providerId, timeSpent);
        break;
    }

    toast.success(`Task linked to ${billing.service} billing (${billing.cptCode})`);
  }
}

export const unifiedCareService = new UnifiedCareService();