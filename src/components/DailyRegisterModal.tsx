import React, { useMemo } from 'react';
import { 
  Printer, 
  X, 
  FileSpreadsheet, 
  CheckCircle2, 
  ShieldCheck, 
  School,
  Wallet,
  Coins
} from 'lucide-react';
import { PaymentTransaction, SchoolConfig } from '../types';
import { formatCurrency, formatDate, getMethodDetails } from '../utils/formatters';

interface DailyRegisterModalProps {
  payments: PaymentTransaction[];
  schoolConfig: SchoolConfig;
  cashierName: string;
  onClose: () => void;
}

export const DailyRegisterModal: React.FC<DailyRegisterModalProps> = ({
  payments,
  schoolConfig,
  cashierName,
  onClose,
}) => {
  // Today's payments (we consider all current session payments)
  const todayTransactions = useMemo(() => {
    return [...payments].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [payments]);

  // Totals by method
  const totalsByMethod = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    todayTransactions.forEach((t) => {
      if (!map[t.method]) {
        map[t.method] = { count: 0, total: 0 };
      }
      map[t.method].count += 1;
      map[t.method].total += t.amount;
    });
    return map;
  }, [todayTransactions]);

  const grandTotal = useMemo(() => {
    return todayTransactions.reduce((acc, t) => acc + t.amount, 0);
  }, [todayTransactions]);

  const cashTotal = totalsByMethod['ESPECES']?.total || 0;
  const mobileMoneyTotal = 
    (totalsByMethod['WAVE']?.total || 0) + 
    (totalsByMethod['ORANGE_MONEY']?.total || 0) + 
    (totalsByMethod['MTN_MOMO']?.total || 0);
  const bankTotal = 
    (totalsByMethod['CHEQUE']?.total || 0) + 
    (totalsByMethod['VIREMENT_BANCAIRE']?.total || 0) + 
    (totalsByMethod['CARTE']?.total || 0);

  return (
    <div className="modal-overlay print-active-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '800px', background: '#ffffff' }}
      >
        {/* Top Action Bar (hidden on print) */}
        <div className="no-print" style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileSpreadsheet size={20} color="var(--primary)" />
            <span style={{ fontWeight: 800, fontSize: '1rem' }}>
              Arrêté Journalier de Caisse & Réconciliation
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => window.print()}
              className="btn btn-primary"
              style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem' }}
            >
              <Printer size={15} />
              <span>Imprimer le Bordereau</span>
            </button>

            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#e2e8f0',
                color: '#64748b'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Official Document */}
        <div className="printable-receipt" style={{ padding: '2rem', background: '#ffffff' }}>
          
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid #0f172a',
            paddingBottom: '1.25rem',
            marginBottom: '1.25rem',
          }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, textTransform: 'uppercase', color: '#0f172a' }}>
                {schoolConfig.name}
              </h2>
              <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                {schoolConfig.stampText} • Année {schoolConfig.academicYear}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                fontWeight: 700,
                background: '#0f172a',
                color: '#fff',
                padding: '0.25rem 0.6rem',
                borderRadius: '4px',
                display: 'inline-block'
              }}>
                BORDEREAU N° BDC-{new Date().getFullYear()}-{todayTransactions.length}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.3rem' }}>
                Date d'arrêté : <strong>{new Date().toLocaleDateString('fr-FR')}</strong>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', margin: '1.25rem 0' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
              Procès-Verbal de Clôture & Arrêté de Caisse
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Responsable de Guichet : <strong>{cashierName}</strong>
            </p>
          </div>

          {/* Three summary boxes */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ background: '#f0fdf4', border: '1.5px solid #a7f3d0', padding: '0.85rem', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>Espèces Physiques en Caisse</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#166534' }}>
                {formatCurrency(cashTotal, schoolConfig.currency)}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#166534' }}>{totalsByMethod['ESPECES']?.count || 0} versement(s)</div>
            </div>

            <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', padding: '0.85rem', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>Mobile Money (Wave/OM/MTN)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e40af' }}>
                {formatCurrency(mobileMoneyTotal, schoolConfig.currency)}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#1e40af' }}>Téléversements directs</div>
            </div>

            <div style={{ background: '#faf5ff', border: '1.5px solid #e9d5ff', padding: '0.85rem', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b21a8', textTransform: 'uppercase' }}>Chèques & Virements</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#6b21a8' }}>
                {formatCurrency(bankTotal, schoolConfig.currency)}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#6b21a8' }}>À compenser en banque</div>
            </div>
          </div>

          {/* Grand Total Strip */}
          <div style={{
            background: '#0f172a',
            color: '#fff',
            borderRadius: '8px',
            padding: '1rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>
                RECETTE GLOBALE DU JOUR
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                Total de {todayTransactions.length} transaction(s) sous quittance
              </div>
            </div>

            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(grandTotal, schoolConfig.currency)}
            </div>
          </div>

          {/* Table of operations */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Détail Chronologique des Encaissements
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Heure</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>N° Reçu</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Élève</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Classe</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Moyen</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Montant</th>
                </tr>
              </thead>
              <tbody>
                {todayTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                      Aucune transaction enregistrée pour cette journée.
                    </td>
                  </tr>
                ) : (
                  todayTransactions.map((t) => {
                    const details = getMethodDetails(t.method);
                    return (
                      <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>{formatDate(t.timestamp, true)}</td>
                        <td style={{ padding: '0.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{t.receiptNumber}</td>
                        <td style={{ padding: '0.5rem', fontWeight: 600 }}>{t.studentName}</td>
                        <td style={{ padding: '0.5rem' }}>{t.className}</td>
                        <td style={{ padding: '0.5rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: details.color }}>
                            {details.label}
                          </span>
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 800 }}>
                          {formatCurrency(t.amount, schoolConfig.currency)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '3rem',
            paddingTop: '1.5rem',
            borderTop: '2px solid #0f172a'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2.5rem' }}>
                L'Agent de Caisse (Décharge)
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{cashierName}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Heure de clôture : {new Date().toLocaleTimeString('fr-FR')}</div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2.5rem' }}>
                L'Intendant / Chef d'Établissement (Visa)
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{schoolConfig.bursarName}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Visa et intégration comptable</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
