import { SchoolConfig, ClassFeePlan, Student, PaymentTransaction } from '../types';

export const initialSchoolConfig: SchoolConfig = {
  id: 'sch-001',
  name: '',
  shortName: '',
  motto: '',
  code: '',
  address: '',
  city: '',
  country: 'Côte d\'Ivoire',
  phone: '',
  email: '',
  currency: 'XOF',
  academicYear: '2024-2025',
  directorName: '',
  bursarName: '',
  stampText: 'SERVICE DE LA COMPTABILITÉ',
};

export const initialFeePlans: ClassFeePlan[] = [];

export const initialStudents: Student[] = [];

export const initialPayments: PaymentTransaction[] = [];
