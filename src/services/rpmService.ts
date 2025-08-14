
import { v4 as uuidv4 } from 'uuid';

export interface RPMDevice {
  id: string;
  patientId: string;
  deviceType: 'blood_pressure' | 'glucometer' | 'scale' | 'pulse_oximeter' | 'thermometer' | 'ecg';
  deviceModel: string;
  serialNumber: string;
  status: 'active' | 'inactive' | 'maintenance' | 'battery_low';
  lastSyncTime: Date;
  batteryLevel?: number;
  firmwareVersion?: string;
}

export interface RPMReading {
  id: string;
  patientId: string;
  deviceId: string;
  deviceType: RPMDevice['deviceType'];
  timestamp: Date;
  values: {
    [key: string]: number | string;
  };
  isAnomaly: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  validated: boolean;
}

export interface RPMAlert {
  id: string;
  patientId: string;
  alertType: 'threshold_exceeded' | 'device_offline' | 'missed_reading' | 'anomaly_detected' | 'battery_low';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface RPMMonitoringPlan {
  id: string;
  patientId: string;
  condition: string;
  devices: string[];
  thresholds: {
    [deviceType: string]: {
      [parameter: string]: {
        min?: number;
        max?: number;
        target?: number;
      };
    };
  };
  frequency: {
    [deviceType: string]: {
      required: number; // readings per day
      window: string; // time window (e.g., "daily", "weekly")
    };
  };
  active: boolean;
  startDate: Date;
  endDate?: Date;
}

export interface RPMTimeEntry {
  id: string;
  patientId: string;
  providerId: string;
  activityType: 'device_setup' | 'data_review' | 'patient_education' | 'clinical_assessment' | 'care_coordination';
  description: string;
  startTime: Date;
  endTime: Date | null;
  duration: number; // minutes
  automated: boolean;
  billable: boolean;
  cptCode?: string;
}

export interface RPMAnalytics {
  patientId: string;
  period: string;
  adherence: {
    overall: number;
    byDevice: { [deviceType: string]: number };
  };
  trends: {
    [parameter: string]: {
      direction: 'improving' | 'stable' | 'declining';
      change: number;
      significance: 'none' | 'minor' | 'moderate' | 'significant';
    };
  };
  riskScore: number;
  recommendations: string[];
}

class RPMService {
  private devices = new Map<string, RPMDevice[]>();
  private readings = new Map<string, RPMReading[]>();
  private alerts = new Map<string, RPMAlert[]>();
  private monitoringPlans = new Map<string, RPMMonitoringPlan>();
  private timeEntries = new Map<string, RPMTimeEntry[]>();
  private analytics = new Map<string, RPMAnalytics>();

  // Device Management
  registerDevice(device: Omit<RPMDevice, 'id'>): string {
    const deviceId = uuidv4();
    const newDevice: RPMDevice = {
      ...device,
      id: deviceId
    };

    const patientDevices = this.devices.get(device.patientId) || [];
    patientDevices.push(newDevice);
    this.devices.set(device.patientId, patientDevices);

    // Auto-start time tracking for device setup
    this.startTimeTracking(device.patientId, 'current-provider', 'device_setup', `Setting up ${device.deviceType}`, true);

    return deviceId;
  }

  getPatientDevices(patientId: string): RPMDevice[] {
    return this.devices.get(patientId) || [];
  }

  updateDeviceStatus(patientId: string, deviceId: string, status: RPMDevice['status']): void {
    const devices = this.devices.get(patientId) || [];
    const deviceIndex = devices.findIndex(d => d.id === deviceId);
    if (deviceIndex !== -1) {
      devices[deviceIndex].status = status;
      devices[deviceIndex].lastSyncTime = new Date();
      this.devices.set(patientId, devices);

      // Create alert for device issues
      if (status === 'battery_low' || status === 'maintenance') {
        this.createAlert(patientId, 'device_offline', 'medium', `Device ${devices[deviceIndex].deviceModel} requires attention`);
      }
    }
  }

