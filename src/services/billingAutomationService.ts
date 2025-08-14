import { 
  createCCMBilling, 
  BillingDetails, 
  commonCPTCodes,
  ProcedureCode,
  Diagnosis 
} from '@/utils/billingUtils';
import { ccmService, CCMTimeEntry } from './ccmService';
import { rpmService, RPMTimeEntry } from './rpmService';
import { pcmService } from './pcmService';
import { toast } from 'sonner';

export interface BillingRule {
  id: string;
  serviceType: 'CCM' | 'RPM' | 'PCM';
  minimumMinutes: number;
  timeWindow: 'daily' | 'weekly' | 'monthly';
  autoGenerate: boolean;
  requireApproval: boolean;
  cptCodes: string[];
}

export interface BillingTrigger {
  id: string;
  patientId: string;
  serviceType: 'CCM' | 'RPM' | 'PCM';
  totalMinutes: number;
  threshold: number;
  triggered: boolean;
  triggeredAt: Date;
  billGenerated: boolean;
  billId?: string;
}

export interface BillingMonitor {
  patientId: string;
  serviceType: 'CCM' | 'RPM' | 'PCM';
  currentMonthMinutes: number;
  lastUpdated: Date;
  complianceStatus: 'compliant' | 'non-compliant' | 'at-risk';
  nextBillingDate: Date;
}

class BillingAutomationService {
  private billingRules = new Map<string, BillingRule[]>();
  private billingTriggers = new Map<string, BillingTrigger[]>();
  private billingMonitors = new Map<string, BillingMonitor[]>();
  private generatedBills = new Map<string, BillingDetails[]>();
  private isProcessing = false;

  constructor() {
    this.initializeDefaultRules();
    this.startPeriodicProcessing();
  }

  private initializeDefaultRules(): void {
    const defaultRules: BillingRule[] = [
      {
        id: 'ccm-20min',
        serviceType: 'CCM',
        minimumMinutes: 20,
        timeWindow: 'monthly',
        autoGenerate: true,
        requireApproval: false,
        cptCodes: ['99490', '99491']
      },
      {
        id: 'ccm-complex-60min',
        serviceType: 'CCM',
        minimumMinutes: 60,
        timeWindow: 'monthly',
        autoGenerate: true,
        requireApproval: false,
        cptCodes: ['99487', '99489']
      },
      {
        id: 'rpm-setup',
        serviceType: 'RPM',
        minimumMinutes: 15,
        timeWindow: 'monthly',
        autoGenerate: true,
        requireApproval: false,
        cptCodes: ['99453', '99454']
      },
      {
        id: 'rpm-monitoring',
        serviceType: 'RPM',
        minimumMinutes: 20,
        timeWindow: 'monthly',
        autoGenerate: true,
        requireApproval: false,
        cptCodes: ['99457', '99458']
      },
      {
        id: 'pcm-30min',
        serviceType: 'PCM',
        minimumMinutes: 30,
        timeWindow: 'monthly',
        autoGenerate: true,
        requireApproval: false,
        cptCodes: ['99424', '99425']
      }
    ];

    // Set default rules for all service types
    this.billingRules.set('default', defaultRules);
  }

  // Monitor time tracking and create triggers
  public monitorTimeTracking(patientId: string, serviceType: 'CCM' | 'RPM' | 'PCM'): void {
    const currentMonth = new Date().toISOString().slice(0, 7);
    let totalMinutes = 0;
    let timeEntries: (CCMTimeEntry | RPMTimeEntry)[] = [];

    // Get time entries based on service type
    switch (serviceType) {
      case 'CCM':
        timeEntries = ccmService.getTimeEntries(patientId, currentMonth);
        break;
      case 'RPM':
        timeEntries = this.getRPMTimeEntries(patientId, currentMonth);
        break;
      case 'PCM':
        // PCM uses CCM time tracking for now
        timeEntries = ccmService.getTimeEntries(patientId, currentMonth);
        break;
    }

    totalMinutes = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);

    // Update billing monitor
    this.updateBillingMonitor(patientId, serviceType, totalMinutes);

