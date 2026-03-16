export interface NoteCard {
  id: string;
  title: string;
  content: string;
  category: string;
  color: string;
  fontSize: 'normal' | 'large' | 'xlarge';
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
}

export interface PersonalInfo {
  name: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  emergencyContact1Name: string;
  emergencyContact1Phone: string;
  emergencyContact1Relation: string;
  emergencyContact2Name: string;
  emergencyContact2Phone: string;
  emergencyContact2Relation: string;
  medicalConditions: string;
  medications: string;
  allergies: string;
  bloodType: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  doctorName: string;
  doctorPhone: string;
  communicationNotes: string;
  preferredLanguage: string;
}

export interface Template {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
}

export type ThemeMode = 'high-contrast' | 'light' | 'dark';

export type FontSize = 'normal' | 'large' | 'xlarge';
