import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Search, 
  User, 
  Coins, 
  CheckCircle2, 
  Receipt, 
  Smartphone, 
  Banknote, 
  FileText, 
  CreditCard,
  Calculator,
  ArrowRight,
  Sparkles,
  Phone,
  AlertCircle,
  AlertTriangle,
  Bell,
  Clock,
  Share2,
  FileSpreadsheet,
  Printer,
  X,
  Volume2,
  ShieldCheck,
  TrendingUp,
  Landmark,
  Wallet
} from 'lucide-react';
import { 
  Student, 
  ClassFeePlan, 
  PaymentTransaction, 
  PaymentMethod, 
  SchoolConfig 
} from '../types';
import { 
  formatCurrency, 
  calculateStudentFinancials, 
  getMethodDetails,
  formatDate,
  formatPaymentMethod
} from '../utils/formatters';
import { notificationService } from '../services/notificationService';

interface CashierViewProps {
  students: Student[];
  feePlans: ClassFeePlan[];
  payments: PaymentTransaction[];
  schoolConfig: SchoolConfig;
  activeCashierName: string;
  initialStudentId?: string | null;
  onPaymentSuccess: (payment: PaymentTransaction) => void;
  onViewReceipt: (payment: PaymentTransaction, remaining: number, total: number) => void;
  onOpenDailyRegister?: () => void;
}

// Native Web Audio Synthesizer POS Chime (0 external audio dependencies)
function playCashierChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Note 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Note 2: B5 (987.77 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.18, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.55);
  } catch (e) {
    // Audio silently ignored if blocked or unsupported
  }
}

