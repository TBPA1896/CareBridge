export type Role = 'PATIENT' | 'CAREGIVER' | 'ADMIN' | 'CLINICIAN';

export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  phone?: string;
  status: UserStatus;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: string;
  email: string;
  fullName: string;
  role: Role;
  status: UserStatus;
}

export interface PatientProfileData {
  id?: string;
  userId: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies?: string[];
  medicalConditions?: string[];
  activeRecoveryPlanId?: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  phone?: string;
  status: UserStatus;
  profile?: PatientProfileData;
  createdAt?: string;
}