  // Data Processing
  processReading(patientId: string, deviceId: string, rawData: any): string {
    const readingId = uuidv4();
    const device = this.getPatientDevices(patientId).find(d => d.id === deviceId);
    if (!device) throw new Error('Device not found');

    const reading: RPMReading = {
      id: readingId,
      patientId,
      deviceId,
      deviceType: device.deviceType,
      timestamp: new Date(),
      values: this.normalizeReadingValues(device.deviceType, rawData),
      isAnomaly: false,
      riskLevel: 'low',
      validated: false
    };

    // AI-powered anomaly detection
    reading.isAnomaly = this.detectAnomaly(reading);
    reading.riskLevel = this.calculateRiskLevel(reading);

    // Store reading
    const patientReadings = this.readings.get(patientId) || [];
    patientReadings.push(reading);
    this.readings.set(patientId, patientReadings);

    // Check thresholds and create alerts
    this.checkThresholds(patientId, reading);

    // Auto-start clinical review time tracking
    if (reading.riskLevel === 'high' || reading.riskLevel === 'critical' || reading.isAnomaly) {
      this.startTimeTracking(patientId, 'current-provider', 'clinical_assessment', `Reviewing ${device.deviceType} data`, true);
    }

    return readingId;
  }

  private normalizeReadingValues(deviceType: RPMDevice['deviceType'], rawData: any): { [key: string]: number | string } {
    switch (deviceType) {
      case 'blood_pressure':
        return {
          systolic: rawData.systolic || 0,
          diastolic: rawData.diastolic || 0,
          pulse: rawData.pulse || 0
        };
      case 'glucometer':
        return {
          glucose: rawData.glucose || 0,
          unit: rawData.unit || 'mg/dL'
        };
      case 'scale':
        return {
          weight: rawData.weight || 0,
          unit: rawData.unit || 'lbs',
          bmi: rawData.bmi || 0
        };
      case 'pulse_oximeter':
        return {
          spo2: rawData.spo2 || 0,
          heartRate: rawData.heartRate || 0
        };
      case 'thermometer':
        return {
          temperature: rawData.temperature || 0,
          unit: rawData.unit || 'F'
        };
      default:
        return rawData;
    }
  }