export const CashierView: React.FC<CashierViewProps> = ({
  students,
  feePlans,
  payments,
  schoolConfig,
  activeCashierName,
  initialStudentId,
  onPaymentSuccess,
  onViewReceipt,
  onOpenDailyRegister,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId || students[0]?.id || '');
  const [studentFilter, setStudentFilter] = useState<'ALL' | 'UNPAID' | 'CRITICAL_OVERDUE' | 'MODERATE_OVERDUE' | 'DUE_SOON' | 'SETTLED'>('ALL');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('WAVE');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [targetInstallment, setTargetInstallment] = useState<string>('Tranche courante');
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [recentFilterMethod, setRecentFilterMethod] = useState<string>('ALL');

  // Sync selectedStudentId when initialStudentId changes
  useEffect(() => {
    if (initialStudentId) {
      setSelectedStudentId(initialStudentId);
    }
  }, [initialStudentId]);

  // Pre-calculate financial status for all students for fast filtering & badging
  const studentsFinancialsMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof calculateStudentFinancials>>();
    students.forEach((s) => {
      map.set(s.id, calculateStudentFinancials(s, feePlans, payments));
    });
    return map;
  }, [students, feePlans, payments]);

  // Alert summary counts
  const alertCounts = useMemo(() => {
    let dueSoonCount = 0;
    let lateCount = 0;
    let criticalCount = 0;
    let overdueCount = 0;
    let unpaidCount = 0;
    let settledCount = 0;

    studentsFinancialsMap.forEach((fin) => {
      if (fin.remainingBalance <= 0) {
        settledCount++;
      } else {
        unpaidCount++;
      }
      if (fin.hasDueSoonInstallment) dueSoonCount++;
      if (fin.hasCriticalOverdue || fin.status === 'CRITICAL') {
        criticalCount++;
        overdueCount++;
      } else if (fin.hasLateOverdue || fin.status === 'LATE') {
        lateCount++;
        overdueCount++;
      } else if (fin.installmentsStatus.some(i => i.isOverdue)) {
        overdueCount++;
      }
    });

    return { dueSoonCount, lateCount, criticalCount, overdueCount, unpaidCount, settledCount };
  }, [studentsFinancialsMap]);

  // Session drawer statistics
  const sessionStats = useMemo(() => {
    let totalCash = 0;
    let totalMobileMoney = 0;
    let totalBank = 0;
    let totalAmount = 0;

    payments.forEach((p) => {
      totalAmount += p.amount;
      if (p.method === 'ESPECES') {
        totalCash += p.amount;
      } else if (p.method === 'WAVE' || p.method === 'ORANGE_MONEY' || p.method === 'MTN_MOMO') {
        totalMobileMoney += p.amount;
      } else {
        totalBank += p.amount;
      }
    });

    return {
      totalAmount,
      totalCash,
      totalMobileMoney,
      totalBank,
      receiptsCount: payments.length,
    };
  }, [payments]);

  // Filter students based on search and quick category filter
  const filteredStudents = useMemo(() => {
    let list = students;

    if (studentFilter === 'UNPAID') {
      list = list.filter((s) => (studentsFinancialsMap.get(s.id)?.remainingBalance || 0) > 0);
    } else if (studentFilter === 'SETTLED') {
      list = list.filter((s) => (studentsFinancialsMap.get(s.id)?.remainingBalance || 0) <= 0);
    } else if (studentFilter === 'DUE_SOON') {
      list = list.filter((s) => studentsFinancialsMap.get(s.id)?.hasDueSoonInstallment);
    } else if (studentFilter === 'MODERATE_OVERDUE') {
      list = list.filter((s) => {
        const fin = studentsFinancialsMap.get(s.id);
        return (fin?.hasLateOverdue || fin?.status === 'LATE') && !fin?.hasCriticalOverdue && fin?.status !== 'CRITICAL';
      });
    } else if (studentFilter === 'CRITICAL_OVERDUE') {
      list = list.filter((s) => {
        const fin = studentsFinancialsMap.get(s.id);
        return fin?.hasCriticalOverdue || fin?.status === 'CRITICAL';
      });
    }

    if (!searchTerm.trim()) {
      return list;
    }

    const term = searchTerm.toLowerCase();
    return list.filter(
      (s) =>
        s.firstName.toLowerCase().includes(term) ||
        s.lastName.toLowerCase().includes(term) ||
        s.matricule.toLowerCase().includes(term) ||
        s.className.toLowerCase().includes(term) ||
        (s.guardianName && s.guardianName.toLowerCase().includes(term)) ||
        (s.guardianPhone && s.guardianPhone.includes(term))
    );
  }, [students, searchTerm, studentFilter, studentsFinancialsMap]);

  // Selected student details & financial summary
  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || filteredStudents[0] || students[0];
  }, [students, selectedStudentId, filteredStudents]);

  const financialSummary = useMemo(() => {
    if (!selectedStudent) return null;
    return calculateStudentFinancials(selectedStudent, feePlans, payments);
  }, [selectedStudent, feePlans, payments]);

  // Handle setting suggested payment amount
  const handleQuickAmount = (amount: number, target: string) => {
    setPaymentAmount(amount);
    setTargetInstallment(target);
    if (paymentMethod === 'ESPECES') {
      setCashGiven(amount);
    }
  };

  // Dynamic Multi-Tranche Allocation Simulator (shows how custom amount settles installments)
  const allocationBreakdown = useMemo(() => {
    if (!financialSummary || paymentAmount <= 0) return null;

    let available = paymentAmount;
    const settledTranches: { title: string; allocated: number; fullyPaid: boolean }[] = [];

    financialSummary.installmentsStatus.forEach((inst) => {
      const remainingForInst = inst.amountDue - inst.amountPaid;
      if (remainingForInst <= 0 || available <= 0) return;

      const allocation = Math.min(available, remainingForInst);
      available -= allocation;
      settledTranches.push({
        title: inst.installment.title,
        allocated: allocation,
        fullyPaid: allocation >= remainingForInst - 1,
      });
    });

    return {
      tranches: settledTranches,
      excess: available,
    };
  }, [financialSummary, paymentAmount]);

  // Calculate change for cash payments
  const cashChange = useMemo(() => {
    if (paymentMethod !== 'ESPECES' || !cashGiven || cashGiven < paymentAmount) {
      return 0;
    }
    return cashGiven - paymentAmount;
  }, [paymentMethod, cashGiven, paymentAmount]);

  // Cash change bill breakdown suggestion
  const billBreakdownSuggestion = useMemo(() => {
    if (cashChange <= 0) return null;
    let remainder = cashChange;
    const bills = [10000, 5000, 2000, 1000, 500, 200, 100, 50];
    const breakdown: { val: number; count: number }[] = [];

    bills.forEach((b) => {
      if (remainder >= b) {
        const count = Math.floor(remainder / b);
        breakdown.push({ val: b, count });
        remainder %= b;
      }
    });

    return breakdown;
  }, [cashChange]);

  // Handle submit payment
  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || paymentAmount <= 0) return;

    // Generate unique official receipt number
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const receiptNum = `REC-24-${randomSeq}`;

    const newPayment: PaymentTransaction = {
      id: `pay-${Date.now()}`,
      receiptNumber: receiptNum,
      studentId: selectedStudent.id,
      studentName: `${selectedStudent.lastName} ${selectedStudent.firstName}`,
      studentMatricule: selectedStudent.matricule,
      className: selectedStudent.className,
      amount: Number(paymentAmount),
      method: paymentMethod,
      reference: transactionRef || (paymentMethod === 'ESPECES' ? `ESP-${Date.now().toString().slice(-4)}` : undefined),
      cashierName: activeCashierName,
      timestamp: new Date().toISOString(),
      installmentTarget: targetInstallment,
      cashGiven: paymentMethod === 'ESPECES' ? cashGiven : undefined,
      cashReturned: paymentMethod === 'ESPECES' ? cashChange : undefined,
      notes: notes || undefined,
    };

    // Play POS audio chime
    playCashierChime();

    // Trigger celebration confetti
    confetti({
      particleCount: 80,
      spread: 65,
      origin: { y: 0.7 },
      colors: ['#3b5bdb', '#10b981', '#0ea5e9', '#f59e0b']
    });

    onPaymentSuccess(newPayment);

    // Automatically trigger official receipt modal
    const remaining = Math.max(0, (financialSummary?.remainingBalance || 0) - paymentAmount);
    onViewReceipt(newPayment, remaining, financialSummary?.totalDue || 0);

    // Reset form
    setPaymentAmount(0);
    setTransactionRef('');
    setNotes('');
    setCashGiven(0);
  };

  // Recent payments recorded in current session
  const filteredRecentPayments = useMemo(() => {
    let list = [...payments].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (recentFilterMethod !== 'ALL') {
      list = list.filter((p) => p.method === recentFilterMethod);
    }
    return list.slice(0, 8);
  }, [payments, recentFilterMethod]);

  return (
    <div className="page-wrapper">
      
      {/* 1. TOP CASHIER SESSION & DRAWER KPI STRIP */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
          }}>
            <Coins size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                background: '#ecfdf5',
                color: '#059669',
                padding: '0.15rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                SESSION CAISSE OUVERTE
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>• {activeCashierName}</span>
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0 0 0' }}>
              Terminal d'Encaissement Flash
            </h1>
          </div>
        </div>

        {/* Live Drawer KPIs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ background: '#f8fafc', padding: '0.5rem 0.9rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              💵 Espèces en Caisse
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#16a34a' }}>
              {formatCurrency(sessionStats.totalCash, schoolConfig.currency)}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.5rem 0.9rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              📱 Mobile Money (Wave/OM/MTN)
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0284c7' }}>
              {formatCurrency(sessionStats.totalMobileMoney, schoolConfig.currency)}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.5rem 0.9rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              🧾 Total Session ({sessionStats.receiptsCount} reçus)
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#4f46e5' }}>
              {formatCurrency(sessionStats.totalAmount, schoolConfig.currency)}
            </div>
          </div>

          {onOpenDailyRegister && (
            <button
              onClick={onOpenDailyRegister}
              className="btn btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1rem',
                fontSize: '0.825rem',
                fontWeight: 700,
                background: '#f8fafc'
              }}
              title="Consulter le journal de caisse et l'arrêté journalier de réconciliation"
            >
              <FileSpreadsheet size={16} color="var(--primary)" />
              <span>Arrêté de Caisse</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN CASHIER WORKSPACE GRID */}
      <div className="cashier-split-grid">
        
        {/* Left Column: Student Selector & Ledger */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Student Selector Card */}
          <div className="card">
            <div className="card-header" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <User size={17} color="var(--primary)" />
                <span>Recherche & Sélection de l'Élève</span>
              </div>
            </div>
            
            <div style={{ padding: '1.1rem' }}>
              {/* Filter Pills */}
              <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setStudentFilter('ALL')}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: studentFilter === 'ALL' ? 'var(--primary)' : '#e2e8f0',
                    background: studentFilter === 'ALL' ? '#edf2ff' : '#f8fafc',
                    color: studentFilter === 'ALL' ? 'var(--primary)' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  Tous ({students.length})
                </button>

                <button
                  type="button"
                  onClick={() => setStudentFilter('UNPAID')}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: studentFilter === 'UNPAID' ? 'var(--primary)' : '#e2e8f0',
                    background: studentFilter === 'UNPAID' ? '#e0e7ff' : '#f8fafc',
                    color: studentFilter === 'UNPAID' ? 'var(--primary)' : '#4338ca',
                    cursor: 'pointer'
                  }}
                >
                  ⚡ Impayés ({alertCounts.unpaidCount})
                </button>

                <button
                  type="button"
                  onClick={() => setStudentFilter('CRITICAL_OVERDUE')}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: studentFilter === 'CRITICAL_OVERDUE' ? '#ef4444' : '#fecaca',
                    background: studentFilter === 'CRITICAL_OVERDUE' ? '#fee2e2' : '#fef2f2',
                    color: '#dc2626',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <AlertTriangle size={12} />
                  <span>Critiques &gt;7j ({alertCounts.criticalCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStudentFilter('MODERATE_OVERDUE')}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: studentFilter === 'MODERATE_OVERDUE' ? '#f97316' : '#fed7aa',
                    background: studentFilter === 'MODERATE_OVERDUE' ? '#ffedd5' : '#fff7ed',
                    color: '#c2410c',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <Clock size={12} />
                  <span>Retards 1-7j ({alertCounts.lateCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStudentFilter('DUE_SOON')}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: studentFilter === 'DUE_SOON' ? '#f59e0b' : '#fde68a',
                    background: studentFilter === 'DUE_SOON' ? '#fef3c7' : '#fffbeb',
                    color: '#b45309',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <Bell size={12} />
                  <span>J-3 ({alertCounts.dueSoonCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStudentFilter('SETTLED')}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: studentFilter === 'SETTLED' ? '#10b981' : '#a7f3d0',
                    background: studentFilter === 'SETTLED' ? '#ecfdf5' : '#f8fafc',
                    color: '#059669',
                    cursor: 'pointer'
                  }}
                >
                  ✨ Soldés ({alertCounts.settledCount})
                </button>
              </div>

              {/* Search Bar */}
              <div style={{ position: 'relative', marginBottom: '0.85rem' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '0.7rem' }} />
                <input
                  type="text"
                  placeholder="Rechercher nom, matricule, classe, téléphone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2.2rem', paddingRight: searchTerm ? '2rem' : '0.85rem' }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    style={{ position: 'absolute', right: '0.75rem', top: '0.65rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Student choices list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '330px', overflowY: 'auto' }}>
                {filteredStudents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    <User size={28} style={{ margin: '0 auto 0.4rem', opacity: 0.35 }} />
                    <div>{students.length === 0 ? "Aucun élève enregistré." : "Aucun élève ne correspond à ce filtre."}</div>
                  </div>
                ) : (
                  filteredStudents.map((s) => {
                    const isSelected = s.id === selectedStudent?.id;
                    const fin = studentsFinancialsMap.get(s.id);
                    const isDueSoon = fin?.hasDueSoonInstallment;
                    const isCritical = fin?.hasCriticalOverdue || fin?.status === 'CRITICAL';
                    const isLate = (fin?.hasLateOverdue || fin?.status === 'LATE') && !isCritical;
                    const isFullyPaid = fin && fin.remainingBalance <= 0;

                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedStudentId(s.id)}
                        style={{
                          padding: '0.65rem 0.85rem',
                          borderRadius: 'var(--radius-md)',
                          background: isSelected 
                            ? '#edf2ff' 
                            : isCritical 
                            ? '#fef2f2' 
                            : isLate
                            ? '#fff7ed'
                            : isDueSoon 
                            ? '#fffbeb' 
                            : '#f8fafc',
                          border: isSelected 
                            ? '1.5px solid var(--primary)' 
                            : isCritical 
                            ? '1.5px solid #fca5a5' 
                            : isLate
                            ? '1.5px solid #fdba74'
                            : isDueSoon 
                            ? '1.5px solid #fde68a' 
                            : '1px solid var(--border-color)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.875rem', color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                              {s.lastName} {s.firstName}
                            </div>

                            {/* Critical Overdue Badge */}
                            {isCritical && (
                              <span 
                                title={`Retard critique supérieur à 7 jours (${fin?.daysLate} jours)`}
                                style={{
                                  fontSize: '0.65rem',
                                  background: '#fee2e2',
                                  color: '#dc2626',
                                  border: '1px solid #fca5a5',
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                  fontWeight: 800,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '2px'
                                }}
                              >
                                🚨 &gt;7j ({fin?.daysLate}j)
                              </span>
                            )}

                            {/* Moderate Overdue Badge */}
                            {isLate && (
                              <span 
                                title={`Retard modéré de 1 à 7 jours (${fin?.daysLate} jours)`}
                                style={{
                                  fontSize: '0.65rem',
                                  background: '#ffedd5',
                                  color: '#c2410c',
                                  border: '1px solid #fdba74',
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                  fontWeight: 800,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '2px'
                                }}
                              >
                                ⚠️ Retard ({fin?.daysLate}j)
                              </span>
                            )}

                            {/* Due Soon Badge */}
                            {isDueSoon && !isCritical && !isLate && (
                              <span 
                                title="Échéance sous 3 jours (J-3)"
                                style={{
                                  fontSize: '0.65rem',
                                  background: '#fef3c7',
                                  color: '#b45309',
                                  border: '1px solid #fde68a',
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                  fontWeight: 800,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '2px'
                                }}
                              >
                                🔔 J-{fin?.dueSoonInstallments?.[0]?.daysUntilDue ?? 3}
                              </span>
                            )}

                            {/* Soldé Badge */}
                            {isFullyPaid && (
                              <span 
                                title="Scolarité 100% soldée"
                                style={{
                                  fontSize: '0.65rem',
                                  background: '#ecfdf5',
                                  color: '#059669',
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                  fontWeight: 700
                                }}
                              >
                                ✓ Soldé
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.1rem' }}>
                            {s.matricule} • {s.className}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          {fin && (
                            <div style={{ 
                              fontSize: '0.8rem', 
                              fontWeight: 900, 
                              color: fin.remainingBalance === 0 ? '#059669' : isCritical ? '#dc2626' : isLate ? '#ea580c' : '#0f172a' 
                            }}>
                              {fin.remainingBalance === 0 ? '0 FCFA' : formatCurrency(fin.remainingBalance, schoolConfig.currency)}
                            </div>
                          )}
                          {s.discountPercentage > 0 && (
                            <span style={{ fontSize: '0.65rem', background: '#fef3c7', color: '#b45309', padding: '1px 4px', borderRadius: '3px', fontWeight: 600 }}>
                              -{s.discountPercentage}%
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Student Status & Financial Ledger */}
          {selectedStudent && financialSummary && (
            <div className="card">
              <div className="card-header" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ fontWeight: 800, fontSize: '0.875rem' }}>Situation Financière de l'Élève</div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {financialSummary.hasCriticalOverdue || financialSummary.status === 'CRITICAL' ? (
                    <span style={{
                      fontSize: '0.72rem',
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: '1px solid #fca5a5',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '6px',
                      fontWeight: 800
                    }}>
                      🚨 RETARD CRITIQUE (&gt;7j)
                    </span>
                  ) : financialSummary.hasLateOverdue || financialSummary.status === 'LATE' ? (
                    <span style={{
                      fontSize: '0.72rem',
                      background: '#ffedd5',
                      color: '#c2410c',
                      border: '1px solid #fdba74',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '6px',
                      fontWeight: 800
                    }}>
                      ⚠️ RETARD MODÉRÉ ({financialSummary.daysLate}j)
                    </span>
                  ) : financialSummary.hasDueSoonInstallment ? (
                    <span style={{
                      fontSize: '0.72rem',
                      background: '#fef3c7',
                      color: '#b45309',
                      border: '1px solid #fde68a',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '6px',
                      fontWeight: 800
                    }}>
                      🔔 ÉCHÉANCE J-3
                    </span>
                  ) : financialSummary.remainingBalance === 0 ? (
                    <span style={{
                      fontSize: '0.72rem',
                      background: '#ecfdf5',
                      color: '#059669',
                      border: '1px solid #a7f3d0',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '6px',
                      fontWeight: 700
                    }}>
                      ✨ TOTALEMENT SOLDÉ
                    </span>
                  ) : (
                    <span style={{
                      fontSize: '0.72rem',
                      background: '#f8fafc',
                      color: '#475569',
                      border: '1px solid #e2e8f0',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '6px',
                      fontWeight: 700
                    }}>
                      ✅ À JOUR
                    </span>
                  )}

                  <span className="badge" style={{
                    background: financialSummary.remainingBalance === 0 ? '#ecfdf5' : '#f8fafc',
                    color: financialSummary.remainingBalance === 0 ? '#059669' : '#0f172a',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.75rem',
                    fontWeight: 800
                  }}>
                    Reste : {formatCurrency(financialSummary.remainingBalance, schoolConfig.currency)}
                  </span>
                </div>
              </div>

              <div style={{ padding: '1.25rem' }}>
                {/* Tuition Progress Bar */}
                <div style={{ marginBottom: '1.15rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Progression des Paiements</span>
                    <span style={{ color: financialSummary.totalPaid >= financialSummary.totalDue ? '#059669' : 'var(--primary)' }}>
                      {financialSummary.totalDue > 0 ? Math.round((financialSummary.totalPaid / financialSummary.totalDue) * 100) : 100}% ({formatCurrency(financialSummary.totalPaid, schoolConfig.currency)} / {formatCurrency(financialSummary.totalDue, schoolConfig.currency)})
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(100, financialSummary.totalDue > 0 ? (financialSummary.totalPaid / financialSummary.totalDue) * 100 : 100)}%`,
                      height: '100%',
                      background: financialSummary.totalPaid >= financialSummary.totalDue ? '#10b981' : 'linear-gradient(90deg, #3b5bdb 0%, #0ea5e9 100%)',
                      borderRadius: '999px',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>

                {/* Parent Contact Card */}
                <div style={{
                  background: '#f8fafc',
                  padding: '0.75rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedStudent.guardianName} ({selectedStudent.guardianRelation})</div>
                    <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem' }}>
                      <Phone size={12} />
                      <span>{selectedStudent.guardianPhone}</span>
                    </div>
                  </div>
                  <a 
                    href={`https://wa.me/${selectedStudent.guardianPhone.replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{
                      fontSize: '0.72rem',
                      background: '#25D366',
                      color: '#fff',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <Share2 size={12} />
                    <span>WhatsApp</span>
                  </a>
                </div>

                {/* Installments Table */}
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  Échéancier & Tranches de Scolarité
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {financialSummary.installmentsStatus.map((item, idx) => {
                    const isFullyPaid = item.isSettled;
                    const dueAmt = item.amountDue - item.amountPaid;

                    return (
                      <div
                        key={idx}
                        style={{
                          padding: '0.65rem 0.8rem',
                          borderRadius: '8px',
                          border: `1.5px solid ${
                            isFullyPaid 
                              ? '#a7f3d0' 
                              : item.isCriticalOverdue
                              ? '#fca5a5' 
                              : item.isOverdue 
                              ? '#fdba74' 
                              : item.isDueSoon
                              ? '#fcd34d'
                              : '#e2e8f0'
                          }`,
                          background: isFullyPaid 
                            ? '#f0fdf4' 
                            : item.isCriticalOverdue
                            ? '#fef2f2' 
                            : item.isOverdue 
                            ? '#fff7ed' 
                            : item.isDueSoon
                            ? '#fffdf0'
                            : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>{item.installment.title}</div>
                            {item.isDueSoon && !item.isOverdue && (
                              <span style={{
                                fontSize: '0.65rem',
                                background: '#fef3c7',
                                color: '#b45309',
                                border: '1px solid #fde68a',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                fontWeight: 800
                              }}>
                                🔔 {item.daysUntilDue === 0 ? "Aujourd'hui" : `dans ${item.daysUntilDue}j (J-${item.daysUntilDue})`}
                              </span>
                            )}
                          </div>
                          
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.15rem' }}>
                            Échéance : {formatDate(item.installment.dueDate)}
                            {item.isCriticalOverdue && (
                              <span style={{ color: '#dc2626', fontWeight: 800, marginLeft: '0.35rem' }}>
                                (🚨 Retard critique : {item.daysOverdue}j &gt; 1 sem)
                              </span>
                            )}
                            {item.isOverdue && !item.isCriticalOverdue && (
                              <span style={{ color: '#ea580c', fontWeight: 700, marginLeft: '0.35rem' }}>
                                (⚠️ Retard modéré : {item.daysOverdue}j)
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, color: isFullyPaid ? '#059669' : item.isCriticalOverdue ? '#dc2626' : item.isOverdue ? '#ea580c' : item.isDueSoon ? '#b45309' : '#0f172a' }}>
                            {isFullyPaid ? 'SOLDÉ' : formatCurrency(dueAmt, schoolConfig.currency)}
                          </div>
                          {!isFullyPaid && (
                            <button
                              type="button"
                              onClick={() => handleQuickAmount(dueAmt, item.installment.title)}
                              style={{
                                fontSize: '0.7rem',
                                color: 'var(--primary)',
                                fontWeight: 800,
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                marginTop: '0.15rem',
                                background: 'none',
                                border: 'none',
                                padding: 0
                              }}
                            >
                              Saisir ce montant
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Active Payment Terminal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* 1. Critical Overdue Banner (> 1 week / 7 days) */}
          {selectedStudent && financialSummary && (financialSummary.hasCriticalOverdue || financialSummary.status === 'CRITICAL') && (
            <div style={{
              background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
              border: '1.5px solid #ef4444',
              borderRadius: 'var(--radius-md)',
              padding: '0.9rem 1.15rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              flexWrap: 'wrap',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.12)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
                <div style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '0.9rem' }}>
                    🚨 ALERTE RETARD CRITIQUE (&gt; 1 SEMAINE / 7 JOURS)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#b91c1c', marginTop: '0.15rem' }}>
                    L'élève a dépassé la date d'échéance de plus d'une semaine ({financialSummary.daysLate} jours de retard). Règlement d'urgence requis.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {financialSummary.criticalOverdueInstallments?.[0] && (
                  <button
                    type="button"
                    onClick={() => {
                      const inst = financialSummary.criticalOverdueInstallments![0];
                      handleQuickAmount(inst.amountDue - inst.amountPaid, inst.installment.title);
                    }}
                    className="btn btn-secondary"
                    style={{
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      background: '#ffffff',
                      borderColor: '#ef4444',
                      color: '#dc2626'
                    }}
                  >
                    ⚡ Régler Arriéré ({formatCurrency(financialSummary.criticalOverdueInstallments[0].amountDue - financialSummary.criticalOverdueInstallments[0].amountPaid, schoolConfig.currency)})
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    notificationService.sendOverdueReminderViaWhatsApp(
                      selectedStudent,
                      financialSummary,
                      schoolConfig
                    );
                  }}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    background: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Share2 size={13} />
                  <span>Relance WhatsApp</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. Moderate Overdue Banner (1 to 7 days) */}
          {selectedStudent && financialSummary && !financialSummary.hasCriticalOverdue && financialSummary.status !== 'CRITICAL' && (financialSummary.hasLateOverdue || financialSummary.status === 'LATE') && (
            <div style={{
              background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
              border: '1.5px solid #f97316',
              borderRadius: 'var(--radius-md)',
              padding: '0.9rem 1.15rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              flexWrap: 'wrap',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.12)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
                <div style={{
                  background: '#ea580c',
                  color: '#ffffff',
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Clock size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#9a3412', fontSize: '0.9rem' }}>
                    ⚠️ ALERTE RETARD MODÉRÉ (1 À 7 JOURS)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#c2410c', marginTop: '0.15rem' }}>
                    L'élève a dépassé la date d'échéance de {financialSummary.daysLate} jour(s). Merci de procéder au recouvrement amiable.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {financialSummary.lateOverdueInstallments?.[0] && (
                  <button
                    type="button"
                    onClick={() => {
                      const inst = financialSummary.lateOverdueInstallments![0];
                      handleQuickAmount(inst.amountDue - inst.amountPaid, inst.installment.title);
                    }}
                    className="btn btn-secondary"
                    style={{
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      background: '#ffffff',
                      borderColor: '#f97316',
                      color: '#ea580c'
                    }}
                  >
                    ⚡ Régler ({formatCurrency(financialSummary.lateOverdueInstallments[0].amountDue - financialSummary.lateOverdueInstallments[0].amountPaid, schoolConfig.currency)})
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    notificationService.sendOverdueReminderViaWhatsApp(
                      selectedStudent,
                      financialSummary,
                      schoolConfig
                    );
                  }}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    background: '#ea580c',
                    color: '#ffffff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Share2 size={13} />
                  <span>Relance WhatsApp</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. Proactive J-3 Alert Banner (Upcoming due date) */}
          {selectedStudent && financialSummary && financialSummary.hasDueSoonInstallment && (
            <div style={{
              background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
              border: '1.5px solid #f59e0b',
              borderRadius: 'var(--radius-md)',
              padding: '0.9rem 1.15rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              flexWrap: 'wrap',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.12)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
                <div style={{
                  background: '#f59e0b',
                  color: '#ffffff',
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bell size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#92400e', fontSize: '0.9rem' }}>
                    🔔 ALERTE ÉCHÉANCE IMMINENTE (3 JOURS AVANT DATE LIMITE)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#b45309', marginTop: '0.15rem' }}>
                    {financialSummary.dueSoonInstallments?.map((item, idx) => (
                      <span key={idx}>
                        La tranche <strong>« {item.installment.title} »</strong> ({formatCurrency(item.amountDue - item.amountPaid, schoolConfig.currency)}) {item.daysUntilDue === 0 ? "arrive à échéance aujourd'hui !" : `arrive à échéance dans ${item.daysUntilDue} jour(s) (le ${formatDate(item.installment.dueDate)})`}.
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                {financialSummary.dueSoonInstallments?.[0] && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleQuickAmount(
                        financialSummary.dueSoonInstallments![0].amountDue - financialSummary.dueSoonInstallments![0].amountPaid,
                        financialSummary.dueSoonInstallments![0].installment.title
                      )}
                      className="btn btn-secondary"
                      style={{
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        background: '#ffffff',
                        borderColor: '#f59e0b',
                        color: '#92400e'
                      }}
                    >
                      ⚡ Encaisser ({formatCurrency(financialSummary.dueSoonInstallments![0].amountDue - financialSummary.dueSoonInstallments![0].amountPaid, schoolConfig.currency)})
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const inst = financialSummary.dueSoonInstallments![0];
                        notificationService.sendDueSoonReminderViaWhatsApp(
                          selectedStudent,
                          inst.installment.title,
                          inst.amountDue - inst.amountPaid,
                          inst.installment.dueDate,
                          inst.daysUntilDue,
                          schoolConfig
                        );
                      }}
                      className="btn btn-secondary"
                      style={{
                        padding: '0.4rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        background: '#25D366',
                        color: '#ffffff',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                      title="Envoyer un rappel préventif WhatsApp au parent"
                    >
                      <Share2 size={13} />
                      <span>WhatsApp J-3</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Main Terminal Card */}
          <div className="card" style={{ border: '2px solid #3b5bdb', boxShadow: '0 8px 30px rgba(59, 91, 219, 0.08)' }}>
            <div className="card-header" style={{ background: '#edf2ff', borderBottom: '1px solid #dbe4ff', padding: '1.1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800, color: '#3b5bdb', letterSpacing: '0.05em' }}>
                  TERMINAL D'ENCAISSEMENT DIRECT
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                  {selectedStudent ? `${selectedStudent.lastName} ${selectedStudent.firstName} (${selectedStudent.className})` : 'Aucun élève sélectionné'}
                </div>
              </div>

              {financialSummary && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: '#475569' }}>Solde restant dû :</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: financialSummary.remainingBalance > 0 ? '#dc2626' : '#059669' }}>
                    {formatCurrency(financialSummary.remainingBalance, schoolConfig.currency)}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleProcessPayment} style={{ padding: '1.5rem' }}>
              
              {/* Quick Preset Installment Buttons */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 700 }}>
                  Boutons rapides d'encaissement (Tranches)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                  {financialSummary?.installmentsStatus
                    .filter(i => !i.isSettled)
                    .map((item, idx) => {
                      const due = item.amountDue - item.amountPaid;
                      const isSelected = paymentAmount === due && targetInstallment === item.installment.title;
                      
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleQuickAmount(due, item.installment.title)}
                          className="btn btn-secondary"
                          style={{
                            fontSize: '0.8rem',
                            padding: '0.45rem 0.8rem',
                            border: isSelected 
                              ? '2px solid var(--primary)' 
                              : item.isCriticalOverdue
                              ? '1.5px solid #ef4444'
                              : item.isOverdue
                              ? '1.5px solid #f97316'
                              : item.isDueSoon 
                              ? '1.5px solid #f59e0b' 
                              : '1px solid var(--border-color)',
                            background: isSelected 
                              ? '#edf2ff' 
                              : item.isCriticalOverdue
                              ? '#fee2e2'
                              : item.isOverdue
                              ? '#ffedd5'
                              : item.isDueSoon 
                              ? '#fef3c7' 
                              : '#f8fafc',
                            color: isSelected 
                              ? 'var(--primary)' 
                              : item.isCriticalOverdue
                              ? '#dc2626'
                              : item.isOverdue
                              ? '#c2410c'
                              : item.isDueSoon 
                              ? '#92400e' 
                              : 'inherit',
                            fontWeight: 800
                          }}
                        >
                          {item.isCriticalOverdue && <span style={{ marginRight: '4px' }}>🚨</span>}
                          {item.isOverdue && !item.isCriticalOverdue && <span style={{ marginRight: '4px' }}>⚠️</span>}
                          {item.isDueSoon && !item.isOverdue && <span style={{ marginRight: '4px' }}>🔔</span>}
                          {item.installment.title} ({formatCurrency(due, schoolConfig.currency)})
                        </button>
                      );
                    })}
                  
                  {financialSummary && financialSummary.remainingBalance > 0 && (
                    <button
                      type="button"
                      onClick={() => handleQuickAmount(financialSummary.remainingBalance, 'Solde Total Année')}
                      className="btn btn-secondary"
                      style={{
                        fontSize: '0.8rem',
                        padding: '0.45rem 0.85rem',
                        background: '#ecfdf5',
                        border: '1.5px solid #a7f3d0',
                        color: '#059669',
                        fontWeight: 900
                      }}
                    >
                      ✨ Tout Solder ({formatCurrency(financialSummary.remainingBalance, schoolConfig.currency)})
                    </button>
                  )}
                </div>
              </div>

              {/* Payment Amount Input */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 700 }}>
                    Montant à encaisser ({schoolConfig.currency}) *
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="number"
                      required
                      min={100}
                      step={500}
                      value={paymentAmount || ''}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      placeholder="0"
                      style={{
                        width: '100%',
                        fontSize: '1.5rem',
                        fontWeight: 900,
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '2px solid #3b5bdb',
                        fontFamily: 'var(--font-mono)',
                        color: '#0f172a',
                        background: '#ffffff'
                      }}
                    />
                    <span style={{ position: 'absolute', right: '1rem', fontWeight: 800, color: '#64748b' }}>
                      {schoolConfig.currency}
                    </span>
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Désignation / Cible du Paiement</label>
                  <input
                    type="text"
                    value={targetInstallment}
                    onChange={(e) => setTargetInstallment(e.target.value)}
                    placeholder="Ex: 1ère Tranche, Inscription, Solde..."
                    className="form-input"
                    style={{ height: '56px', fontSize: '0.95rem' }}
                  />
                </div>
              </div>

              {/* Dynamic Live Allocation Preview Banner */}
              {allocationBreakdown && allocationBreakdown.tranches.length > 0 && (
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.8rem',
                  color: '#166534'
                }}>
                  <div style={{ fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Sparkles size={14} color="#16a34a" />
                    <span>Répartition automatique du versement :</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                    {allocationBreakdown.tranches.map((t, i) => (
                      <span key={i} style={{ background: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                        • <strong>{t.title}</strong> : {formatCurrency(t.allocated, schoolConfig.currency)} {t.fullyPaid ? '(Soldé ✓)' : '(Partiel)'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Methods Selector */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ marginBottom: '0.6rem', display: 'block', fontWeight: 700 }}>
                  Moyen de règlement *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.65rem' }}>
                  {[
                    { id: 'WAVE', label: 'Wave Mobile', color: '#0284c7', bg: '#e0f2fe', icon: Smartphone },
                    { id: 'ORANGE_MONEY', label: 'Orange Money', color: '#ea580c', bg: '#ffedd5', icon: Smartphone },
                    { id: 'MTN_MOMO', label: 'MTN MoMo', color: '#ca8a04', bg: '#fef9c3', icon: Smartphone },
                    { id: 'ESPECES', label: 'Espèces (Caisse)', color: '#16a34a', bg: '#dcfce7', icon: Banknote },
                    { id: 'CHEQUE', label: 'Chèque', color: '#6366f1', bg: '#e0e7ff', icon: FileText },
                    { id: 'VIREMENT_BANCAIRE', label: 'Virement', color: '#4338ca', bg: '#ede9fe', icon: Landmark },
                    { id: 'CARTE', label: 'Carte Bancaire', color: '#0d9488', bg: '#ccfbf1', icon: CreditCard },
                  ].map((method) => {
                    const Icon = method.icon;
                    const isSelected = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          padding: '0.85rem 0.5rem',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? `2.5px solid ${method.color}` : '1px solid var(--border-color)',
                          background: isSelected ? method.bg : '#f8fafc',
                          color: isSelected ? method.color : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          transition: 'all 0.15s ease',
                          transform: isSelected ? 'scale(1.02)' : 'none',
                          boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.06)' : 'none'
                        }}
                      >
                        <Icon size={20} color={method.color} />
                        <span>{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Sub-form: Cash Calculator (Espèces) OR Reference (Mobile Money / Bank) */}
              {paymentMethod === 'ESPECES' ? (
                <div style={{
                  background: '#f0fdf4',
                  border: '1.5px solid #a7f3d0',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ fontWeight: 800, color: '#166534', fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calculator size={17} />
                      <span>Calculateur de Monnaie à Rendre (Espèces)</span>
                    </div>

                    {/* Quick bill presets */}
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {[5000, 10000, 20000, 50000, 100000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setCashGiven(preset)}
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: '#ffffff',
                            border: '1px solid #86efac',
                            color: '#166534',
                            cursor: 'pointer'
                          }}
                        >
                          +{formatCurrency(preset, schoolConfig.currency).replace(' FCFA', '')}
                        </button>
                      ))}
                      {paymentAmount > 0 && (
                        <button
                          type="button"
                          onClick={() => setCashGiven(paymentAmount)}
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: '#16a34a',
                            border: 'none',
                            color: '#ffffff',
                            cursor: 'pointer'
                          }}
                        >
                          Exact
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534', display: 'block', marginBottom: '0.3rem' }}>
                        Montant remis par le parent :
                      </label>
                      <input
                        type="number"
                        placeholder="Ex: 50000"
                        value={cashGiven || ''}
                        onChange={(e) => setCashGiven(Number(e.target.value))}
                        className="form-input"
                        style={{ fontSize: '1.25rem', fontWeight: 900, borderColor: '#86efac', background: '#ffffff' }}
                      />
                    </div>

                    <div style={{
                      background: '#ffffff',
                      border: '1.5px solid #86efac',
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 800, color: '#64748b' }}>
                        Monnaie à rendre
                      </div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: cashChange > 0 ? '#16a34a' : '#0f172a' }}>
                        {formatCurrency(cashChange, schoolConfig.currency)}
                      </div>
                      {billBreakdownSuggestion && billBreakdownSuggestion.length > 0 && (
                        <div style={{ fontSize: '0.68rem', color: '#166534', marginTop: '0.2rem', fontWeight: 600 }}>
                          Conseil : {billBreakdownSuggestion.map(b => `${b.count}x ${formatCurrency(b.val, schoolConfig.currency).replace(' FCFA', '')}`).join(' + ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    Référence de la transaction ({getMethodDetails(paymentMethod).label})
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="Ex: ID transaction Wave (WV-1234), Réf Orange, ou N° de chèque"
                    className="form-input"
                  />
                </div>
              )}

              {/* Optional Notes */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Observation ou Remarques sur le versement (Optionnel)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Reçu remis à la mère, premier versement partiel..."
                  className="form-input"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={paymentAmount <= 0}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1.1rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  opacity: paymentAmount <= 0 ? 0.6 : 1,
                  cursor: paymentAmount <= 0 ? 'not-allowed' : 'pointer',
                  boxShadow: paymentAmount > 0 ? '0 6px 20px rgba(59, 91, 219, 0.3)' : 'none'
                }}
              >
                <CheckCircle2 size={22} />
                <span>Valider le Paiement & Émettre la Quittance</span>
              </button>

            </form>
          </div>

          {/* Today's Transactions Log for the Cashier */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Derniers Reçus Émis au Guichet</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Session en cours ({payments.length} quittances)</div>
              </div>

              {/* Method filter pills */}
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                {['ALL', 'ESPECES', 'WAVE', 'ORANGE_MONEY'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setRecentFilterMethod(m)}
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      border: '1px solid',
                      borderColor: recentFilterMethod === m ? 'var(--primary)' : '#e2e8f0',
                      background: recentFilterMethod === m ? '#edf2ff' : '#ffffff',
                      color: recentFilterMethod === m ? 'var(--primary)' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {m === 'ALL' ? 'Tous' : m === 'ESPECES' ? 'Espèces' : m === 'WAVE' ? 'Wave' : 'Orange'}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>N° Reçu</th>
                    <th>Élève</th>
                    <th>Classe</th>
                    <th>Montant</th>
                    <th>Moyen</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecentPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        <Receipt size={30} style={{ margin: '0 auto 0.4rem', opacity: 0.35 }} />
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Aucun reçu émis dans cette session</div>
                      </td>
                    </tr>
                  ) : (
                    filteredRecentPayments.map((p) => {
                      const method = getMethodDetails(p.method);
                      const targetStudent = students.find(s => s.id === p.studentId);
                      return (
                        <tr key={p.id}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--primary)' }}>
                            {p.receiptNumber}
                          </td>
                          <td>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>{p.studentName}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formatDate(p.timestamp, true)}</div>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{p.className}</span>
                          </td>
                          <td style={{ fontWeight: 900, color: '#0f172a' }}>
                            {formatCurrency(p.amount, schoolConfig.currency)}
                          </td>
                          <td>
                            <span style={{
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              background: method.bg,
                              color: method.color
                            }}>
                              {method.label}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                              <button
                                onClick={() => onViewReceipt(p, 0, 400000)}
                                className="btn btn-outline"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', fontWeight: 700 }}
                                title="Voir ou réimprimer la quittance officielle"
                              >
                                <Receipt size={14} />
                                <span>Reçu</span>
                              </button>

                              {targetStudent && (
                                <button
                                  onClick={() => notificationService.sendReceiptViaWhatsApp(p, targetStudent, schoolConfig, 0)}
                                  className="btn btn-secondary"
                                  style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem', background: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' }}
                                  title="Renvoyer la quittance par WhatsApp au parent"
                                >
                                  <Share2 size={13} color="#25D366" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
