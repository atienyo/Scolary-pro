import React, { useState, useMemo } from 'react';
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
  AlertCircle
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
  formatDate
} from '../utils/formatters';

interface CashierViewProps {
  students: Student[];
  feePlans: ClassFeePlan[];
  payments: PaymentTransaction[];
  schoolConfig: SchoolConfig;
  activeCashierName: string;
  onPaymentSuccess: (payment: PaymentTransaction) => void;
  onViewReceipt: (payment: PaymentTransaction, remaining: number, total: number) => void;
}

export const CashierView: React.FC<CashierViewProps> = ({
  students,
  feePlans,
  payments,
  schoolConfig,
  activeCashierName,
  onPaymentSuccess,
  onViewReceipt,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('WAVE');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [targetInstallment, setTargetInstallment] = useState<string>('Tranche courante');
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students.slice(0, 8);
    const term = searchTerm.toLowerCase();
    return students.filter(
      (s) =>
        s.firstName.toLowerCase().includes(term) ||
        s.lastName.toLowerCase().includes(term) ||
        s.matricule.toLowerCase().includes(term) ||
        s.className.toLowerCase().includes(term)
    );
  }, [students, searchTerm]);

  // Selected student details & financial summary
  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

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

  // Calculate change for cash payments
  const cashChange = useMemo(() => {
    if (paymentMethod !== 'ESPECES' || !cashGiven || cashGiven < paymentAmount) {
      return 0;
    }
    return cashGiven - paymentAmount;
  }, [paymentMethod, cashGiven, paymentAmount]);

  // Handle submit payment
  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || paymentAmount <= 0) return;

    // Generate unique receipt number
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const receiptNum = `REC-24-${randomSeq}`;

    const newPayment: PaymentTransaction = {
      id: `pay-${Date.now()}`,
      receiptNumber: receiptNum,
      studentId: selectedStudent.id,
      studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
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

    // Trigger celebration confetti
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#3b5bdb', '#10b981', '#0ea5e9']
    });

    onPaymentSuccess(newPayment);

    // Automatically trigger receipt modal
    const remaining = Math.max(0, (financialSummary?.remainingBalance || 0) - paymentAmount);
    onViewReceipt(newPayment, remaining, financialSummary?.totalDue || 0);

    // Reset form
    setPaymentAmount(0);
    setTransactionRef('');
    setNotes('');
    setCashGiven(0);
  };

  // Recent payments recorded today
  const recentCashierPayments = useMemo(() => {
    return [...payments].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);
  }, [payments]);

  return (
    <div className="page-wrapper">
      {/* Top Banner Header */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{
              background: '#ecfdf5',
              color: '#059669',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }} />
              GUICHET ACTIF
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>• {activeCashierName}</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Guichet Caisse Flash</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Enregistrez un encaissement en quelques secondes avec délivrance immédiate de la quittance certifiée.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Column: Student Selector & Ledger */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Quick Search Student Box */}
          <div className="card">
            <div className="card-header" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <User size={16} color="var(--primary)" />
                <span>Sélection de l'élève</span>
              </div>
            </div>
            
            <div style={{ padding: '1.1rem' }}>
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '0.7rem' }} />
                <input
                  type="text"
                  placeholder="Tapez le nom ou matricule..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2.2rem' }}
                />
              </div>

              {/* Student choices list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '260px', overflowY: 'auto' }}>
                {filteredStudents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    <User size={28} style={{ margin: '0 auto 0.4rem', opacity: 0.35 }} />
                    <div>{students.length === 0 ? "Aucun élève enregistré." : "Aucun élève correspondant."}</div>
                  </div>
                ) : (
                  filteredStudents.map((s) => {
                    const isSelected = s.id === selectedStudentId;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedStudentId(s.id)}
                        style={{
                          padding: '0.65rem 0.85rem',
                          borderRadius: 'var(--radius-md)',
                          background: isSelected ? '#edf2ff' : '#f8fafc',
                          border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                            {s.lastName} {s.firstName}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {s.matricule} • {s.className}
                          </div>
                        </div>

                        {s.discountPercentage > 0 && (
                          <span style={{ fontSize: '0.68rem', background: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            -{s.discountPercentage}%
                          </span>
                        )}
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
              <div className="card-header" style={{ padding: '1rem 1.25rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Situation Financière de l'Élève</div>
                <span className="badge" style={{
                  background: financialSummary.remainingBalance === 0 ? '#ecfdf5' : '#fef2f2',
                  color: financialSummary.remainingBalance === 0 ? '#059669' : '#dc2626',
                  border: `1px solid ${financialSummary.remainingBalance === 0 ? '#a7f3d0' : '#fecaca'}`
                }}>
                  {financialSummary.remainingBalance === 0 ? 'Totalement Soldé' : `Reste: ${formatCurrency(financialSummary.remainingBalance, schoolConfig.currency)}`}
                </span>
              </div>

              <div style={{ padding: '1.25rem' }}>
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
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedStudent.guardianName} ({selectedStudent.guardianRelation})</div>
                    <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
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
                      padding: '0.3rem 0.6rem',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontWeight: 700
                    }}
                  >
                    WhatsApp
                  </a>
                </div>

                {/* Installments Table */}
                <div style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  Échéancier & Tranches
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
                          border: `1px solid ${isFullyPaid ? '#a7f3d0' : item.isOverdue ? '#fecaca' : '#e2e8f0'}`,
                          background: isFullyPaid ? '#f0fdf4' : item.isOverdue ? '#fff5f5' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.installment.title}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            Échéance : {formatDate(item.installment.dueDate)}
                            {item.isOverdue && (
                              <span style={{ color: '#dc2626', fontWeight: 700, marginLeft: '0.35rem' }}>
                                (En retard de {item.daysOverdue} j)
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, color: isFullyPaid ? '#059669' : '#0f172a' }}>
                            {isFullyPaid ? 'SOLDÉ' : formatCurrency(dueAmt, schoolConfig.currency)}
                          </div>
                          {!isFullyPaid && (
                            <button
                              type="button"
                              onClick={() => handleQuickAmount(dueAmt, item.installment.title)}
                              style={{
                                fontSize: '0.68rem',
                                color: 'var(--primary)',
                                fontWeight: 700,
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                marginTop: '0.15rem'
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{ border: '2px solid #3b5bdb', boxShadow: '0 8px 30px rgba(59, 91, 219, 0.08)' }}>
            <div className="card-header" style={{ background: '#edf2ff', borderBottom: '1px solid #dbe4ff', padding: '1.1rem 1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800, color: '#3b5bdb', letterSpacing: '0.05em' }}>
                  TERMINAL D'ENCAISSEMENT DIRECT
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  {selectedStudent ? `${selectedStudent.lastName} ${selectedStudent.firstName} (${selectedStudent.className})` : 'Aucun élève sélectionné'}
                </div>
              </div>

              {financialSummary && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: '#475569' }}>Solde restant dû :</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#dc2626' }}>
                    {formatCurrency(financialSummary.remainingBalance, schoolConfig.currency)}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleProcessPayment} style={{ padding: '1.5rem' }}>
              
              {/* Quick Amount Suggestion Buttons */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                  Boutons rapides d'encaissement
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                  {financialSummary?.installmentsStatus
                    .filter(i => !i.isSettled)
                    .map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickAmount(item.amountDue - item.amountPaid, item.installment.title)}
                        className="btn btn-secondary"
                        style={{
                          fontSize: '0.8rem',
                          padding: '0.45rem 0.8rem',
                          border: paymentAmount === (item.amountDue - item.amountPaid) ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                          background: paymentAmount === (item.amountDue - item.amountPaid) ? '#edf2ff' : '#f8fafc',
                          color: paymentAmount === (item.amountDue - item.amountPaid) ? 'var(--primary)' : 'inherit',
                          fontWeight: 700
                        }}
                      >
                        {item.installment.title} ({formatCurrency(item.amountDue - item.amountPaid, schoolConfig.currency)})
                      </button>
                    ))}
                  
                  {financialSummary && financialSummary.remainingBalance > 0 && (
                    <button
                      type="button"
                      onClick={() => handleQuickAmount(financialSummary.remainingBalance, 'Solde Total Année')}
                      className="btn btn-secondary"
                      style={{
                        fontSize: '0.8rem',
                        padding: '0.45rem 0.8rem',
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        color: '#059669',
                        fontWeight: 800
                      }}
                    >
                      ✨ Tout Solder ({formatCurrency(financialSummary.remainingBalance, schoolConfig.currency)})
                    </button>
                  )}
                </div>
              </div>

              {/* Payment Amount Input */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                    Montant à encaisser ({schoolConfig.currency}) *
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="number"
                      required
                      min={1000}
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
                  <label className="form-label">Désignation / Cible</label>
                  <input
                    type="text"
                    value={targetInstallment}
                    onChange={(e) => setTargetInstallment(e.target.value)}
                    placeholder="Ex: 1ère Tranche, Solde"
                    className="form-input"
                    style={{ height: '56px', fontSize: '0.95rem' }}
                  />
                </div>
              </div>

              {/* Payment Methods Selector */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ marginBottom: '0.6rem', display: 'block' }}>
                  Moyen de règlement *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                  {[
                    { id: 'WAVE', label: 'Wave Mobile', color: '#0284c7', bg: '#e0f2fe', icon: Smartphone },
                    { id: 'ORANGE_MONEY', label: 'Orange Money', color: '#ea580c', bg: '#ffedd5', icon: Smartphone },
                    { id: 'MTN_MOMO', label: 'MTN MoMo', color: '#ca8a04', bg: '#fef9c3', icon: Smartphone },
                    { id: 'ESPECES', label: 'Espèces (Caisse)', color: '#16a34a', bg: '#dcfce7', icon: Banknote },
                    { id: 'CHEQUE', label: 'Chèque', color: '#6366f1', bg: '#e0e7ff', icon: FileText },
                    { id: 'VIREMENT_BANCAIRE', label: 'Virement', color: '#4338ca', bg: '#ede9fe', icon: CreditCard },
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
                          fontWeight: 700,
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

              {/* Dynamic Sub-form: Cash Change Calculator OR Transaction Reference */}
              {paymentMethod === 'ESPECES' ? (
                <div style={{
                  background: '#f0fdf4',
                  border: '1.5px solid #a7f3d0',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ fontWeight: 800, color: '#166534', fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calculator size={17} />
                    Calculatrice de Rendu de Monnaie (Espèces)
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#166534', display: 'block', marginBottom: '0.3rem' }}>
                        Montant remis par le parent :
                      </label>
                      <input
                        type="number"
                        placeholder="Ex: 50000"
                        value={cashGiven || ''}
                        onChange={(e) => setCashGiven(Number(e.target.value))}
                        className="form-input"
                        style={{ fontSize: '1.2rem', fontWeight: 800, borderColor: '#86efac' }}
                      />
                    </div>

                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #86efac',
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>
                        Monnaie à rendre
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: cashChange > 0 ? '#16a34a' : '#0f172a' }}>
                        {formatCurrency(cashChange, schoolConfig.currency)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">
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
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  opacity: paymentAmount <= 0 ? 0.6 : 1,
                  cursor: paymentAmount <= 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <CheckCircle2 size={22} />
                <span>Valider le Paiement & Émettre la Quittance</span>
              </button>

            </form>
          </div>

          {/* Today's Transactions Log for the Cashier */}
          <div className="card">
            <div className="card-header">
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Derniers Reçus Émis au Guichet</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Session en cours</span>
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCashierPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        <Receipt size={28} style={{ margin: '0 auto 0.4rem', opacity: 0.35 }} />
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Aucun reçu émis dans cette session</div>
                      </td>
                    </tr>
                  ) : (
                    recentCashierPayments.map((p) => {
                      const method = getMethodDetails(p.method);
                      return (
                        <tr key={p.id}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                            {p.receiptNumber}
                          </td>
                          <td>
                            <div style={{ fontWeight: 700 }}>{p.studentName}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formatDate(p.timestamp, true)}</div>
                          </td>
                          <td>{p.className}</td>
                          <td style={{ fontWeight: 800, color: '#0f172a' }}>
                            {formatCurrency(p.amount, schoolConfig.currency)}
                          </td>
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
                          <td>
                            <button
                              onClick={() => onViewReceipt(p, 0, 400000)}
                              className="btn btn-outline"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                            >
                              <Receipt size={14} />
                              <span>Voir Reçu</span>
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

      </div>
    </div>
  );
};
