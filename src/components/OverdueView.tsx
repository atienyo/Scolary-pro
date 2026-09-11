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
  Clock
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
  formatDate 
} from '../utils/formatters';
import { exportUtils } from '../utils/exportUtils';

interface OverdueViewProps {
  students: Student[];
  feePlans: ClassFeePlan[];
  payments: PaymentTransaction[];
  schoolConfig: SchoolConfig;
  onPayForStudent: (studentId: string) => void;
}

export const OverdueView: React.FC<OverdueViewProps> = ({
  students,
  feePlans,
  payments,
  schoolConfig,
  onPayForStudent,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [filterDays, setFilterDays] = useState<string>('ALL'); // 'ALL' | 'CRITICAL_30' | 'LIGHT_15'
  const [activeTab, setActiveTab] = useState<'LIST' | 'BATCH_REMINDERS'>('LIST');
  const [isSimulatingSend, setIsSimulatingSend] = useState<boolean>(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);

  // SMS Template
  const [smsTemplate, setSmsTemplate] = useState<string>(
    `[${schoolConfig.shortName}] Cher parent, sauf erreur de notre part, l'échéance de scolarité pour votre enfant {ELEVE} ({CLASSE}) d'un montant de {MONTANT} est dépassée. Merci de vous rapprocher de l'intendance ou de régler par Wave/Orange Money. Info: ${schoolConfig.phone}`
  );

  // Overdue students list
  const overdueList = useMemo(() => {
    return students
      .map((student) => {
        const fin = calculateStudentFinancials(student, feePlans, payments);
        const overdueInstallments = fin.installmentsStatus.filter((i) => i.isOverdue);
        return {
          student,
          financials: fin,
          overdueInstallments,
          totalOverdueAmount: overdueInstallments.reduce((acc, i) => acc + (i.amountDue - i.amountPaid), 0),
          maxDaysOverdue: overdueInstallments.length > 0 ? Math.max(...overdueInstallments.map((i) => i.daysOverdue)) : 0,
        };
      })
      .filter((item) => item.overdueInstallments.length > 0)
      .filter((item) => {
        if (selectedClass !== 'ALL' && item.student.classId !== selectedClass) return false;
        if (filterDays === 'CRITICAL_30' && item.maxDaysOverdue <= 30) return false;
        if (filterDays === 'LIGHT_15' && item.maxDaysOverdue > 30) return false;
        return true;
      })
      .sort((a, b) => b.maxDaysOverdue - a.maxDaysOverdue);
  }, [students, feePlans, payments, selectedClass, filterDays]);

  // Aggregate sum of unpaid arrears
  const totalArrears = useMemo(() => {
    return overdueList.reduce((acc, item) => acc + item.totalOverdueAmount, 0);
  }, [overdueList]);

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
        `✅ Campagne envoyée avec succès : ${overdueList.length} SMS et notifications WhatsApp ont été distribués aux tuteurs légaux !`
      );
    }, 1800);
  };

  return (
    <div className="page-wrapper">
      {/* Top Header */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{
              background: '#fef2f2',
              color: '#dc2626',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <AlertTriangle size={14} />
              RECOUVREMENT & IMPAYÉS
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Gestion des Impayés & Relances Parents</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Identifiez les échéances échues, suivez l'ancienneté de la dette et déclenchez des relances automatisées.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setActiveTab(activeTab === 'LIST' ? 'BATCH_REMINDERS' : 'LIST')}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <MessageSquare size={16} />
            <span>{activeTab === 'LIST' ? 'Module Relances SMS / WhatsApp' : 'Retour à la Liste'}</span>
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

      {/* Metrics Summary Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1.25rem',
        marginBottom: '1.75rem'
      }}>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Montant Total des Arriérés Échus
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#dc2626', marginTop: '0.35rem' }}>
            {formatCurrency(totalArrears, schoolConfig.currency)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Cumul des tranches dont la date limite est expirée
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Nombre d'Élèves Concernés
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#d97706', marginTop: '0.35rem' }}>
            {overdueList.length} élèves
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Sur {students.length} élèves inscrits ({((overdueList.length / students.length) * 100).toFixed(0)}% de l'effectif)
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #3b5bdb' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Cas Critiques (&gt; 30 Jours)
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#3b5bdb', marginTop: '0.35rem' }}>
            {overdueList.filter((i) => i.maxDaysOverdue > 30).length} dossiers
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Nécessitent un avis d'exclusion temporaire ou moratoire
          </div>
        </div>
      </div>

      {activeTab === 'BATCH_REMINDERS' ? (
        /* BATCH REMINDER SUITE */
        <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Centre de Diffusion des Relances SMS & WhatsApp</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Personnalisez le message de rappel et diffusez-le en un clic aux {overdueList.length} parents débiteurs.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem' }}>
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
                  disabled={isSimulatingSend || overdueList.length === 0}
                  onClick={handleTriggerBatchSend}
                  className="btn btn-primary"
                  style={{ padding: '0.8rem 1.4rem', fontWeight: 800, fontSize: '0.95rem' }}
                >
                  <Send size={18} />
                  <span>{isSimulatingSend ? 'Envoi en cours...' : `Diffuser la relance (${overdueList.length} destinataires)`}</span>
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
                    .replace('{ELEVE}', overdueList[0]?.student ? `${overdueList[0].student.lastName} ${overdueList[0].student.firstName}` : 'ÉLÈVE EXEMPLE')
                    .replace('{CLASSE}', overdueList[0]?.student.className || 'Classe')
                    .replace('{MONTANT}', formatCurrency(overdueList[0]?.totalOverdueAmount || 50000, schoolConfig.currency))
                  }
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={14} color="#10b981" />
                <span>Routage opérateur garanti (Orange, MTN, Moov)</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Overdue Table Section */}
      <div className="card">
        {/* Filters Header */}
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
              Détail des {overdueList.length} Échéances Dépassées
            </div>

            {/* Filter by class */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="form-select"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
            >
              <option value="ALL">Toutes les classes</option>
              {classesList.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>

            {/* Filter by age */}
            <select
              value={filterDays}
              onChange={(e) => setFilterDays(e.target.value)}
              className="form-select"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
            >
              <option value="ALL">Tout niveau de retard</option>
              <option value="CRITICAL_30">Retards critiques (&gt; 30 jours)</option>
              <option value="LIGHT_15">Retards modérés (1 à 30 jours)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => {
                const rawOverdueStudents = overdueList.map(item => item.student);
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

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Élève & Matricule</th>
                <th>Classe</th>
                <th>Tranche(s) Échue(s)</th>
                <th>Date Limite</th>
                <th>Retard</th>
                <th>Montant Échu</th>
                <th>Parent / Contact</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {overdueList.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    🎉 Aucune échéance en retard pour les critères sélectionnés !
                  </td>
                </tr>
              ) : (
                overdueList.map((item) => (
                  <tr key={item.student.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>
                        {item.student.lastName} {item.student.firstName}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {item.student.matricule}
                      </div>
                    </td>

                    <td>
                      <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{item.student.className}</span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        {item.overdueInstallments.map((inst, idx) => (
                          <span key={idx} style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 600 }}>
                            • {inst.installment.title}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {formatDate(item.overdueInstallments[0]?.installment.dueDate)}
                    </td>

                    <td>
                      <span className="badge" style={{
                        background: item.maxDaysOverdue > 30 ? '#fef2f2' : '#fffbeb',
                        color: item.maxDaysOverdue > 30 ? '#dc2626' : '#d97706',
                        borderColor: item.maxDaysOverdue > 30 ? '#fecaca' : '#fde68a',
                        fontWeight: 800
                      }}>
                        {item.maxDaysOverdue} jours
                      </span>
                    </td>

                    <td style={{ fontWeight: 800, fontSize: '0.95rem', color: '#dc2626' }}>
                      {formatCurrency(item.totalOverdueAmount, schoolConfig.currency)}
                    </td>

                    <td>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.student.guardianName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.student.guardianPhone}</div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <a
                          href={`https://wa.me/${item.student.guardianPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            smsTemplate
                              .replace('{ELEVE}', `${item.student.lastName} ${item.student.firstName}`)
                              .replace('{CLASSE}', item.student.className)
                              .replace('{MONTANT}', formatCurrency(item.totalOverdueAmount, schoolConfig.currency))
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', background: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' }}
                          title="Envoyer un rappel direct sur WhatsApp"
                        >
                          <Share2 size={13} />
                          <span>WhatsApp</span>
                        </a>

                        <button
                          onClick={() => onPayForStudent(item.student.id)}
                          className="btn btn-primary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          title="Régler immédiatement au guichet"
                        >
                          <Coins size={14} />
                          <span>Régler</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
