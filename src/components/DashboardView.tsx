import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  Wallet, 
  AlertOctagon, 
  Users, 
  CreditCard, 
  ArrowUpRight, 
  Calendar,
  Building,
  GraduationCap,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet
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
  getMethodDetails,
  formatDate
} from '../utils/formatters';
import { exportUtils } from '../utils/exportUtils';

interface DashboardViewProps {
  students: Student[];
  feePlans: ClassFeePlan[];
  payments: PaymentTransaction[];
  schoolConfig: SchoolConfig;
  onNavigateToTab: (tab: string) => void;
  onViewReceipt: (payment: PaymentTransaction) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  feePlans,
  payments,
  schoolConfig,
  onNavigateToTab,
  onViewReceipt,
}) => {
  // Aggregate financial metrics
  const stats = useMemo(() => {
    let totalExpected = 0;
    let totalCollected = 0;
    let collegeExpected = 0;
    let collegeCollected = 0;
    let lyceeExpected = 0;
    let lyceeCollected = 0;
    let upToDateCount = 0;
    let lateCount = 0;
    let criticalCount = 0;

    students.forEach((student) => {
      const summary = calculateStudentFinancials(student, feePlans, payments);
      totalExpected += summary.totalDue;
      totalCollected += summary.totalPaid;

      if (student.level === 'COLLEGE') {
        collegeExpected += summary.totalDue;
        collegeCollected += summary.totalPaid;
      } else {
        lyceeExpected += summary.totalDue;
        lyceeCollected += summary.totalPaid;
      }

      if (summary.status === 'UP_TO_DATE' || summary.status === 'OVERPAID') {
        upToDateCount++;
      } else if (summary.status === 'LATE') {
        lateCount++;
      } else if (summary.status === 'CRITICAL') {
        criticalCount++;
      }
    });

    const totalRemaining = Math.max(0, totalExpected - totalCollected);
    const globalRecoveryRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;
    const collegeRate = collegeExpected > 0 ? (collegeCollected / collegeExpected) * 100 : 0;
    const lyceeRate = lyceeExpected > 0 ? (lyceeCollected / lyceeExpected) * 100 : 0;

    // Payment methods breakdown
    const methodTotals: Record<string, number> = {};
    payments.forEach((p) => {
      methodTotals[p.method] = (methodTotals[p.method] || 0) + p.amount;
    });

    return {
      totalExpected,
      totalCollected,
      totalRemaining,
      globalRecoveryRate: Number(globalRecoveryRate.toFixed(1)),
      collegeExpected,
      collegeCollected,
      collegeRate: Number(collegeRate.toFixed(1)),
      lyceeExpected,
      lyceeCollected,
      lyceeRate: Number(lyceeRate.toFixed(1)),
      upToDateCount,
      lateCount,
      criticalCount,
      totalStudents: students.length,
      methodTotals,
    };
  }, [students, feePlans, payments]);

  // Recent payments
  const recentPayments = useMemo(() => {
    return [...payments].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 6);
  }, [payments]);

  return (
    <div className="page-wrapper">
      {/* Welcome Title */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Tableau de Bord Financier</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Aperçu global de la trésorerie et de l'état de recouvrement des scolarités • Année {schoolConfig.academicYear}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => onNavigateToTab('cashier')}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <TrendingUp size={16} />
            <span>Guichet Encaissement</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1.25rem',
        marginBottom: '1.75rem'
      }}>
        {/* Card 1: Total Attendu */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Facturation Totale
            </span>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#edf2ff',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
            {formatCurrency(stats.totalExpected, schoolConfig.currency)}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            Base scolarité ({stats.totalStudents} élèves inscrits)
          </div>
        </div>

        {/* Card 2: Total Encaissé */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
              Total Encaissé (Caisse)
            </span>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Wallet size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#059669', marginBottom: '0.35rem' }}>
            {formatCurrency(stats.totalCollected, schoolConfig.currency)}
          </div>
          <div style={{ fontSize: '0.775rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <ArrowUpRight size={14} />
            <span>Fonds consolidés en banque et caisses</span>
          </div>
        </div>

        {/* Card 3: Reste à Recouvrer */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>
              Reste à Recouvrer
            </span>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertOctagon size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#dc2626', marginBottom: '0.35rem' }}>
            {formatCurrency(stats.totalRemaining, schoolConfig.currency)}
          </div>
          <div style={{ fontSize: '0.775rem', color: '#dc2626' }}>
            Dont tranches échues non réglées
          </div>
        </div>

        {/* Card 4: Taux de Recouvrement */}
        <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              Taux de Recouvrement
            </span>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(59, 91, 219, 0.4)',
              color: '#93c5fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.4rem' }}>
            {stats.globalRecoveryRate}%
          </div>
          {/* Progress bar */}
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.15)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{
              width: `${stats.globalRecoveryRate}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #10b981 0%, #38bdf8 100%)',
              borderRadius: '999px'
            }} />
          </div>
        </div>
      </div>

      {/* Critical Alert Notice if late students exist */}
      {stats.criticalCount > 0 && (
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.4rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#92400e', fontSize: '0.92rem' }}>
                Alerte Trésorerie : {stats.criticalCount} élève(s) ont un retard critique d'échéance (&gt; 30 jours)
              </div>
              <div style={{ fontSize: '0.8rem', color: '#b45309' }}>
                Des relances automatisées par SMS et WhatsApp sont prêtes à être envoyées aux parents tuteurs.
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('overdue')}
            className="btn btn-secondary"
            style={{
              background: '#ffffff',
              border: '1px solid #fde68a',
              color: '#92400e',
              fontWeight: 700,
              fontSize: '0.825rem'
            }}
          >
            Lancer les Relances
          </button>
        </div>
      )}

      {/* Grid: Level Breakdown + Payment Methods */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.5rem', marginBottom: '1.75rem' }}>
        
        {/* Level Performance: Collège vs Lycée */}
        <div className="card">
          <div className="card-header">
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Recouvrement par Niveau d'Enseignement</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Comparatif Collège (6ème à 3ème) vs Lycée (2nde à Terminale)</div>
            </div>
          </div>

          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Collège */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building size={16} color="var(--primary)" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>COLLÈGE (6ème - 3ème)</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>{stats.collegeRate}%</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                    ({formatCurrency(stats.collegeCollected, schoolConfig.currency)} / {formatCurrency(stats.collegeExpected, schoolConfig.currency)})
                  </span>
                </div>
              </div>
              <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{
                  width: `${stats.collegeRate}%`,
                  height: '100%',
                  background: 'var(--primary)',
                  borderRadius: '999px',
                }} />
              </div>
            </div>

            {/* Lycée */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <GraduationCap size={16} color="#0ea5e9" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>LYCÉE (2nde - Terminale)</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 800, color: '#0ea5e9', fontSize: '0.95rem' }}>{stats.lyceeRate}%</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                    ({formatCurrency(stats.lyceeCollected, schoolConfig.currency)} / {formatCurrency(stats.lyceeExpected, schoolConfig.currency)})
                  </span>
                </div>
              </div>
              <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{
                  width: `${stats.lyceeRate}%`,
                  height: '100%',
                  background: '#0ea5e9',
                  borderRadius: '999px',
                }} />
              </div>
            </div>

            {/* Student Payment Health Pie/Bar preview */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              textAlign: 'center',
              gap: '0.75rem'
            }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>{stats.upToDateCount}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>À JOUR</div>
              </div>
              <div style={{ borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706' }}>{stats.lateCount}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>RETARD MODÉRÉ</div>
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#dc2626' }}>{stats.criticalCount}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>IMPAYÉ CRITIQUE</div>
              </div>
            </div>

          </div>
        </div>

        {/* Payment Channels (Mobile Money vs Espèces vs Chèque) */}
        <div className="card">
          <div className="card-header">
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Modes d'Encaissement Utilisés</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Répartition des flux réels de caisse</div>
            </div>
          </div>

          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {Object.keys(stats.methodTotals).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <Wallet size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.35 }} />
                <div>Aucun encaissement enregistré pour le moment.</div>
              </div>
            ) : (
              Object.entries(stats.methodTotals).map(([methodKey, amount]) => {
                const details = getMethodDetails(methodKey as any);
                const pct = stats.totalCollected > 0 ? ((amount / stats.totalCollected) * 100).toFixed(1) : '0';

                return (
                  <div key={methodKey} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#f8fafc',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: details.bg,
                        color: details.color
                      }}>
                        {details.label}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pct}% du total</span>
                    </div>

                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                      {formatCurrency(amount, schoolConfig.currency)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Recent Payments Table */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Dernières Transactions & Quittances Émises</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Flux temps réel des opérations de caisse</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => exportUtils.exportPaymentsToCSV(payments, schoolConfig)}
              className="btn btn-secondary"
              style={{ fontSize: '0.775rem', padding: '0.4rem 0.75rem', background: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }}
              title="Exporter tout l'historique des encaissements au format Excel/CSV"
            >
              <FileSpreadsheet size={14} color="#15803d" />
              <span>Exporter Journal Excel</span>
            </button>

            <button
              onClick={() => onNavigateToTab('cashier')}
              className="btn btn-primary"
              style={{ fontSize: '0.775rem', padding: '0.4rem 0.75rem' }}
            >
              Ouvrir la caisse
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>N° Reçu</th>
                <th>Date & Heure</th>
                <th>Élève</th>
                <th>Classe</th>
                <th>Tranche Ciblée</th>
                <th>Moyen</th>
                <th>Montant</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    <FileText size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.35 }} />
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>Aucune transaction enregistrée</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>Les encaissements de caisse apparaîtront ici dès leur saisie.</div>
                  </td>
                </tr>
              ) : (
                recentPayments.map((p) => {
                  const method = getMethodDetails(p.method);
                  return (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                        {p.receiptNumber}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {formatDate(p.timestamp, true)}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{p.studentName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {p.studentMatricule}
                        </div>
                      </td>
                      <td>{p.className}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{p.installmentTarget}</td>
                      <td>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: method.bg,
                          color: method.color
                        }}>
                          {method.label}
                        </span>
                      </td>
                      <td style={{ fontWeight: 800, color: '#0f172a' }}>
                        {formatCurrency(p.amount, schoolConfig.currency)}
                      </td>
                      <td>
                        <button
                          onClick={() => onViewReceipt(p)}
                          className="btn btn-outline"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          Consulter
                        </button>
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
