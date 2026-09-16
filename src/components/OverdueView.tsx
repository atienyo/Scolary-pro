import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  Send, 
  PhoneCall, 
  MessageSquare, 
  FileSpreadsheet, 
  CheckCircle2, 
  Printer, 
  Coins, 
  Filter, 
  X, 
  Share2, 
  Clock, 
  Bell, 
  Calendar,
  AlertOctagon, 
  Wallet,
  Search,
  User,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { 
  Student, 
  ClassFeePlan, 
  PaymentTransaction, 
  SchoolConfig 
} from '../types';
import { 
  formatCurrency, 
  calculateStudentFinancials, 
  formatDate,
  normalizeClassName,
  parseSafeDate,
  getEffectiveReferenceDate
} from '../utils/formatters';
import { exportUtils } from '../utils/exportUtils';

interface OverdueViewProps {
  students: Student[];
  feePlans: ClassFeePlan[];
  payments: PaymentTransaction[];
  schoolConfig: SchoolConfig;
  onPayForStudent: (studentId: string) => void;
  initialFilter?: 'ALL_UNPAID' | 'ALL_OVERDUE' | 'CRITICAL_7' | 'LIGHT_7' | 'DUE_SOON';
}

export const OverdueView: React.FC<OverdueViewProps> = ({
  students,
  feePlans,
  payments,
  schoolConfig,
  onPayForStudent,
  initialFilter,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<'ALL_UNPAID' | 'ALL_OVERDUE' | 'CRITICAL_7' | 'LIGHT_7' | 'DUE_SOON'>(initialFilter || 'ALL_UNPAID');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [asOfDate, setAsOfDate] = useState<string>(() => {
    const effDate = getEffectiveReferenceDate(undefined, feePlans);
    const y = effDate.getFullYear();
    const m = String(effDate.getMonth() + 1).padStart(2, '0');
    const d = String(effDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });
  const [activeTab, setActiveTab] = useState<'LIST' | 'BATCH_REMINDERS'>('LIST');
  const [isSimulatingSend, setIsSimulatingSend] = useState<boolean>(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);

  // Sync initialFilter when navigating from sidebar
  React.useEffect(() => {
    if (initialFilter) {
      setFilterType(initialFilter);
    }
  }, [initialFilter]);

  // Update asOfDate when feePlans change if it was initialized
  React.useEffect(() => {
    if (feePlans && feePlans.length > 0) {
      const effDate = getEffectiveReferenceDate(undefined, feePlans);
      const y = effDate.getFullYear();
      const m = String(effDate.getMonth() + 1).padStart(2, '0');
      const d = String(effDate.getDate()).padStart(2, '0');
      setAsOfDate(`${y}-${m}-${d}`);
    }
  }, [feePlans]);

  // Default SMS Template
  const [smsTemplate, setSmsTemplate] = useState<string>(
    `[${schoolConfig.shortName}] Cher parent, sauf erreur de notre part, la scolarité de votre enfant {ELEVE} ({CLASSE}) présente un montant impayé de {MONTANT}. Merci de vous rapprocher du guichet caisse ou de régler via Wave/Orange Money. Info: ${schoolConfig.phone}`
  );

  // Calculate full financials for all students using asOfDate
  const allStudentsFinancials = useMemo(() => {
    return students.map((student) => {
      const fin = calculateStudentFinancials(student, feePlans, payments, asOfDate);
      const overdueInstallments = fin.installmentsStatus.filter((i) => i.isOverdue);
      const unpaidInstallments = fin.installmentsStatus.filter((i) => !i.isSettled);
      const dueSoonInstallments = fin.installmentsStatus.filter((i) => i.isDueSoon && !i.isOverdue);
      const totalOverdueAmount = overdueInstallments.reduce((acc, i) => acc + (i.amountDue - i.amountPaid), 0);
      const maxDaysOverdue = overdueInstallments.length > 0 ? Math.max(...overdueInstallments.map((i) => i.daysOverdue)) : 0;
      const isCritical = fin.hasCriticalOverdue || maxDaysOverdue > 7 || fin.status === 'CRITICAL';
      const isModerate = (fin.hasLateOverdue || maxDaysOverdue > 0 || overdueInstallments.length > 0 || fin.status === 'LATE') && !isCritical;
      const isDueSoon = (fin.hasDueSoonInstallment || dueSoonInstallments.length > 0) && !isCritical && !isModerate;
      const isUnpaid = fin.remainingBalance > 0;

      return {
        student,
        financials: fin,
        overdueInstallments,
        unpaidInstallments,
        dueSoonInstallments,
        totalOverdueAmount,
        totalRemainingAmount: fin.remainingBalance,
        maxDaysOverdue,
        isCritical,
        isModerate,
        isDueSoon,
        isUnpaid,
      };
    });
  }, [students, feePlans, payments, asOfDate]);

  // Summary counts for filter badges
  const summaryCounts = useMemo(() => {
    let allUnpaidCount = 0;
    let allOverdueCount = 0;
    let criticalCount = 0;
    let moderateCount = 0;
    let dueSoonCount = 0;
    let totalUnpaidBalance = 0;
    let totalOverdueArrears = 0;

    allStudentsFinancials.forEach((item) => {
      if (item.isUnpaid) {
        allUnpaidCount++;
        totalUnpaidBalance += item.totalRemainingAmount;
      }
      if (item.overdueInstallments.length > 0 || item.isCritical || item.isModerate) {
        allOverdueCount++;
        totalOverdueArrears += item.totalOverdueAmount;
      }
      if (item.isCritical) criticalCount++;
      if (item.isModerate) moderateCount++;
      if (item.isDueSoon) dueSoonCount++;
    });

    return {
      allUnpaidCount,
      allOverdueCount,
      criticalCount,
      moderateCount,
      dueSoonCount,
      totalUnpaidBalance,
      totalOverdueArrears,
    };
  }, [allStudentsFinancials]);

  // Filtered list based on selected filters
  const filteredList = useMemo(() => {
    return allStudentsFinancials
      .filter((item) => {
        // Base condition: must have unpaid balance
        if (!item.isUnpaid) return false;

        // Class filter with robust normalization
        if (selectedClass !== 'ALL') {
          const matchClassId = item.student.classId === selectedClass;
          const targetPlan = feePlans.find(p => p.classId === selectedClass);
          const targetNorm = targetPlan ? normalizeClassName(targetPlan.className) : normalizeClassName(selectedClass);
          const studentNorm = normalizeClassName(item.student.className);
          const matchClassName = targetNorm && studentNorm && (
            targetNorm === studentNorm ||
            targetNorm.includes(studentNorm) ||
            studentNorm.includes(targetNorm) ||
            targetNorm.startsWith(studentNorm.slice(0, 4)) ||
            studentNorm.startsWith(targetNorm.slice(0, 4))
          );
          if (!matchClassId && !matchClassName) {
            return false;
          }
        }

        // View Type Filter
        if (filterType === 'ALL_OVERDUE') {
          return item.overdueInstallments.length > 0 || item.maxDaysOverdue > 0 || item.isCritical || item.isModerate;
        }
        if (filterType === 'CRITICAL_7') {
          return item.isCritical;
        }
        if (filterType === 'LIGHT_7') {
          return item.isModerate;
        }
        if (filterType === 'DUE_SOON') {
          return item.isDueSoon;
        }
        // ALL_UNPAID
        return true;
      })
      .filter((item) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (
          item.student.firstName.toLowerCase().includes(term) ||
          item.student.lastName.toLowerCase().includes(term) ||
          item.student.matricule.toLowerCase().includes(term) ||
          item.student.className.toLowerCase().includes(term) ||
          (item.student.guardianName && item.student.guardianName.toLowerCase().includes(term)) ||
          (item.student.guardianPhone && item.student.guardianPhone.includes(term))
        );
      })
      .sort((a, b) => {
        // Sort critical and late first by days overdue desc, then highest remaining balance
        if (a.maxDaysOverdue !== b.maxDaysOverdue) {
          return b.maxDaysOverdue - a.maxDaysOverdue;
        }
        if (a.totalOverdueAmount !== b.totalOverdueAmount) {
          return b.totalOverdueAmount - a.totalOverdueAmount;
        }
        return b.totalRemainingAmount - a.totalRemainingAmount;
      });
  }, [allStudentsFinancials, selectedClass, filterType, searchTerm, feePlans]);

  // Aggregate sum of current filtered list
  const currentFilteredTotal = useMemo(() => {
    return filteredList.reduce((acc, item) => acc + item.totalRemainingAmount, 0);
  }, [filteredList]);

  // Classes dropdown
  const classesList = useMemo(() => {
    const map = new Map<string, string>();
    feePlans.forEach((p) => map.set(p.classId, p.className));
    return Array.from(map.entries());
  }, [feePlans]);

  // Send batch reminders simulation
  const handleTriggerBatchSend = () => {
    setIsSimulatingSend(true);
    setTimeout(() => {
      setIsSimulatingSend(false);
      setSendSuccessMessage(
        `✅ Campagne envoyée avec succès : ${filteredList.length} SMS et notifications WhatsApp ont été distribués aux tuteurs légaux !`
      );
    }, 1800);
  };

  // Generate tailored WhatsApp message per student
  const getWhatsAppMessage = (item: typeof filteredList[0]) => {
    const hasLate = item.overdueInstallments.length > 0;
    if (hasLate) {
      const overdueTranchesStr = item.overdueInstallments.map(i => `${i.installment.title} (${formatCurrency(i.amountDue - i.amountPaid, schoolConfig.currency)})`).join(', ');
      return `[${schoolConfig.shortName}] Cher parent, sauf erreur de notre part, la scolarité de votre enfant ${item.student.lastName} ${item.student.firstName} (${item.student.className}) présente un retard de paiement échu de ${formatCurrency(item.totalOverdueAmount, schoolConfig.currency)} (${overdueTranchesStr} - dépassée de ${item.maxDaysOverdue} jours). Solde total annuel restant : ${formatCurrency(item.totalRemainingAmount, schoolConfig.currency)}. Merci de procéder au règlement au guichet caisse ou via Wave/Orange Money. Info: ${schoolConfig.phone}`;
    }
    return `[${schoolConfig.shortName}] Cher parent, sauf erreur de notre part, la scolarité de votre enfant ${item.student.lastName} ${item.student.firstName} (${item.student.className}) présente un solde restant dû de ${formatCurrency(item.totalRemainingAmount, schoolConfig.currency)}. Merci de vous rapprocher de la caisse pour le règlement. Info: ${schoolConfig.phone}`;
  };

  return (
    <div className="page-wrapper">
      {/* Top Header */}
      <div className="view-header-flex">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{
              background: filterType === 'CRITICAL_7' ? '#991b1b' : '#fef2f2',
              color: filterType === 'CRITICAL_7' ? '#ffffff' : '#dc2626',
              padding: '0.25rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              letterSpacing: '0.04em'
            }}>
              {filterType === 'CRITICAL_7' ? <AlertOctagon size={14} /> : <AlertTriangle size={14} />}
              {filterType === 'CRITICAL_7' ? '🚨 RECOUVREMENT DES CAS CRITIQUES (> 7 JOURS)' : 'RECOUVREMENT & RETARDS DE PAIEMENT'}
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: filterType === 'CRITICAL_7' ? '#991b1b' : undefined }}>
            {filterType === 'CRITICAL_7' ? 'Gestion des Cas Critiques (> 7 Jours de Retard)' : 'Gestion des Retards de Paiement & Impayés'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {filterType === 'CRITICAL_7' 
              ? 'Dossiers prioritaires présentant plus de 7 jours de retard sur une échéance échue. Actions d\'urgence et relances directes.'
              : 'Consultez instantanément les échéances dépassées, dossiers en retard et déclenchez des relances WhatsApp & SMS en 1 clic.'
            }
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab(activeTab === 'LIST' ? 'BATCH_REMINDERS' : 'LIST')}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <MessageSquare size={16} />
            <span>{activeTab === 'LIST' ? 'Module Relances SMS / WhatsApp' : 'Retour à la Liste des Retards'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {sendSuccessMessage && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{sendSuccessMessage}</div>
          <button onClick={() => setSendSuccessMessage(null)} style={{ color: '#065f46' }}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* Overdue Alert Banner if overdues exist */}
      {summaryCounts.allOverdueCount > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
          border: '1.5px solid #ef4444',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          boxShadow: '0 4px 14px rgba(239, 68, 68, 0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
            <div style={{
              background: '#dc2626',
              color: '#ffffff',
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '0.95rem' }}>
                🚨 {summaryCounts.allOverdueCount} élève(s) ont un retard de paiement effectif ({summaryCounts.criticalCount} critique(s) &gt; 7j, {summaryCounts.moderateCount} modéré(s))
              </div>
              <div style={{ fontSize: '0.825rem', color: '#b91c1c', marginTop: '0.2rem' }}>
                Total des arriérés échus : <strong>{formatCurrency(summaryCounts.totalOverdueArrears, schoolConfig.currency)}</strong>. Cliquez sur Relance WhatsApp pour notifier les parents immédiatement.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setFilterType('ALL_OVERDUE')}
              className="btn btn-secondary"
              style={{
                background: '#ffffff',
                borderColor: '#ef4444',
                color: '#dc2626',
                fontWeight: 800,
                fontSize: '0.8rem',
                padding: '0.45rem 0.85rem'
              }}
            >
              Afficher les {summaryCounts.allOverdueCount} Retards
            </button>
          </div>
        </div>
      )}

      {/* Metrics Summary Strip (4 KPI Cards - Clickable Filters) */}
      <div className="kpi-grid-4" style={{ marginBottom: '1.5rem' }}>
        {/* Card 1: Retards de Paiement Échus */}
        <div 
          className="card" 
          onClick={() => setFilterType('ALL_OVERDUE')}
          style={{ 
            padding: '1.25rem', 
            borderLeft: '4px solid #dc2626', 
            background: filterType === 'ALL_OVERDUE' ? '#fef2f2' : summaryCounts.allOverdueCount > 0 ? '#fffafa' : '#ffffff',
            cursor: 'pointer',
            boxShadow: filterType === 'ALL_OVERDUE' ? '0 0 0 2px #dc2626, 0 4px 12px rgba(220, 38, 38, 0.15)' : undefined,
            transition: 'all 0.2s ease'
          }}
          title="Cliquez pour filtrer uniquement les retards de paiement échus"
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: summaryCounts.allOverdueCount > 0 ? '#991b1b' : 'var(--text-muted)', textTransform: 'uppercase' }}>
            🚨 Retards de Paiement (Échus)
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#dc2626', marginTop: '0.35rem' }}>
            {formatCurrency(summaryCounts.totalOverdueArrears, schoolConfig.currency)}
          </div>
          <div style={{ fontSize: '0.75rem', color: summaryCounts.allOverdueCount > 0 ? '#b91c1c' : 'var(--text-muted)', marginTop: '0.2rem' }}>
            {summaryCounts.allOverdueCount} élève(s) avec échéance dépassée
          </div>
        </div>

        {/* Card 2: Retards Critiques > 7j */}
        <div 
          className="card" 
          onClick={() => setFilterType('CRITICAL_7')}
          style={{ 
            padding: '1.25rem', 
            borderLeft: '4px solid #b91c1c',
            background: filterType === 'CRITICAL_7' ? '#fee2e2' : summaryCounts.criticalCount > 0 ? '#fff5f5' : '#ffffff',
            cursor: 'pointer',
            boxShadow: filterType === 'CRITICAL_7' ? '0 0 0 2px #b91c1c, 0 4px 12px rgba(185, 28, 28, 0.2)' : undefined,
            transition: 'all 0.2s ease'
          }}
          title="Cliquez pour afficher uniquement les cas critiques (> 7 jours de retard)"
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: summaryCounts.criticalCount > 0 ? '#991b1b' : 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>🚨 Cas Critiques (&gt; 7j)</span>
            {filterType === 'CRITICAL_7' && <span style={{ fontSize: '0.65rem', background: '#b91c1c', color: '#fff', padding: '1px 6px', borderRadius: '4px' }}>ACTIF</span>}
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#b91c1c', marginTop: '0.35rem' }}>
            {summaryCounts.criticalCount} dossier(s)
          </div>
          <div style={{ fontSize: '0.75rem', color: summaryCounts.criticalCount > 0 ? '#b91c1c' : 'var(--text-muted)', marginTop: '0.2rem', fontWeight: 600 }}>
            Retard urgent &gt; 1 semaine
          </div>
        </div>

        {/* Card 3: Retards Modérés 1-7j & J-3 */}
        <div 
          className="card" 
          onClick={() => setFilterType('LIGHT_7')}
          style={{ 
            padding: '1.25rem', 
            borderLeft: '4px solid #f59e0b',
            background: filterType === 'LIGHT_7' ? '#ffedd5' : '#ffffff',
            cursor: 'pointer',
            boxShadow: filterType === 'LIGHT_7' ? '0 0 0 2px #d97706, 0 4px 12px rgba(217, 119, 6, 0.15)' : undefined,
            transition: 'all 0.2s ease'
          }}
          title="Cliquez pour filtrer les retards modérés (1 à 7 jours)"
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            ⚠️ Modérés (1-7j) & 🔔 J-3
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#d97706', marginTop: '0.35rem' }}>
            {summaryCounts.moderateCount + summaryCounts.dueSoonCount} dossier(s)
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {summaryCounts.moderateCount} modérés + {summaryCounts.dueSoonCount} imminents J-3
          </div>
        </div>

        {/* Card 4: Total Global Restant Dû */}
        <div 
          className="card" 
          onClick={() => setFilterType('ALL_UNPAID')}
          style={{ 
            padding: '1.25rem', 
            borderLeft: '4px solid #3b82f6',
            background: filterType === 'ALL_UNPAID' ? '#eff6ff' : '#ffffff',
            cursor: 'pointer',
            boxShadow: filterType === 'ALL_UNPAID' ? '0 0 0 2px #2563eb, 0 4px 12px rgba(37, 99, 235, 0.15)' : undefined,
            transition: 'all 0.2s ease'
          }}
          title="Cliquez pour afficher tous les élèves avec un solde impayé"
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Soldes Restants
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#2563eb', marginTop: '0.35rem' }}>
            {formatCurrency(summaryCounts.totalUnpaidBalance, schoolConfig.currency)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {summaryCounts.allUnpaidCount} élève(s) avec reste à payer
          </div>
        </div>
      </div>

      {activeTab === 'BATCH_REMINDERS' ? (
        /* BATCH REMINDER SUITE */
        <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Centre de Diffusion des Relances SMS & WhatsApp</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Personnalisez le message de rappel et diffusez-le en un clic aux {filteredList.length} parents débiteurs filtrés.
            </p>
          </div>

          <div className="dashboard-split-grid">
            <div>
              <div className="form-group">
                <label className="form-label">Modèle de Message SMS / WhatsApp</label>
                <textarea
                  rows={5}
                  value={smsTemplate}
                  onChange={(e) => setSmsTemplate(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', fontFamily: 'inherit', resize: 'vertical' }}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Variables dynamiques disponibles : <code>{'{ELEVE}'}</code>, <code>{'{CLASSE}'}</code>, <code>{'{MONTANT}'}</code>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  disabled={isSimulatingSend || filteredList.length === 0}
                  onClick={handleTriggerBatchSend}
                  className="btn btn-primary"
                  style={{ padding: '0.8rem 1.4rem', fontWeight: 800, fontSize: '0.95rem' }}
                >
                  <Send size={18} />
                  <span>{isSimulatingSend ? 'Envoi en cours...' : `Diffuser la relance (${filteredList.length} destinataires)`}</span>
                </button>
              </div>
            </div>

            {/* Preview phone bubble */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Aperçu du SMS reçu par le parent :
                </div>

                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px 12px 12px 0px',
                  padding: '1rem',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                  color: '#0f172a'
                }}>
                  {smsTemplate
                    .replace('{ELEVE}', filteredList[0]?.student ? `${filteredList[0].student.lastName} ${filteredList[0].student.firstName}` : 'ÉLÈVE EXEMPLE')
                    .replace('{CLASSE}', filteredList[0]?.student.className || 'Classe')
                    .replace('{MONTANT}', formatCurrency(filteredList[0]?.totalOverdueAmount || filteredList[0]?.totalRemainingAmount || 50000, schoolConfig.currency))
                  }
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={14} color="#10b981" />
                <span>Routage opérateur garanti (Orange, MTN, Moov, Wave)</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Overdue & Unpaid Table Section */}
      <div className="card">
        {/* Filters Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setFilterType('ALL_UNPAID')}
              style={{
                fontSize: '0.8rem',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                fontWeight: 800,
                border: '1.5px solid',
                borderColor: filterType === 'ALL_UNPAID' ? 'var(--primary)' : '#cbd5e1',
                background: filterType === 'ALL_UNPAID' ? 'var(--primary)' : '#ffffff',
                color: filterType === 'ALL_UNPAID' ? '#ffffff' : 'var(--text-primary)',
                cursor: 'pointer',
                boxShadow: filterType === 'ALL_UNPAID' ? '0 2px 8px rgba(59, 91, 219, 0.25)' : 'none'
              }}
            >
              ⚡ Tous les Retards & Impayés ({summaryCounts.allUnpaidCount})
            </button>

            <button
              type="button"
              onClick={() => setFilterType('ALL_OVERDUE')}
              style={{
                fontSize: '0.8rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontWeight: 800,
                border: '1.5px solid',
                borderColor: filterType === 'ALL_OVERDUE' ? '#ef4444' : '#fee2e2',
                background: filterType === 'ALL_OVERDUE' ? '#dc2626' : '#fef2f2',
                color: filterType === 'ALL_OVERDUE' ? '#ffffff' : '#dc2626',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: filterType === 'ALL_OVERDUE' ? '0 2px 8px rgba(220, 38, 38, 0.25)' : 'none'
              }}
            >
              <AlertTriangle size={14} />
              <span>🚨 Retards Échus ({summaryCounts.allOverdueCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('CRITICAL_7')}
              style={{
                fontSize: '0.8rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontWeight: 800,
                border: '1.5px solid',
                borderColor: filterType === 'CRITICAL_7' ? '#991b1b' : '#fca5a5',
                background: filterType === 'CRITICAL_7' ? '#991b1b' : '#fee2e2',
                color: filterType === 'CRITICAL_7' ? '#ffffff' : '#991b1b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: filterType === 'CRITICAL_7' ? '0 2px 8px rgba(153, 27, 27, 0.3)' : 'none'
              }}
            >
              <AlertOctagon size={14} />
              <span>🚨 Critiques &gt;7j ({summaryCounts.criticalCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('LIGHT_7')}
              style={{
                fontSize: '0.8rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontWeight: 800,
                border: '1.5px solid',
                borderColor: filterType === 'LIGHT_7' ? '#c2410c' : '#fed7aa',
                background: filterType === 'LIGHT_7' ? '#c2410c' : '#ffedd5',
                color: filterType === 'LIGHT_7' ? '#ffffff' : '#c2410c',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: filterType === 'LIGHT_7' ? '0 2px 8px rgba(194, 65, 12, 0.25)' : 'none'
              }}
            >
              <Clock size={14} />
              <span>⚠️ Retards Modérés 1-7j ({summaryCounts.moderateCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('DUE_SOON')}
              style={{
                fontSize: '0.8rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontWeight: 800,
                border: '1.5px solid',
                borderColor: filterType === 'DUE_SOON' ? '#b45309' : '#fde68a',
                background: filterType === 'DUE_SOON' ? '#b45309' : '#fef3c7',
                color: filterType === 'DUE_SOON' ? '#ffffff' : '#b45309',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: filterType === 'DUE_SOON' ? '0 2px 8px rgba(180, 83, 9, 0.25)' : 'none'
              }}
            >
              <Bell size={14} />
              <span>🔔 Échéances J-3 ({summaryCounts.dueSoonCount})</span>
            </button>
          </div>

          {/* Search and Class Filter Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
                <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '0.65rem' }} />
                <input
                  type="text"
                  placeholder="Rechercher élève, matricule, parent..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2.1rem', fontSize: '0.85rem' }}
                />
              </div>

              {/* Filter by class */}
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="form-select"
                style={{ fontSize: '0.825rem', padding: '0.45rem 0.75rem', maxWidth: '200px' }}
              >
                <option value="ALL">Toutes les classes ({classesList.length})</option>
                {classesList.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>

              {/* Reference Date Control */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.3rem 0.6rem' }}>
                <Calendar size={14} color="var(--primary)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Échéance au :</span>
                <input 
                  type="date" 
                  value={asOfDate} 
                  onChange={(e) => setAsOfDate(e.target.value)} 
                  style={{ fontSize: '0.8rem', padding: '0.2rem 0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#ffffff', color: '#0f172a' }}
                />
                <button 
                  type="button" 
                  onClick={() => {
                    const effDate = getEffectiveReferenceDate(undefined, feePlans);
                    const y = effDate.getFullYear();
                    const m = String(effDate.getMonth() + 1).padStart(2, '0');
                    const d = String(effDate.getDate()).padStart(2, '0');
                    setAsOfDate(`${y}-${m}-${d}`);
                  }} 
                  style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem', borderRadius: '4px', background: '#e2e8f0', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#334155' }}
                  title="Réinitialiser à la date d'aujourd'hui"
                >
                  Aujourd'hui
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => {
                  const rawOverdueStudents = filteredList.map(item => item.student);
                  exportUtils.exportOverdueToCSV(rawOverdueStudents, feePlans, payments, schoolConfig);
                }}
                className="btn btn-secondary no-print"
                style={{ fontSize: '0.775rem', padding: '0.4rem 0.75rem', background: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }}
                title="Exporter la liste des impayés et relances en fichier Excel/CSV"
              >
                <FileSpreadsheet size={14} color="#15803d" />
                <span>Exporter Excel</span>
              </button>

              <button
                onClick={() => window.print()}
                className="btn btn-secondary no-print"
                style={{ fontSize: '0.775rem', padding: '0.4rem 0.75rem' }}
                title="Imprimer l'état des impayés pour la Direction"
              >
                <Printer size={14} />
                <span>Imprimer le Bordereau</span>
              </button>
            </div>
          </div>

        </div>

        {/* Filter State Context Banner */}
        {filterType === 'CRITICAL_7' && (
          <div style={{
            margin: '1rem 1.25rem 0',
            background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
            border: '1.5px solid #f43f5e',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <AlertOctagon size={22} color="#be123c" />
              <div>
                <div style={{ fontWeight: 800, color: '#9f1239', fontSize: '0.925rem' }}>
                  🚨 Affichage des Cas Critiques (&gt; 7 Jours de Retard) : {filteredList.length} élève(s)
                </div>
                <div style={{ fontSize: '0.8rem', color: '#be123c', marginTop: '0.15rem' }}>
                  Ces dossiers ont dépassé leur date limite de plus d'une semaine. Priorité absolue pour relances téléphoniques directes.
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setFilterType('ALL_UNPAID')}
                className="btn btn-secondary"
                style={{ fontSize: '0.775rem', padding: '0.4rem 0.75rem', background: '#ffffff', color: '#9f1239', borderColor: '#fecdd3' }}
              >
                Afficher Tous les Impayés
              </button>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Élève & Matricule</th>
                <th>Classe</th>
                <th>Tranche(s) & Échéances Dépassées</th>
                <th>Statut Retard</th>
                <th>Montant en Retard (Échu)</th>
                <th>Reste Total Année</th>
                <th>Parent / Contact</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: 'var(--text-muted)' }}>
                    <CheckCircle2 size={40} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', marginBottom: '0.25rem' }}>
                      {filterType === 'ALL_OVERDUE'
                        ? "🎉 Aucun retard de paiement échu !"
                        : "Aucun dossier correspondant à ce filtre !"}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {filterType === 'ALL_OVERDUE'
                        ? "Tous les élèves sont à jour de leurs tranches échues. Consultez l'onglet 'Tous les Impayés' pour voir les échéances futures."
                        : "Tous les comptes sont à jour."}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const hasOverdue = item.overdueInstallments.length > 0;
                  const displayOverdueAmt = hasOverdue ? item.totalOverdueAmount : 0;

                  return (
                    <tr key={item.student.id} style={{ background: item.isCritical ? '#fff5f5' : item.isModerate ? '#fffaf5' : undefined }}>
                      <td>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
                          {item.student.lastName} {item.student.firstName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.1rem' }}>
                          {item.student.matricule}
                        </div>
                      </td>

                      <td>
                        <span style={{ fontWeight: 700, fontSize: '0.825rem', color: '#334155' }}>
                          {item.student.className}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          {item.unpaidInstallments.map((inst, idx) => {
                            const remainingInst = inst.amountDue - inst.amountPaid;
                            return (
                              <div 
                                key={idx} 
                                style={{ 
                                  fontSize: '0.75rem',
                                  padding: '0.2rem 0.45rem',
                                  borderRadius: '5px',
                                  background: inst.isCriticalOverdue ? '#fee2e2' : inst.isOverdue ? '#ffedd5' : inst.isDueSoon ? '#fef3c7' : '#f1f5f9',
                                  border: inst.isCriticalOverdue ? '1px solid #fca5a5' : inst.isOverdue ? '1px solid #fed7aa' : inst.isDueSoon ? '1px solid #fde68a' : '1px solid #e2e8f0',
                                  color: inst.isCriticalOverdue ? '#991b1b' : inst.isOverdue ? '#9a3412' : inst.isDueSoon ? '#92400e' : '#475569', 
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  gap: '0.5rem'
                                }}
                              >
                                <span>
                                  <strong>{inst.installment.title}</strong> ({formatCurrency(remainingInst, schoolConfig.currency)})
                                </span>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                                  {inst.isCriticalOverdue && `🚨 Retard : ${inst.daysOverdue}j`}
                                  {inst.isOverdue && !inst.isCriticalOverdue && `⚠️ Retard : ${inst.daysOverdue}j`}
                                  {inst.isDueSoon && !inst.isOverdue && `🔔 J-${inst.daysUntilDue}`}
                                  {!inst.isOverdue && !inst.isDueSoon && `📅 ${formatDate(inst.installment.dueDate)}`}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </td>

                      <td>
                        {item.isCritical ? (
                          <span className="badge" style={{
                            background: '#fee2e2',
                            color: '#dc2626',
                            borderColor: '#fca5a5',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '0.35rem 0.6rem',
                            fontSize: '0.75rem'
                          }}>
                            🚨 Critique (+{item.maxDaysOverdue}j &gt; 7j)
                          </span>
                        ) : item.isModerate ? (
                          <span className="badge" style={{
                            background: '#ffedd5',
                            color: '#c2410c',
                            borderColor: '#fed7aa',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '0.35rem 0.6rem',
                            fontSize: '0.75rem'
                          }}>
                            ⚠️ Retard (+{item.maxDaysOverdue}j)
                          </span>
                        ) : item.isDueSoon ? (
                          <span className="badge" style={{
                            background: '#fef3c7',
                            color: '#b45309',
                            borderColor: '#fde68a',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '0.35rem 0.6rem',
                            fontSize: '0.75rem'
                          }}>
                            🔔 Échéance J-{item.dueSoonInstallments[0]?.daysUntilDue ?? 3}
                          </span>
                        ) : (
                          <span className="badge" style={{
                            background: '#f1f5f9',
                            color: '#475569',
                            borderColor: '#e2e8f0',
                            fontWeight: 600,
                            padding: '0.3rem 0.5rem',
                            fontSize: '0.725rem'
                          }}>
                            ⏳ Non soldé (À venir)
                          </span>
                        )}
                      </td>

                      <td>
                        {displayOverdueAmt > 0 ? (
                          <div>
                            <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#dc2626' }}>
                              {formatCurrency(displayOverdueAmt, schoolConfig.currency)}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#dc2626', fontWeight: 700 }}>
                              🚨 Échéance dépassée
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            0 FCFA <span style={{ fontSize: '0.7rem' }}>(À échéance)</span>
                          </div>
                        )}
                      </td>

                      <td>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                          {formatCurrency(item.totalRemainingAmount, schoolConfig.currency)}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f172a' }}>{item.student.guardianName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.student.guardianPhone}</div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          <a
                            href={`https://wa.me/${item.student.guardianPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(getWhatsAppMessage(item))}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem', background: '#25D366', color: '#ffffff', borderColor: '#25D366', fontWeight: 700 }}
                            title="Envoyer une relance ciblée avec le montant du retard sur WhatsApp"
                          >
                            <Share2 size={13} />
                            <span>WhatsApp</span>
                          </a>

                          <button
                            onClick={() => onPayForStudent(item.student.id)}
                            className="btn btn-primary"
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: 700 }}
                            title="Régler immédiatement au guichet caisse"
                          >
                            <Coins size={14} />
                            <span>Régler</span>
                          </button>
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
  );
};
