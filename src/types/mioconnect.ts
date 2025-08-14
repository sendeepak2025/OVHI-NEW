// Updated types to match your actual data structure
export interface MioConnectDeviceReading {
  createdAt: number
  deviceId: string
  deviceData: {
    ihb: boolean
    pul: number
    tz: string
    tri: boolean
    sys: number
    sig: number
    iccid: string
    bat: number
    data_type: string
    imei: string
    sn: string
    user: number
    dia: number
    hand: boolean
    ts: number
  }
  id: string
}

export type MioConnectData = MioConnectDeviceReading

export interface ProcessedVitalReading {
  timestamp: string
  value: number
  unit: string
  deviceInfo?: {
    battery: number
    signal: number
    irregularHeartbeat: boolean
    tremor: boolean
    deviceModel: string
    imei: string
  }
}

export interface ProcessedVitalData {
  name: string
  readings: ProcessedVitalReading[]
  normalRange: [number, number]
  currentValue: number
  status: "normal" | "caution" | "critical"
  trend: "up" | "down" | "stable"
  trendValue: number
  deviceType: string
}

export type BPMTelemetryData = MioConnectDeviceReading
