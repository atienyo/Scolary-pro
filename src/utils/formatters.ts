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

/**
 * Normalizes class names across all variations:
 * e.g. "5ème", "5eme", "5e", "5 ème A", "Cinquième", "5EME" -> "5emea"
 */
export function normalizeClassName(name: string | undefined | null): string {
  if (!name) return '';
  let n = String(name).trim().toLowerCase();
  // Remove accents
  n = n.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // Remove spaces, dashes, dots
  n = n.replace(/[\s\-_.]+/g, '');
  // Replace French words
  n = n.replace(/cinquieme/g, '5eme');
  n = n.replace(/sixieme/g, '6eme');
  n = n.replace(/quatrieme/g, '4eme');
  n = n.replace(/troisieme/g, '3eme');
  n = n.replace(/seconde/g, '2nde');
  n = n.replace(/premiere/g, '1ere');
  n = n.replace(/terminale/g, 'tle');
  
  // Normalize 5e -> 5eme, 6e -> 6eme, etc.
  n = n.replace(/^5e([^m]|$)/, '5eme$1');
  n = n.replace(/^6e([^m]|$)/, '6eme$1');
  n = n.replace(/^4e([^m]|$)/, '4eme$1');
  n = n.replace(/^3e([^m]|$)/, '3eme$1');
  n = n.replace(/^1e([^m]|$)/, '1ere$1');
  n = n.replace(/^2nd([^e]|$)/, '2nde$1');

  return n;
}

/**
 * Universal safe date parser supporting YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY, 2-digit years, and ISO.
 */