    // Check for billing triggers
    this.checkBillingTriggers(patientId, serviceType, totalMinutes);
  }

  private updateBillingMonitor(patientId: string, serviceType: 'CCM' | 'RPM' | 'PCM', minutes: number): void {
    const monitors = this.billingMonitors.get(patientId) || [];
    const existingIndex = monitors.findIndex(m => m.serviceType === serviceType);
    
    const monitor: BillingMonitor = {
      patientId,
      serviceType,
      currentMonthMinutes: minutes,
      lastUpdated: new Date(),
      complianceStatus: this.determineComplianceStatus(serviceType, minutes),
      nextBillingDate: this.getNextBillingDate()
    };

    if (existingIndex >= 0) {
      monitors[existingIndex] = monitor;
    } else {
      monitors.push(monitor);
    }

    this.billingMonitors.set(patientId, monitors);
  }

  private determineComplianceStatus(serviceType: 'CCM' | 'RPM' | 'PCM', minutes: number): BillingMonitor['complianceStatus'] {
    const thresholds = {
      'CCM': 20,
      'RPM': 20,
      'PCM': 30
    };

    const threshold = thresholds[serviceType];
    
    if (minutes >= threshold) return 'compliant';
    if (minutes >= threshold * 0.8) return 'at-risk';
    return 'non-compliant';
  }

  private getNextBillingDate(): Date {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1); // First of next month
    return nextMonth;
  }

  private checkBillingTriggers(patientId: string, serviceType: 'CCM' | 'RPM' | 'PCM', totalMinutes: number): void {
    const rules = this.billingRules.get('default') || [];
    const applicableRules = rules.filter(rule => rule.serviceType === serviceType);

    for (const rule of applicableRules) {
      if (totalMinutes >= rule.minimumMinutes) {
        this.createBillingTrigger(patientId, serviceType, totalMinutes, rule.minimumMinutes);
      }
    }
  }

  private createBillingTrigger(patientId: string, serviceType: 'CCM' | 'RPM' | 'PCM', totalMinutes: number, threshold: number): void {
    const triggers = this.billingTriggers.get(patientId) || [];
    
    // Check if trigger already exists for this month
    const currentMonth = new Date().toISOString().slice(0, 7);
    const existingTrigger = triggers.find(t => 
      t.serviceType === serviceType && 
      t.threshold === threshold &&
      t.triggeredAt.toISOString().slice(0, 7) === currentMonth
    );

    if (!existingTrigger) {
      const trigger: BillingTrigger = {
        id: `${patientId}-${serviceType}-${threshold}-${Date.now()}`,
        patientId,
        serviceType,
        totalMinutes,
        threshold,
        triggered: true,
        triggeredAt: new Date(),
        billGenerated: false
      };

      triggers.push(trigger);
      this.billingTriggers.set(patientId, triggers);

      // Auto-generate bill if enabled
      const rule = this.billingRules.get('default')?.find(r => 
        r.serviceType === serviceType && r.minimumMinutes === threshold
      );

      if (rule?.autoGenerate) {
        this.generateAutomaticBill(trigger);
      }
    }
  }

  // Generate automatic bills
  private async generateAutomaticBill(trigger: BillingTrigger): Promise<void> {
    try {
      let billingDetails: BillingDetails;

      switch (trigger.serviceType) {
        case 'CCM':
          billingDetails = await this.generateCCMBill(trigger);
          break;
        case 'RPM':
          billingDetails = await this.generateRPMBill(trigger);
          break;
        case 'PCM':
          billingDetails = await this.generatePCMBill(trigger);
          break;
        default:
          throw new Error(`Unknown service type: ${trigger.serviceType}`);
      }

      // Store the generated bill
      const patientBills = this.generatedBills.get(trigger.patientId) || [];
      patientBills.push(billingDetails);
      this.generatedBills.set(trigger.patientId, patientBills);

      // Update trigger
      const triggers = this.billingTriggers.get(trigger.patientId) || [];
      const triggerIndex = triggers.findIndex(t => t.id === trigger.id);
      if (triggerIndex >= 0) {
        triggers[triggerIndex].billGenerated = true;
        triggers[triggerIndex].billId = billingDetails.id;
        this.billingTriggers.set(trigger.patientId, triggers);
      }

      toast.success(`Automatic ${trigger.serviceType} bill generated for patient ${trigger.patientId}`, {
        description: `Total amount: $${billingDetails.totalFee.toFixed(2)}`
      });

    } catch (error) {
      console.error('Error generating automatic bill:', error);
      toast.error(`Failed to generate ${trigger.serviceType} bill for patient ${trigger.patientId}`);
    }
  }

  private async generateCCMBill(trigger: BillingTrigger): Promise<BillingDetails> {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const timeEntries = ccmService.getTimeEntries(trigger.patientId, currentMonth);
    
    return createCCMBilling(trigger.patientId, timeEntries, currentMonth);
  }

  private async generateRPMBill(trigger: BillingTrigger): Promise<BillingDetails> {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const timeEntries = this.getRPMTimeEntries(trigger.patientId, currentMonth);
    
    const procedures: ProcedureCode[] = [];
    
    // RPM Setup (99453)
    if (timeEntries.some(e => e.activityType === 'device_setup')) {
      procedures.push({
        id: `proc-${Math.random().toString(36).substr(2, 9)}`,
        cptCode: '99453',
        description: 'Remote patient monitoring setup and patient education',
        fee: 19.93,
        quantity: 1
      });
    }

    // RPM Device Supply (99454)
    procedures.push({
      id: `proc-${Math.random().toString(36).substr(2, 9)}`,
      cptCode: '99454',
      description: 'Remote patient monitoring device supply',
      fee: 64.11,
      quantity: 1
    });

    // RPM Treatment Management (99457/99458)
    const treatmentMinutes = timeEntries
      .filter(e => e.activityType === 'data_review' || e.activityType === 'clinical_assessment')
      .reduce((sum, e) => sum + e.duration, 0);

    if (treatmentMinutes >= 20) {
      procedures.push({
        id: `proc-${Math.random().toString(36).substr(2, 9)}`,
        cptCode: '99457',
        description: 'Remote physiologic monitoring treatment, first 20 minutes',
        fee: 51.14,
        quantity: 1
      });

      const additionalIncrements = Math.floor((treatmentMinutes - 20) / 20);
      if (additionalIncrements > 0) {
        procedures.push({
          id: `proc-${Math.random().toString(36).substr(2, 9)}`,
          cptCode: '99458',
          description: 'Remote physiologic monitoring treatment, each additional 20 minutes',
          fee: 41.21,
          quantity: additionalIncrements
        });
      }
    }

    const diagnosis: Diagnosis = {
      id: `diag-${Math.random().toString(36).substr(2, 9)}`,
      icd10Code: 'Z51.81',
      description: 'Encounter for therapeutic drug level monitoring'
    };

    const totalFee = procedures.reduce((sum, proc) => sum + (proc.fee * proc.quantity), 0);

    return {
      id: `rpm-bill-${Math.random().toString(36).substr(2, 9)}`,
      appointmentId: `rpm-${trigger.patientId}-${currentMonth}`,
      patientId: trigger.patientId,
      providerId: 'current-provider',
      dateOfService: new Date(),
      diagnoses: [diagnosis],
      procedures,
      totalFee,
      insuranceId: 'medicare',
      insuranceName: 'Medicare',
      copay: 0,
      status: 'draft',
      notes: `Automated RPM billing for ${currentMonth} - Total time: ${trigger.totalMinutes} minutes`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private async generatePCMBill(trigger: BillingTrigger): Promise<BillingDetails> {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const timeEntries = ccmService.getTimeEntries(trigger.patientId, currentMonth); // PCM uses CCM time tracking
    
    const procedures: ProcedureCode[] = [];
    
    // PCM First 30 minutes (99424)
    if (trigger.totalMinutes >= 30) {
      procedures.push({
        id: `proc-${Math.random().toString(36).substr(2, 9)}`,
        cptCode: '99424',
        description: 'Principal care management services, first 30 minutes',
        fee: 61.25,
        quantity: 1
      });

      // Additional 30-minute increments (99425)
      const additionalIncrements = Math.floor((trigger.totalMinutes - 30) / 30);
      if (additionalIncrements > 0) {
        procedures.push({
          id: `proc-${Math.random().toString(36).substr(2, 9)}`,
          cptCode: '99425',
          description: 'Principal care management services, each additional 30 minutes',
          fee: 43.07,
          quantity: additionalIncrements
        });
      }
    }

    const diagnosis: Diagnosis = {
      id: `diag-${Math.random().toString(36).substr(2, 9)}`,
      icd10Code: 'Z51.81',
      description: 'Encounter for therapeutic drug level monitoring'
    };

    const totalFee = procedures.reduce((sum, proc) => sum + (proc.fee * proc.quantity), 0);

    return {
      id: `pcm-bill-${Math.random().toString(36).substr(2, 9)}`,
      appointmentId: `pcm-${trigger.patientId}-${currentMonth}`,
      patientId: trigger.patientId,
      providerId: 'current-provider',
      dateOfService: new Date(),
      diagnoses: [diagnosis],
      procedures,
      totalFee,
      insuranceId: 'medicare',
      insuranceName: 'Medicare',
      copay: 0,
      status: 'draft',
      notes: `Automated PCM billing for ${currentMonth} - Total time: ${trigger.totalMinutes} minutes`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Periodic processing for end-of-month billing
  private startPeriodicProcessing(): void {
    setInterval(() => {
      this.processEndOfMonthBilling();
    }, 24 * 60 * 60 * 1000); // Check daily
  }

  private processEndOfMonthBilling(): void {
    if (this.isProcessing) return;

    const today = new Date();
    const isLastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() === today.getDate();

    if (isLastDayOfMonth) {
      this.isProcessing = true;
      this.generateEndOfMonthBills();
      this.isProcessing = false;
    }
  }

  private generateEndOfMonthBills(): void {
    // Get all patients with monitoring data
    const allPatients = new Set<string>();
    
    for (const monitors of this.billingMonitors.values()) {
      monitors.forEach(monitor => allPatients.add(monitor.patientId));
    }

    // Process each patient
    allPatients.forEach(patientId => {
      this.monitorTimeTracking(patientId, 'CCM');
      this.monitorTimeTracking(patientId, 'RPM');
      this.monitorTimeTracking(patientId, 'PCM');
    });

    toast.info('End-of-month billing processing completed');
  }

  // Helper method to get RPM time entries (placeholder implementation)
  private getRPMTimeEntries(patientId: string, month: string): RPMTimeEntry[] {
    // This would integrate with actual RPM service once time tracking is implemented there
    return [];
  }

  // Public API methods
  public getBillingMonitors(patientId: string): BillingMonitor[] {
    return this.billingMonitors.get(patientId) || [];
  }

  public getBillingTriggers(patientId: string): BillingTrigger[] {
    return this.billingTriggers.get(patientId) || [];
  }

  public getGeneratedBills(patientId: string): BillingDetails[] {
    return this.generatedBills.get(patientId) || [];
  }

  public getAllGeneratedBills(): BillingDetails[] {
    const allBills: BillingDetails[] = [];
    for (const bills of this.generatedBills.values()) {
      allBills.push(...bills);
    }
    return allBills;
  }

  public manualBillGeneration(patientId: string, serviceType: 'CCM' | 'RPM' | 'PCM'): void {
    this.monitorTimeTracking(patientId, serviceType);
  }

  public updateBillingRule(ruleId: string, updates: Partial<BillingRule>): void {
    const rules = this.billingRules.get('default') || [];
    const ruleIndex = rules.findIndex(r => r.id === ruleId);
    
    if (ruleIndex >= 0) {
      rules[ruleIndex] = { ...rules[ruleIndex], ...updates };
      this.billingRules.set('default', rules);
    }
  }

  public getBillingCompliance(): { total: number; compliant: number; atRisk: number; nonCompliant: number } {
    let total = 0;
    let compliant = 0;
    let atRisk = 0;
    let nonCompliant = 0;

    for (const monitors of this.billingMonitors.values()) {
      monitors.forEach(monitor => {
        total++;
        switch (monitor.complianceStatus) {
          case 'compliant': compliant++; break;
          case 'at-risk': atRisk++; break;
          case 'non-compliant': nonCompliant++; break;
        }
      });
    }

    return { total, compliant, atRisk, nonCompliant };
  }
}

export const billingAutomationService = new BillingAutomationService();