  private detectAnomaly(reading: RPMReading): boolean {
    const patientReadings = this.readings.get(reading.patientId) || [];
    const recentReadings = patientReadings
      .filter(r => r.deviceType === reading.deviceType)
      .slice(-10);

    if (recentReadings.length < 3) return false;

    // Simple statistical anomaly detection
    for (const [key, value] of Object.entries(reading.values)) {
      if (typeof value === 'number') {
        const values = recentReadings.map(r => r.values[key] as number).filter(v => !isNaN(v));
        if (values.length > 0) {
          const mean = values.reduce((a, b) => a + b, 0) / values.length;
          const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
          
          // Flag as anomaly if more than 2 standard deviations from mean
          if (Math.abs(value - mean) > 2 * std) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private calculateRiskLevel(reading: RPMReading): RPMReading['riskLevel'] {
    const plan = this.monitoringPlans.get(reading.patientId);
    if (!plan) return 'low';

    const thresholds = plan.thresholds[reading.deviceType];
    if (!thresholds) return 'low';

    let riskLevel: RPMReading['riskLevel'] = 'low';

    for (const [param, value] of Object.entries(reading.values)) {
      if (typeof value === 'number' && thresholds[param]) {
        const threshold = thresholds[param];
        
        if (threshold.max && value > threshold.max * 1.2) {
          riskLevel = 'critical';
        } else if (threshold.min && value < threshold.min * 0.8) {
          riskLevel = 'critical';
        } else if ((threshold.max && value > threshold.max) || (threshold.min && value < threshold.min)) {
          riskLevel = riskLevel === 'critical' ? 'critical' : 'high';
        } else if (threshold.target) {
          const deviation = Math.abs(value - threshold.target) / threshold.target;
          if (deviation > 0.15) {
            riskLevel = riskLevel === 'critical' || riskLevel === 'high' ? riskLevel : 'medium';
          }
        }
      }
    }

    return riskLevel;
  }

  private checkThresholds(patientId: string, reading: RPMReading): void {
    if (reading.riskLevel === 'high' || reading.riskLevel === 'critical') {
      this.createAlert(
        patientId,
        'threshold_exceeded',
        reading.riskLevel === 'critical' ? 'critical' : 'high',
        `${reading.deviceType} reading outside normal range: ${JSON.stringify(reading.values)}`
      );
    }

    if (reading.isAnomaly) {
      this.createAlert(
        patientId,
        'anomaly_detected',
        'medium',
        `Unusual ${reading.deviceType} reading detected`
      );
    }
  }

  // Alert Management
  createAlert(patientId: string, alertType: RPMAlert['alertType'], severity: RPMAlert['severity'], message: string): string {
    const alertId = uuidv4();
    const alert: RPMAlert = {
      id: alertId,
      patientId,
      alertType,
      severity,
      message,
      timestamp: new Date(),
      acknowledged: false,
      resolved: false
    };

    const patientAlerts = this.alerts.get(patientId) || [];
    patientAlerts.push(alert);
    this.alerts.set(patientId, patientAlerts);

    return alertId;
  }

  getPatientAlerts(patientId: string, activeOnly: boolean = false): RPMAlert[] {
    const alerts = this.alerts.get(patientId) || [];
    return activeOnly ? alerts.filter(a => !a.resolved) : alerts;
  }

  acknowledgeAlert(patientId: string, alertId: string, providerId: string): boolean {
    const alerts = this.alerts.get(patientId) || [];
    const alertIndex = alerts.findIndex(a => a.id === alertId);
    
    if (alertIndex !== -1) {
      alerts[alertIndex].acknowledged = true;
      alerts[alertIndex].acknowledgedBy = providerId;
      alerts[alertIndex].acknowledgedAt = new Date();
      this.alerts.set(patientId, alerts);
      return true;
    }
    
    return false;
  }

  // Monitoring Plans
  createMonitoringPlan(plan: Omit<RPMMonitoringPlan, 'id'>): string {
    const planId = uuidv4();
    const newPlan: RPMMonitoringPlan = {
      ...plan,
      id: planId
    };

    this.monitoringPlans.set(plan.patientId, newPlan);
    return planId;
  }

  getMonitoringPlan(patientId: string): RPMMonitoringPlan | null {
    return this.monitoringPlans.get(patientId) || null;
  }

  // Time Tracking
  startTimeTracking(patientId: string, providerId: string, activityType: RPMTimeEntry['activityType'], description: string, automated: boolean = false): string {
    const entryId = uuidv4();
    const timeEntry: RPMTimeEntry = {
      id: entryId,
      patientId,
      providerId,
      activityType,
      description,
      startTime: new Date(),
      endTime: null,
      duration: 0,
      automated,
      billable: true,
      cptCode: this.determineCPTCode(activityType)
    };

    const patientEntries = this.timeEntries.get(patientId) || [];
    patientEntries.push(timeEntry);
    this.timeEntries.set(patientId, patientEntries);

    return entryId;
  }

  stopTimeTracking(patientId: string, entryId: string): RPMTimeEntry | null {
    const entries = this.timeEntries.get(patientId) || [];
    const entryIndex = entries.findIndex(e => e.id === entryId);
    
    if (entryIndex !== -1 && !entries[entryIndex].endTime) {
      entries[entryIndex].endTime = new Date();
      entries[entryIndex].duration = Math.round(
        (entries[entryIndex].endTime!.getTime() - entries[entryIndex].startTime.getTime()) / 60000
      );
      this.timeEntries.set(patientId, entries);
      return entries[entryIndex];
    }
    
    return null;
  }

  private determineCPTCode(activityType: RPMTimeEntry['activityType']): string {
    const cptCodes = {
      'device_setup': '99453',
      'data_review': '99457',
      'patient_education': '99458',
      'clinical_assessment': '99457',
      'care_coordination': '99490'
    };
    return cptCodes[activityType] || '99457';
  }

  // Analytics
  generateAnalytics(patientId: string, period: string = 'month'): RPMAnalytics {
    const readings = this.readings.get(patientId) || [];
    const devices = this.getPatientDevices(patientId);
    
    // Calculate adherence
    const adherence = this.calculateAdherence(patientId, period);
    
    // Analyze trends
    const trends = this.analyzeTrends(readings, period);
    
    // Calculate risk score
    const riskScore = this.calculateOverallRisk(readings);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(patientId, adherence, trends, riskScore);

    const analytics: RPMAnalytics = {
      patientId,
      period,
      adherence,
      trends,
      riskScore,
      recommendations
    };

    this.analytics.set(patientId, analytics);
    return analytics;
  }

  private calculateAdherence(patientId: string, period: string): RPMAnalytics['adherence'] {
    const plan = this.monitoringPlans.get(patientId);
    if (!plan) return { overall: 0, byDevice: {} };

    const readings = this.readings.get(patientId) || [];
    const periodStart = new Date();
    periodStart.setMonth(periodStart.getMonth() - 1); // Last month

    const recentReadings = readings.filter(r => r.timestamp >= periodStart);
    
    const adherence = { overall: 0, byDevice: {} as { [deviceType: string]: number } };
    
    for (const [deviceType, frequency] of Object.entries(plan.frequency)) {
      const deviceReadings = recentReadings.filter(r => r.deviceType === deviceType);
      const expectedReadings = frequency.required * 30; // Assuming daily frequency
      const actualReadings = deviceReadings.length;
      
      adherence.byDevice[deviceType] = Math.min(actualReadings / expectedReadings, 1) * 100;
    }

    adherence.overall = Object.values(adherence.byDevice).reduce((a, b) => a + b, 0) / Object.keys(adherence.byDevice).length || 0;
    
    return adherence;
  }

  private analyzeTrends(readings: RPMReading[], period: string): RPMAnalytics['trends'] {
    const trends: RPMAnalytics['trends'] = {};
    
    // Group readings by parameter
    const parameterData: { [param: string]: number[] } = {};
    
    readings.forEach(reading => {
      Object.entries(reading.values).forEach(([param, value]) => {
        if (typeof value === 'number') {
          if (!parameterData[param]) parameterData[param] = [];
          parameterData[param].push(value);
        }
      });
    });

    // Analyze each parameter
    Object.entries(parameterData).forEach(([param, values]) => {
      if (values.length >= 3) {
        const recent = values.slice(-5);
        const older = values.slice(-10, -5);
        
        if (older.length > 0) {
          const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
          const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
          const change = ((recentAvg - olderAvg) / olderAvg) * 100;
          
          trends[param] = {
            direction: change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable',
            change: Math.abs(change),
            significance: Math.abs(change) > 20 ? 'significant' : Math.abs(change) > 10 ? 'moderate' : Math.abs(change) > 5 ? 'minor' : 'none'
          };
        }
      }
    });

    return trends;
  }

  private calculateOverallRisk(readings: RPMReading[]): number {
    if (readings.length === 0) return 0;

    const recentReadings = readings.slice(-20);
    let riskSum = 0;

    recentReadings.forEach(reading => {
      switch (reading.riskLevel) {
        case 'critical': riskSum += 4; break;
        case 'high': riskSum += 3; break;
        case 'medium': riskSum += 2; break;
        case 'low': riskSum += 1; break;
      }
    });

    return Math.round((riskSum / (recentReadings.length * 4)) * 100);
  }

  private generateRecommendations(patientId: string, adherence: RPMAnalytics['adherence'], trends: RPMAnalytics['trends'], riskScore: number): string[] {
    const recommendations: string[] = [];

    // Adherence recommendations
    if (adherence.overall < 80) {
      recommendations.push('Improve device usage adherence with patient education and reminders');
    }

    // Risk-based recommendations
    if (riskScore > 70) {
      recommendations.push('Schedule urgent clinical review due to high risk indicators');
    } else if (riskScore > 50) {
      recommendations.push('Consider adjusting monitoring frequency or intervention protocols');
    }

    // Trend-based recommendations
    Object.entries(trends).forEach(([param, trend]) => {
      if (trend.significance === 'significant' && trend.direction === 'declining') {
        recommendations.push(`Address declining trend in ${param} - consider intervention adjustment`);
      }
    });

    // Device-specific recommendations
    Object.entries(adherence.byDevice).forEach(([deviceType, adherenceRate]) => {
      if (adherenceRate < 70) {
        recommendations.push(`Improve ${deviceType} usage - current adherence: ${Math.round(adherenceRate)}%`);
      }
    });

    return recommendations;
  }

  // Utility methods
  getPatientReadings(patientId: string, deviceType?: string): RPMReading[] {
    const readings = this.readings.get(patientId) || [];
    return deviceType ? readings.filter(r => r.deviceType === deviceType) : readings;
  }

  getTimeEntries(patientId: string): RPMTimeEntry[] {
    return this.timeEntries.get(patientId) || [];
  }

  getTotalBillableTime(patientId: string, period: string = 'month'): number {
    const entries = this.getTimeEntries(patientId);
    const periodStart = new Date();
    periodStart.setMonth(periodStart.getMonth() - 1);

    return entries
      .filter(e => e.billable && e.endTime && e.startTime >= periodStart)
      .reduce((total, entry) => total + entry.duration, 0);
  }
}

export const rpmService = new RPMService();