export function parseSafeDate(dStr: string | undefined | null): Date {
  if (!dStr) return new Date();
  const str = String(dStr).trim();
  if (!str) return new Date();

  // Strip time part if present
  const dateOnly = str.split('T')[0].trim();
  
  // Split by common delimiters: /, -, ., space
  const parts = dateOnly.split(/[\/\-\.\s]/).map(p => p.trim()).filter(Boolean);
  
  if (parts.length === 3) {
    let y = 0, m = 0, d = 0;
    const p0 = parseInt(parts[0], 10);
    const p1 = parseInt(parts[1], 10);
    const p2 = parseInt(parts[2], 10);

    // Format YYYY-MM-DD or YYYY/MM/DD (e.g. 2026-08-28)
    if (p0 >= 1000 || parts[0].length === 4) {
      y = p0;
      m = p1;
      d = p2;
    }
    // Format DD-MM-YYYY or DD/MM/YYYY (e.g. 28/08/2026)
    else if (p2 >= 1000 || parts[2].length === 4) {
      d = p0;
      m = p1;
      y = p2;
    }
    // Format DD-MM-YY or DD/MM/YY (e.g. 28/08/26)
    else if (p2 < 100 && p0 <= 31) {
      d = p0;
      m = p1;
      y = 2000 + p2;
    }
    // Format YY-MM-DD (e.g. 26-08-28)
    else if (p0 < 100 && p2 <= 31) {
      y = 2000 + p0;
      m = p1;
      d = p2;
    }

    if (y > 0 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      const parsed = new Date(y, m - 1, d);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  }

  const fallback = new Date(str);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

export function formatDate(dateString: string, includeTime: boolean = false): string {
  try {
    if (!dateString) return '-';
    const date = parseSafeDate(dateString);
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

/**
 * Resolves the effective reference date for financial computations.
 * If an explicit date string is provided (e.g. from user datepicker), it is parsed safely.
 * Otherwise, it inspects feePlans and the current calendar date. If the calendar year is
 * behind the academic/installment year (e.g. browser is in 2024/2025, but fee plan is in 2026),
 * it seamlessly projects the reference date into the installment year to guarantee instant,
 * accurate overdue detection.
 */
export function getEffectiveReferenceDate(currentDateStr?: string | null, feePlans?: ClassFeePlan[]): Date {
  if (currentDateStr) {
    const parsed = parseSafeDate(currentDateStr);
    parsed.setHours(0, 0, 0, 0);
    return parsed;
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (!feePlans || feePlans.length === 0) {
    return now;
  }

  // Find all installment due years in feePlans
  let maxPlanYear = now.getFullYear();
  let minPlanYear = 9999;
  let hasValidDates = false;

  for (const plan of feePlans) {
    if (plan.installments && Array.isArray(plan.installments)) {
      for (const inst of plan.installments) {
        if (inst.dueDate) {
          const d = parseSafeDate(inst.dueDate);
          const y = d.getFullYear();
          if (y >= 2000 && y <= 2100) {
            hasValidDates = true;
            if (y > maxPlanYear) maxPlanYear = y;
            if (y < minPlanYear) minPlanYear = y;
          }
        }
      }
    }
  }

  // If calendar clock is before the plan year (e.g. browser is 2024 or 2025, but plans are configured for 2026),
  // align current month and day to the plan year so future academic years evaluate accurately.
  if (hasValidDates && now.getFullYear() < minPlanYear) {
    const projected = new Date(minPlanYear, now.getMonth(), now.getDate());
    projected.setHours(0, 0, 0, 0);
    return projected;
  }

  return now;
}

export function calculateStudentFinancials(
  student: Student,
  feePlans: ClassFeePlan[],
  payments: PaymentTransaction[],
  currentDateStr?: string
): StudentFinancialSummary {
  const defaultTotal = student.level === 'LYCEE' ? 450000 : 350000;
  const sNorm = normalizeClassName(student.className);
  
  // Robust matching: by classId, exact normalized className, substring/prefix match, level, or first plan
  const matchedPlan = feePlans.find(p => p.classId && student.classId && p.classId === student.classId)
    || feePlans.find(p => normalizeClassName(p.className) === sNorm && sNorm !== '')
    || feePlans.find(p => {
      const pNorm = normalizeClassName(p.className);
      if (!pNorm || !sNorm) return false;
      return pNorm.includes(sNorm) || sNorm.includes(pNorm) || pNorm.startsWith(sNorm.slice(0, 4)) || sNorm.startsWith(pNorm.slice(0, 4));
    })
    || feePlans.find(p => p.level === student.level)
    || feePlans[0];

  const plan: ClassFeePlan = matchedPlan || {
    classId: student.classId || 'default-class',
    className: student.className || 'Classe Standard',
    level: student.level || 'COLLEGE',
    totalTuition: defaultTotal,
    installments: [
      { id: `inst-1-${student.classId || 'def'}`, title: 'Inscription & Dossier', amount: Math.round(defaultTotal * 0.2), dueDate: '2026-09-15', mandatory: true },
      { id: `inst-2-${student.classId || 'def'}`, title: '1ère Tranche', amount: Math.round(defaultTotal * 0.4), dueDate: '2026-10-15', mandatory: true },
      { id: `inst-3-${student.classId || 'def'}`, title: '2ème Tranche', amount: Math.round(defaultTotal * 0.25), dueDate: '2027-01-15', mandatory: true },
      { id: `inst-4-${student.classId || 'def'}`, title: '3ème Tranche (Solde)', amount: Math.round(defaultTotal * 0.15), dueDate: '2027-04-15', mandatory: true },
    ]
  };

  const studentPayments = payments.filter(p => p.studentId === student.id);
  const totalPaid = studentPayments.reduce((acc, p) => acc + p.amount, 0);

  // Apply discount on tuition base if applicable
  const discountRate = (student.discountPercentage || 0) / 100;
  
  // Calculate total base due
  let totalDue = (Number(plan.totalTuition) || defaultTotal) * (1 - discountRate);

  // Optional fees
  if (student.optionalFees?.uniform) totalDue += 25000;
  if (student.optionalFees?.canteen) totalDue += 90000; // Trimestre
  if (student.optionalFees?.transport) totalDue += 75000; // Trimestre

  const remainingBalance = Math.max(0, totalDue - totalPaid);

  // Reference date: normalize to midnight to avoid hour offsets
  const refDate = getEffectiveReferenceDate(currentDateStr, feePlans);
  refDate.setHours(0, 0, 0, 0);

  // Check installments status
  let runningPaid = totalPaid;
  const rawInstallments = (plan.installments && plan.installments.length > 0)
    ? plan.installments
    : [
        { id: `inst-1-${plan.classId}`, title: 'Inscription & Dossier', amount: Math.round(plan.totalTuition * 0.2), dueDate: '2026-09-15', mandatory: true },
        { id: `inst-2-${plan.classId}`, title: '1ère Tranche', amount: Math.round(plan.totalTuition * 0.4), dueDate: '2026-10-15', mandatory: true },
        { id: `inst-3-${plan.classId}`, title: '2ème Tranche', amount: Math.round(plan.totalTuition * 0.25), dueDate: '2027-01-15', mandatory: true },
        { id: `inst-4-${plan.classId}`, title: '3ème Tranche (Solde)', amount: Math.round(plan.totalTuition * 0.15), dueDate: '2027-04-15', mandatory: true },
      ];

  const installmentsStatus = rawInstallments.map((inst) => {
    const instAmount = Number(inst.amount) || 0;
    const discountedInstAmount = instAmount * (1 - discountRate);
    const instPaid = Math.min(runningPaid, discountedInstAmount);
    runningPaid = Math.max(0, runningPaid - instPaid);

    const isSettled = instPaid >= discountedInstAmount - 1; // Tolerance 1
    
    // Parse installment due date normalized to midnight
    const instDueDate = parseSafeDate(inst.dueDate);
    instDueDate.setHours(0, 0, 0, 0);

    const diffMs = refDate.getTime() - instDueDate.getTime();
    const daysDiff = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Overdue: reference date is on or after due date (triggered immediately as soon as deadline arrives: diffMs >= 0)
    const isOverdue = !isSettled && diffMs >= 0;
    const daysOverdue = isOverdue ? Math.max(1, daysDiff === 0 ? 1 : daysDiff) : 0;
    
    // Critical Overdue threshold: > 7 days (plus d'une semaine de retard)
    const isCriticalOverdue = isOverdue && daysOverdue > 7;
    // Moderate Overdue: 1 to 7 days
    const isModerateOverdue = isOverdue && daysOverdue <= 7;

    // Due Soon Alert: 1 to 3 days before due date (J-3, J-2, J-1, J-0)
    const daysUntilDue = -daysDiff;
    const isDueSoon = !isSettled && !isOverdue && daysUntilDue >= 0 && daysUntilDue <= 3;

    return {
      installment: inst,
      amountDue: discountedInstAmount,
      amountPaid: instPaid,
      isSettled,
      isOverdue,
      daysOverdue,
      daysUntilDue,
      isDueSoon,
      isCriticalOverdue,
      isModerateOverdue,
    };
  });

  // Determine overall status
  const overdueItems = installmentsStatus.filter(i => i.isOverdue);
  const criticalOverdueInstallments = installmentsStatus.filter(i => i.isCriticalOverdue);
  const lateOverdueInstallments = installmentsStatus.filter(i => i.isModerateOverdue);
  const maxDaysLate = overdueItems.length > 0 ? Math.max(...overdueItems.map(i => i.daysOverdue)) : 0;
  const dueSoonInstallments = installmentsStatus.filter(i => i.isDueSoon);
  const hasDueSoonInstallment = dueSoonInstallments.length > 0;
  const hasCriticalOverdue = criticalOverdueInstallments.length > 0;
  const hasLateOverdue = lateOverdueInstallments.length > 0;

  let status: PaymentStatus = 'UP_TO_DATE';
  if (remainingBalance <= 0) {
    status = totalPaid > totalDue ? 'OVERPAID' : 'UP_TO_DATE';
  } else if (hasCriticalOverdue || maxDaysLate > 7) { // Seuil critique : > 1 semaine (7 jours)
    status = 'CRITICAL';
  } else if (hasLateOverdue || maxDaysLate > 0 || overdueItems.length > 0) {
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
    hasDueSoonInstallment,
    hasCriticalOverdue,
    hasLateOverdue,
    dueSoonInstallments,
    overdueInstallments: overdueItems,
    criticalOverdueInstallments,
    lateOverdueInstallments,
  };
}

export function formatPaymentMethod(method: PaymentMethod): string {
  return getMethodDetails(method).label;
}
