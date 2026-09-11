import { Currency, PaymentMethod, PaymentStatus, Student, ClassFeePlan, PaymentTransaction, StudentFinancialSummary } from '../types';

export function formatCurrency(amount: number, currency: Currency = 'XOF'): string {
  const rounded = Math.round(amount);
  const formattedNumber = new Intl.NumberFormat('fr-FR').format(rounded);
  
  switch (currency) {
    case 'XOF':
      return `${formattedNumber} FCFA`;
    case 'EUR':
      return `${formattedNumber} €`;
    case 'USD':
      return `$${formattedNumber}`;
    default:
      return `${formattedNumber} ${currency}`;
  }
}

export function formatDate(dateString: string, includeTime: boolean = false): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    if (includeTime) {
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    }
    
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getMethodDetails(method: PaymentMethod): { label: string; iconName: string; color: string; bg: string } {
  switch (method) {
    case 'WAVE':
      return { label: 'Wave Mobile', iconName: 'Smartphone', color: '#0284c7', bg: '#e0f2fe' };
    case 'ORANGE_MONEY':
      return { label: 'Orange Money', iconName: 'PhoneCall', color: '#ea580c', bg: '#ffedd5' };
    case 'MTN_MOMO':
      return { label: 'MTN MoMo', iconName: 'Radio', color: '#ca8a04', bg: '#fef9c3' };
    case 'ESPECES':
      return { label: 'Espèces (Caisse)', iconName: 'Banknote', color: '#16a34a', bg: '#dcfce7' };
    case 'CHEQUE':
      return { label: 'Chèque Bancaire', iconName: 'FileText', color: '#6366f1', bg: '#e0e7ff' };
    case 'VIREMENT_BANCAIRE':
      return { label: 'Virement Bancaire', iconName: 'Landmark', color: '#4338ca', bg: '#ede9fe' };
    case 'CARTE':
      return { label: 'Carte Bancaire', iconName: 'CreditCard', color: '#0d9488', bg: '#ccfbf1' };
    default:
      return { label: method, iconName: 'CircleDollarSign', color: '#64748b', bg: '#f1f5f9' };
  }
}

export function getStatusBadge(status: PaymentStatus): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case 'UP_TO_DATE':
      return { label: 'À jour', bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' };
    case 'LATE':
      return { label: 'Retard modéré', bg: '#fffbeb', text: '#d97706', border: '#fde68a' };
    case 'CRITICAL':
      return { label: 'Impayé critique', bg: '#fef2f2', text: '#dc2626', border: '#fecaca' };
    case 'OVERPAID':
      return { label: 'Créditeur', bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };
    default:
      return { label: status, bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' };
  }
}

export function calculateStudentFinancials(
  student: Student,
  feePlans: ClassFeePlan[],
  payments: PaymentTransaction[],
  currentDateStr: string = '2024-11-15'
): StudentFinancialSummary {
  const plan = feePlans.find(p => p.classId === student.classId) || feePlans[0];
  const studentPayments = payments.filter(p => p.studentId === student.id);
  const totalPaid = studentPayments.reduce((acc, p) => acc + p.amount, 0);

  // Apply discount on tuition base if applicable
  const discountRate = (student.discountPercentage || 0) / 100;
  
  // Calculate total base due
  let totalDue = plan.totalTuition * (1 - discountRate);

  // Optional fees
  if (student.optionalFees.uniform) totalDue += 25000;
  if (student.optionalFees.canteen) totalDue += 90000; // Trimestre
  if (student.optionalFees.transport) totalDue += 75000; // Trimestre

  const remainingBalance = Math.max(0, totalDue - totalPaid);

  // Check installments status
  let runningPaid = totalPaid;
  const installmentsStatus = plan.installments.map((inst) => {
    const discountedInstAmount = inst.amount * (1 - discountRate);
    const instPaid = Math.min(runningPaid, discountedInstAmount);
    runningPaid = Math.max(0, runningPaid - instPaid);

    const isSettled = instPaid >= discountedInstAmount - 1; // Tolerance 1
    const instDueDate = new Date(inst.dueDate);
    const refDate = new Date(currentDateStr);
    const diffTime = refDate.getTime() - instDueDate.getTime();
    const daysDiff = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const isOverdue = !isSettled && daysDiff > 0;

    return {
      installment: inst,
      amountDue: discountedInstAmount,
      amountPaid: instPaid,
      isSettled,
      isOverdue,
      daysOverdue: isOverdue ? daysDiff : 0,
    };
  });

  // Determine overall status
  const overdueItems = installmentsStatus.filter(i => i.isOverdue);
  const maxDaysLate = overdueItems.length > 0 ? Math.max(...overdueItems.map(i => i.daysOverdue)) : 0;

  let status: PaymentStatus = 'UP_TO_DATE';
  if (remainingBalance <= 0) {
    status = totalPaid > totalDue ? 'OVERPAID' : 'UP_TO_DATE';
  } else if (maxDaysLate > 30) {
    status = 'CRITICAL';
  } else if (maxDaysLate > 0) {
    status = 'LATE';
  } else {
    status = 'UP_TO_DATE';
  }

  // Last payment date
  const sortedPayments = [...studentPayments].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const lastPaymentDate = sortedPayments.length > 0 ? sortedPayments[0].timestamp : undefined;

  return {
    student,
    totalDue,
    totalPaid,
    remainingBalance,
    status,
    daysLate: maxDaysLate,
    lastPaymentDate,
    installmentsStatus,
  };
}

export function formatPaymentMethod(method: PaymentMethod): string {
  return getMethodDetails(method).label;
}

