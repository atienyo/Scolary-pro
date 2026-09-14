import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  ArrowUpDown, 
  Coins, 
  Receipt, 
  Eye, 
  Phone, 
  Mail, 
  Calendar,
  X,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Edit3,
  Trash2
} from 'lucide-react';
import { 
  Student, 
  ClassFeePlan, 
  PaymentTransaction, 
  SchoolConfig,
  SchoolLevel,
  PaymentStatus
} from '../types';
import { 
  formatCurrency, 
  calculateStudentFinancials, 
  getStatusBadge,
  formatDate,
  getMethodDetails
} from '../utils/formatters';
import { exportUtils } from '../utils/exportUtils';

interface StudentsViewProps {
  students: Student[];
  feePlans: ClassFeePlan[];
  payments: PaymentTransaction[];
  schoolConfig: SchoolConfig;
  onOpenNewStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent?: (studentId: string) => void;
  onPayForStudent: (studentId: string) => void;
  onViewReceipt: (payment: PaymentTransaction, remaining: number, total: number) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  feePlans,
  payments,
  schoolConfig,
  onOpenNewStudent,
  onEditStudent,
  onDeleteStudent,
  onPayForStudent,
  onViewReceipt,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Search term
      const matchesSearch = 
        !searchTerm.trim() ||
        s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.guardianName.toLowerCase().includes(searchTerm.toLowerCase());

      // Class filter
      const matchesClass = selectedClass === 'ALL' || s.classId === selectedClass;

      // Level filter
      const matchesLevel = selectedLevel === 'ALL' || s.level === selectedLevel;

      // Status filter
      if (selectedStatus !== 'ALL') {
        const fin = calculateStudentFinancials(s, feePlans, payments);
        if (selectedStatus !== fin.status) return false;
      }

