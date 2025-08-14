import type {
  MioConnectData,
  MioConnectDeviceReading,
  ProcessedVitalData,
  ProcessedVitalReading,
} from "../types/mioconnect"

export class MioConnectProcessor {
  static isBPMTelemetry(data: MioConnectData): data is MioConnectDeviceReading {
    return data.deviceData && data.deviceData.data_type === "bpm_gen2_measure"
  }

  static getVitalStatus(value: number, normalRange: [number, number]): "normal" | "caution" | "critical" {
    if (value < normalRange[0] * 0.8 || value > normalRange[1] * 1.2) {
      return "critical"
    } else if (value < normalRange[0] || value > normalRange[1]) {
      return "caution"
    }
    return "normal"
  }

  static calculateTrend(readings: ProcessedVitalReading[]): { trend: "up" | "down" | "stable"; value: number } {
    if (readings.length < 2) return { trend: "stable", value: 0 }

    const firstValue = readings[readings.length - 1].value // Oldest
    const lastValue = readings[0].value // Newest
    const difference = lastValue - firstValue

    if (Math.abs(difference) < 2) {
      return { trend: "stable", value: 0 }
    }

    return {
      trend: difference > 0 ? "up" : "down",
      value: Math.abs(difference),
    }
  }

  static processBPMData(bpmData: MioConnectDeviceReading[]): ProcessedVitalData[] {
    if (bpmData.length === 0) return []

    // Sort by creation time (newest first)
    const sortedData = [...bpmData].sort((a, b) => b.createdAt - a.createdAt)

    // Process Systolic BP
    const systolicReadings: ProcessedVitalReading[] = sortedData.map((reading) => ({
      timestamp: new Date(reading.createdAt).toISOString(),
      value: reading.deviceData.sys,
      unit: "mmHg",
      deviceInfo: {
        battery: reading.deviceData.bat,
        signal: reading.deviceData.sig,
        irregularHeartbeat: reading.deviceData.ihb,
        tremor: reading.deviceData.hand,
        deviceModel: "TMB-2092-G", // Default for BPM
        imei: reading.deviceData.imei,
      },
    }))

    // Process Diastolic BP
    const diastolicReadings: ProcessedVitalReading[] = sortedData.map((reading) => ({
      timestamp: new Date(reading.createdAt).toISOString(),
      value: reading.deviceData.dia,
      unit: "mmHg",
      deviceInfo: {
        battery: reading.deviceData.bat,
        signal: reading.deviceData.sig,
        irregularHeartbeat: reading.deviceData.ihb,
        tremor: reading.deviceData.hand,
        deviceModel: "TMB-2092-G",
        imei: reading.deviceData.imei,
      },
    }))

    // Process Heart Rate
    const heartRateReadings: ProcessedVitalReading[] = sortedData.map((reading) => ({
      timestamp: new Date(reading.createdAt).toISOString(),
      value: reading.deviceData.pul,
      unit: "bpm",
      deviceInfo: {
        battery: reading.deviceData.bat,
        signal: reading.deviceData.sig,
        irregularHeartbeat: reading.deviceData.ihb,
        tremor: reading.deviceData.hand,
        deviceModel: "TMB-2092-G",
        imei: reading.deviceData.imei,
      },
    }))

    const systolicTrend = this.calculateTrend(systolicReadings)
    const diastolicTrend = this.calculateTrend(diastolicReadings)
    const heartRateTrend = this.calculateTrend(heartRateReadings)

    return [
      {
        name: "Systolic Blood Pressure",
        readings: systolicReadings,
        normalRange: [90, 120],
        currentValue: systolicReadings[0]?.value || 0,
        status: this.getVitalStatus(systolicReadings[0]?.value || 0, [90, 120]),
        trend: systolicTrend.trend,
        trendValue: systolicTrend.value,
        deviceType: "Blood Pressure Monitor",
      },
      {
        name: "Diastolic Blood Pressure",
        readings: diastolicReadings,
        normalRange: [60, 80],
        currentValue: diastolicReadings[0]?.value || 0,
        status: this.getVitalStatus(diastolicReadings[0]?.value || 0, [60, 80]),
        trend: diastolicTrend.trend,
        trendValue: diastolicTrend.value,
        deviceType: "Blood Pressure Monitor",
      },
      {
        name: "Heart Rate",
        readings: heartRateReadings,
        normalRange: [60, 100],
        currentValue: heartRateReadings[0]?.value || 0,
        status: this.getVitalStatus(heartRateReadings[0]?.value || 0, [60, 100]),
        trend: heartRateTrend.trend,
        trendValue: heartRateTrend.value,
        deviceType: "Blood Pressure Monitor",
      },
    ]
  }

  static generateInsights(vitals: ProcessedVitalData[], allData: MioConnectData[]): string[] {
    const insights: string[] = []

    // BPM specific insights
    const bpmData = allData.filter(this.isBPMTelemetry)
    if (bpmData.length > 0) {
      const hasIHB = bpmData.some((reading) => reading.deviceData.ihb)
      const hasHandShaking = bpmData.some((reading) => reading.deviceData.hand)
      const lowBattery = bpmData.some((reading) => reading.deviceData.bat < 30)

      if (hasIHB) {
        insights.push("⚠️ Irregular heartbeat detected in recent blood pressure readings. Consider ECG monitoring.")
      }

      if (hasHandShaking) {
        insights.push(
          "📱 Hand movement detected during measurements. Ensure patient remains still for accurate readings.",
        )
      }

      if (lowBattery) {
        insights.push("🔋 Blood pressure monitor battery is low. Please charge device to ensure continuous monitoring.")
      }
    }

    // Vital-specific insights
    vitals.forEach((vital) => {
      if (vital.status === "critical") {
        insights.push(
          `🚨 ${vital.name} is in critical range (${vital.currentValue} ${vital.readings[0]?.unit}). Immediate medical attention may be required.`,
        )
      } else if (vital.status === "caution" && vital.trend === "up") {
        insights.push(
          `⚠️ ${vital.name} is trending upward (+${vital.trendValue.toFixed(1)} ${vital.readings[0]?.unit}) and outside normal range.`,
        )
      }

      if (vital.trend === "up" && vital.trendValue > 10 && vital.name.includes("Blood Pressure")) {
        insights.push(
          `📈 Significant blood pressure increase detected. Consider lifestyle modifications or medication adjustment.`,
        )
      }
    })

    // Device connectivity insights
    const recentData = allData.filter((d) => Date.now() - d.createdAt < 24 * 60 * 60 * 1000) // Last 24 hours
    if (recentData.length === 0) {
      insights.push("📡 No recent device data received. Check device connectivity and ensure regular measurements.")
    }

    return insights
  }
}
