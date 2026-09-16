export type Currency = 'XOF' | 'EUR' | 'USD';

export type UserRole = 'DIRECTOR' | 'BURSAR' | 'CASHIER' | 'ADMIN';

export type PaymentMethod = 
  | 'WAVE' 
  | 'ORANGE_MONEY' 
  | 'MTN_MOMO' 
  | 'ESPECES' 
  | 'CHEQUE' 
  | 'VIREMENT_BANCAIRE' 
  | 'CARTE';

export type SchoolLevel = 'COLLEGE' | 'LYCEE';

export type PaymentStatus = 'UP_TO_DATE' | 'LATE' | 'CRITICAL' | 'OVERPAID';

export interface SchoolConfig {
  id: string;
  name: string;
  shortName: string;
  motto: string;
  code: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  currency: Currency;
  academicYear: string;
  directorName: string;
  bursarName: string;
  stampText: string;
  logoUrl?: string;
}

export interface InstallmentDef {
  id: string;
  title: string; // e.g. "Inscription", "Tranche 1", "Tranche 2", "Tranche 3"
  amount: number;
  dueDate: string; // YYYY-MM-DD
  mandatory: boolean;
}

export interface ClassFeePlan {
  classId: string;
  className: string;
  level: SchoolLevel;
  totalTuition: number;
  installments: InstallmentDef[];
}

export interface Student {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  birthDate: string;
  classId: string;
  className: string;
  level: SchoolLevel;
  avatarUrl?: string;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  guardianEmail: string;
  discountType?: 'NONE' | 'SCHOLARSHIP_25' | 'SCHOLARSHIP_50' | 'STAFF_CHILD_30' | 'SIBLING_15';
  discountPercentage: number;
  optionalFees: {
    canteen: boolean;
    transport: boolean;
    uniform: boolean;
  };
  enrollmentDate: string;
}

export interface PaymentTransaction {
  id: string;
  receiptNumber: string;
  studentId: string;
  studentName: string;
  studentMatricule: string;
  className: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  cashierName: string;
  timestamp: string; // ISO String
  notes?: string;
  installmentTarget: string; // e.g. "Tranche 1", "Inscription", "Global"
  cashGiven?: number;
  cashReturned?: number;
}

export interface InstallmentStatusItem {
  installment: InstallmentDef;
  amountDue: number;
  amountPaid: number;
  isSettled: boolean;
  isOverdue: boolean;
  daysOverdue: number;
  daysUntilDue: number;
  isDueSoon: boolean;
  isCriticalOverdue: boolean;
  isModerateOverdue: boolean;
}

export interface StudentFinancialSummary {
  student: Student;
  totalDue: number;
  totalPaid: number;
  remainingBalance: number;
  status: PaymentStatus;
  daysLate: number;
  lastPaymentDate?: string;
  installmentsStatus: InstallmentStatusItem[];
  hasDueSoonInstallment?: boolean;
  hasCriticalOverdue?: boolean;
  hasLateOverdue?: boolean;
  dueSoonInstallments?: InstallmentStatusItem[];
  overdueInstallments?: InstallmentStatusItem[];
  criticalOverdueInstallments?: InstallmentStatusItem[];
  lateOverdueInstallments?: InstallmentStatusItem[];
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
}