      return matchesSearch && matchesClass && matchesLevel;
    });
  }, [students, searchTerm, selectedClass, selectedLevel, selectedStatus, feePlans, payments]);

  // Unique classes list
  const classesList = useMemo(() => {
    const map = new Map<string, string>();
    feePlans.forEach((p) => map.set(p.classId, p.className));
    return Array.from(map.entries());
  }, [feePlans]);

  // Student financial detail for modal
  const detailSummary = useMemo(() => {
    if (!detailStudent) return null;
    return calculateStudentFinancials(detailStudent, feePlans, payments);
  }, [detailStudent, feePlans, payments]);

  // Student payments for modal
  const detailPayments = useMemo(() => {
    if (!detailStudent) return [];
    return payments
      .filter((p) => p.studentId === detailStudent.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [detailStudent, payments]);

  return (
    <div className="page-wrapper">
      {/* Header & New Student Action */}
      <div className="view-header-flex">
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Annuaire & Scolarités des Élèves</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Consultez le dossier financier, le statut de paiement et l'historique complet de chaque élève.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => exportUtils.exportStudentsToCSV(filteredStudents, feePlans, payments, schoolConfig)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.65rem 1rem', background: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }}
            title="Exporter l'annuaire et la situation financière des élèves en Excel/CSV"
          >
            <FileSpreadsheet size={17} color="#15803d" />
            <span>Exporter Excel</span>
          </button>

          <button
            onClick={onOpenNewStudent}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.15rem' }}
          >
            <UserPlus size={18} />
            <span>Inscrire un Élève</span>
          </button>
        </div>
      </div>

      {/* Filters Bar Card */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="filters-grid-4">
          
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '0.75rem' }} />
            <input
              type="text"
              placeholder="Recherche nom, prénom, matricule, tuteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ width: '100%', paddingLeft: '2.4rem' }}
            />
          </div>

          {/* Filter Level */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="form-select"
          >
            <option value="ALL">Tous Niveaux (Collège & Lycée)</option>
            <option value="COLLEGE">Collège (6ème - 3ème)</option>
            <option value="LYCEE">Lycée (2nde - Tle)</option>
          </select>

          {/* Filter Class */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="form-select"
          >
            <option value="ALL">Toutes les classes</option>
            {classesList.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>

          {/* Filter Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="form-select"
          >
            <option value="ALL">Tous les Statuts</option>
            <option value="UP_TO_DATE">À jour (Soldé)</option>
            <option value="LATE">Retard modéré</option>
            <option value="CRITICAL">Impayé critique</option>
          </select>

        </div>
      </div>

      {/* Students Data Table */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
            {filteredStudents.length} élève(s) trouvé(s)
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Cliquez sur un élève pour consulter son dossier financier détaillé
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Matricule</th>
                <th>Élève</th>
                <th>Classe</th>
                <th>Total Dû</th>
                <th>Versé</th>
                <th>Reste à Payer</th>
                <th>Statut</th>
                <th>Contact Parent</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <Users size={38} style={{ margin: '0 auto 0.6rem', opacity: 0.35 }} />
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#334155' }}>Aucun élève trouvé</div>
                    <div style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>
                      {students.length === 0 
                        ? "Commencez par inscrire des élèves à l'aide du bouton « Inscrire un Élève »."
                        : "Aucun élève ne correspond aux critères de recherche actuels."}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const fin = calculateStudentFinancials(student, feePlans, payments);
                  const statusBadge = getStatusBadge(fin.status);

                  return (
                  <tr key={student.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                      {student.matricule}
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: student.gender === 'F' ? '#fce7f3' : '#e0f2fe',
                          color: student.gender === 'F' ? '#db2777' : '#0284c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.8rem'
                        }}>
                          {student.lastName.charAt(0)}{student.firstName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>
                            {student.lastName} {student.firstName}
                          </div>
                          {student.discountPercentage > 0 && (
                            <span style={{ fontSize: '0.68rem', background: '#fef3c7', color: '#b45309', padding: '1px 5px', borderRadius: '3px', fontWeight: 600 }}>
                              Réduction -{student.discountPercentage}%
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background: student.level === 'COLLEGE' ? '#eff6ff' : '#f0fdf4',
                        color: student.level === 'COLLEGE' ? '#1d4ed8' : '#15803d',
                        fontWeight: 700,
                        fontSize: '0.75rem'
                      }}>
                        {student.className}
                      </span>
                    </td>

                    <td style={{ fontWeight: 600 }}>
                      {formatCurrency(fin.totalDue, schoolConfig.currency)}
                    </td>

                    <td style={{ fontWeight: 700, color: '#059669' }}>
                      {formatCurrency(fin.totalPaid, schoolConfig.currency)}
                    </td>

                    <td style={{ fontWeight: 800, color: fin.remainingBalance > 0 ? '#dc2626' : '#059669' }}>
                      {fin.remainingBalance > 0 ? formatCurrency(fin.remainingBalance, schoolConfig.currency) : '0 FCFA (Soldé)'}
                    </td>

                    <td>
                      <span className="badge" style={{
                        background: statusBadge.bg,
                        color: statusBadge.text,
                        borderColor: statusBadge.border
                      }}>
                        {statusBadge.label}
                        {fin.daysLate > 0 && ` (${fin.daysLate}j)`}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {student.guardianName}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {student.guardianPhone}
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <button
                          onClick={() => onEditStudent(student)}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          title="Modifier les informations de cet élève"
                        >
                          <Edit3 size={13} color="var(--primary)" />
                          <span>Modifier</span>
                        </button>

                        <button
                          onClick={() => setDetailStudent(student)}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                          title="Voir le dossier financier complet"
                        >
                          <Eye size={14} />
                          <span>Dossier</span>
                        </button>

                        {fin.remainingBalance > 0 && (
                          <button
                            onClick={() => onPayForStudent(student.id)}
                            className="btn btn-primary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                            title="Encaisser au guichet"
                          >
                            <Coins size={14} />
                            <span>Encaisser</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Ledger Modal */}
      {detailStudent && detailSummary && (
        <div className="modal-overlay" onClick={() => setDetailStudent(null)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '720px' }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--primary)' }}>
                  DOSSIER FINANCIER ÉLÈVE
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  {detailStudent.lastName} {detailStudent.firstName} ({detailStudent.className})
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <button
                  onClick={() => {
                    const target = detailStudent;
                    setDetailStudent(null);
                    onEditStudent(target);
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  title="Modifier les informations de l'élève"
                >
                  <Edit3 size={14} color="var(--primary)" />
                  <span>Modifier Dossier</span>
                </button>

                {onDeleteStudent && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le dossier de ${detailStudent.lastName} ${detailStudent.firstName} ?`)) {
                        onDeleteStudent(detailStudent.id);
                        setDetailStudent(null);
                      }
                    }}
                    className="btn btn-outline"
                    style={{ padding: '0.4rem 0.65rem', fontSize: '0.78rem', color: '#dc2626', borderColor: '#fecaca' }}
                    title="Supprimer cet élève"
                  >
                    <Trash2 size={14} />
                  </button>
                )}

                <button
                  onClick={() => setDetailStudent(null)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#e2e8f0'
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Top overview chips */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                background: '#f1f5f9',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Annuel Dû</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{formatCurrency(detailSummary.totalDue, schoolConfig.currency)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#059669', textTransform: 'uppercase', fontWeight: 700 }}>Total Déjà Encaissé</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669' }}>{formatCurrency(detailSummary.totalPaid, schoolConfig.currency)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#dc2626', textTransform: 'uppercase', fontWeight: 700 }}>Solde Restant Dû</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: detailSummary.remainingBalance > 0 ? '#dc2626' : '#059669' }}>
                    {formatCurrency(detailSummary.remainingBalance, schoolConfig.currency)}
                  </div>
                </div>
              </div>

              {/* Installments Breakdown */}
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                  Échéancier & Tranches de Scolarité
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {detailSummary.installmentsStatus.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        background: item.isSettled ? '#f0fdf4' : item.isOverdue ? '#fef2f2' : '#ffffff',
                        border: `1px solid ${item.isSettled ? '#a7f3d0' : item.isOverdue ? '#fecaca' : '#e2e8f0'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{item.installment.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Échéance : {formatDate(item.installment.dueDate)}
                          {item.isOverdue && <span style={{ color: '#dc2626', fontWeight: 700, marginLeft: '0.4rem' }}>(Retard {item.daysOverdue} j)</span>}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: item.isSettled ? '#059669' : '#0f172a' }}>
                          {item.isSettled ? 'ACQUITTÉ' : `${formatCurrency(item.amountDue - item.amountPaid, schoolConfig.currency)} restant`}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          Montant dû : {formatCurrency(item.amountDue, schoolConfig.currency)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* History of Receipts */}
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                  Historique des Quittances Délivrées ({detailPayments.length})
                </h4>

                {detailPayments.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Aucun versement n'a encore été enregistré pour cet élève.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {detailPayments.map((p) => {
                      const method = getMethodDetails(p.method);
                      return (
                        <div
                          key={p.id}
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            background: '#f8fafc',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                              {p.receiptNumber}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {formatDate(p.timestamp, true)} • {p.installmentTarget}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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

                            <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                              {formatCurrency(p.amount, schoolConfig.currency)}
                            </span>

                            <button
                              onClick={() => {
                                onViewReceipt(p, detailSummary.remainingBalance, detailSummary.totalDue);
                              }}
                              className="btn btn-outline"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            >
                              <Receipt size={14} />
                              <span>Reçu</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-color)',
              background: '#f8fafc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Parent : <strong>{detailStudent.guardianName}</strong> ({detailStudent.guardianPhone})
              </div>

              {detailSummary.remainingBalance > 0 && (
                <button
                  onClick={() => {
                    setDetailStudent(null);
                    onPayForStudent(detailStudent.id);
                  }}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Coins size={16} />
                  <span>Encaisser un versement</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
