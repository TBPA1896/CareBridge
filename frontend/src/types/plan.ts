export type PlanStatus = 'DRAFT' | 'VERIFIED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type VerificationStatus = 'DRAFT' | 'EXTRACTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';

export interface MedicationItem {
  name: string;
  dosage: string;
  frequency: string;
  timesOfDay: string[];
  instructions: string;
  durationDays?: number;
}

export interface WoundCareItem {
  title: string;
  instructions: string;
  frequency: string;
  timeOfDay: string;
}

export interface DietItem {
  instruction: string;
  restrictions: string;
  mealGuidelines: string;
}

export interface ActivityItem {
  activity: string;
  restrictionLevel: string;
  details: string;
}

export interface AppointmentItem {
  doctorName: string;
  department: string;
  clinicLocation: string;
  scheduledDate?: string;
  scheduledTime?: string;
  purpose: string;
}

export interface WarningSignItem {
  symptom: string;
  actionRequired: string;
  urgency: string;
}

export interface StructuredInstructions {
  medications: MedicationItem[];
  woundCareTasks: WoundCareItem[];
  dietInstructions: DietItem[];
  activityRestrictions: ActivityItem[];
  appointments: AppointmentItem[];
  warningSigns: WarningSignItem[];
  emergencyInstructions?: string;
}

export interface DischargeInstruction {
  id: string;
  patientId: string;
  patientName: string;
  hospitalName: string;
  attendingPhysician: string;
  dischargeDate: string;
  diagnosis: string;
  rawInstructionText: string;
  uploadedDocumentName?: string;
  extractedDraft?: StructuredInstructions;
  verificationStatus: VerificationStatus;
  verifiedByUserId?: string;
  verifiedByName?: string;
  verifiedAt?: string;
  clinicalNotes?: string;
  createdAt?: string;
}

export interface RecoveryPlan {
  id: string;
  patientId: string;
  patientName: string;
  dischargeInstructionId: string;
  title: string;
  diagnosis: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  status: PlanStatus;
  warningSigns: string[];
  emergencyInstructions?: string;
  verifiedByUserId?: string;
  verifiedByName?: string;
  verifiedAt?: string;
  activatedAt?: string;
  version: number;
  createdAt?: string;
}
