export interface Patient {
  id: string
  name: string
  phone: string
  email: string
  age: number
  gender: "Male" | "Female" | "Other"
  address: string
  medicalHistory: string[]
  lastVisit: string
  nextAppointment?: string
  profileImage?: string
  emergencyContact: {
    name: string
    phone: string
    relation: string
  }
}

export interface CallHistory {
  id: string
  patientId: string
  patientName: string
  type: "incoming" | "outgoing" | "missed"
  duration: number
  timestamp: string
  callType: "voice" | "video"
}

export interface RingCentralConfig {
  clientId: string
  clientSecret: string
  server: string
  fromNumber: string
  jwt: string
  providerName: string
  authType: "jwt"
}
