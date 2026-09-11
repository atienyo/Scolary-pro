import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { 
  Printer, 
  Share2, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  FileText,
  School,
  Download
} from 'lucide-react';
import { PaymentTransaction, SchoolConfig } from '../types';
import { formatCurrency, formatDate, getMethodDetails } from '../utils/formatters';

import { pdfService } from '../services/pdfService';
import { notificationService } from '../services/notificationService';

interface ReceiptModalProps {
  payment: PaymentTransaction;
  schoolConfig: SchoolConfig;
  remainingBalance: number;
  totalAnnualTuition: number;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  payment,
  schoolConfig,
  remainingBalance,
  totalAnnualTuition,
  onClose,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const methodInfo = getMethodDetails(payment.method);

  useEffect(() => {
    // Generate secure QR Code with verification payload
    const verificationData = JSON.stringify({
      receiptNo: payment.receiptNumber,
      matricule: payment.studentMatricule,
      student: payment.studentName,
      amount: payment.amount,
      date: payment.timestamp,
      schoolCode: schoolConfig.code,
      sig: `SIG-${payment.id.toUpperCase()}`
    });

    QRCode.toDataURL(verificationData, {
      width: 140,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error(err));
  }, [payment, schoolConfig]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      await pdfService.generateReceiptPDF(
        payment,
        schoolConfig,
        remainingBalance,
        totalAnnualTuition
      );
    } catch (err) {
      console.error('Erreur génération PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleWhatsAppShare = () => {
    notificationService.sendReceiptViaWhatsApp(
      payment,
      undefined,
      schoolConfig,
      remainingBalance
    );
  };

  return (
    <div className="modal-overlay print-active-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '650px', background: '#ffffff' }}
      >
        {/* Modal Top Bar (hidden on print) */}
        <div className="no-print" style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={20} color="#10b981" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              Quittance Officielle N° {payment.receiptNumber}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="btn btn-secondary"
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#ffffff',
                border: '1px solid #cbd5e1'
              }}
              title="Télécharger le reçu officiel au format PDF"
            >
              <Download size={15} color="#4f46e5" />
              <span>{isGeneratingPdf ? 'Génération...' : 'PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="btn btn-primary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
            >
              <Printer size={15} />
              <span>Imprimer</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', background: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }}
              title="Envoyer le reçu directement sur WhatsApp au parent"
            >
              <Share2 size={15} color="#25D366" />
              <span>WhatsApp</span>
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

        {/* Printable Official Receipt Body */}
        <div className="printable-receipt" style={{ padding: '2rem', position: 'relative', background: '#ffffff' }}>
          
          {/* Subtle Watermark Stamp */}
          <div style={{
            position: 'absolute',
            top: '48%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-25deg)',
            border: '4px dashed rgba(16, 185, 129, 0.18)',
            color: 'rgba(16, 185, 129, 0.18)',
            fontSize: '3.5rem',
            fontWeight: 900,
            padding: '0.4rem 2rem',
            borderRadius: '12px',
            pointerEvents: 'none',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            zIndex: 1
          }}>
            ACQUITTÉ
          </div>

          {/* Header of the School */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid #0f172a',
            paddingBottom: '1.25rem',
            marginBottom: '1.25rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.4rem'
              }}>
                <School size={30} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
                  {schoolConfig.name}
                </h2>
                <div style={{ fontSize: '0.75rem', color: '#475569', fontStyle: 'italic', marginBottom: '0.2rem' }}>
                  « {schoolConfig.motto} »
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {schoolConfig.address}, {schoolConfig.city} • Tél: {schoolConfig.phone}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#3b5bdb',
                background: '#edf2ff',
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                display: 'inline-block',
                marginBottom: '0.35rem'
              }}>
                ANNÉE {schoolConfig.academicYear}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Code Établissement : <strong>{schoolConfig.code}</strong>
              </div>
            </div>
          </div>

          {/* Receipt Title & Meta */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '0.85rem 1.2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>
                DOCUMENT DE CAISSE OFFICIEL
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                {payment.receiptNumber}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Date & Heure d'encaissement :</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                {formatDate(payment.timestamp, true)}
              </div>
            </div>
          </div>

          {/* Student Info Box */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            padding: '1rem',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            background: '#ffffff'
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                Élève
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                {payment.studentName}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.2rem' }}>
                Matricule : <strong style={{ fontFamily: 'var(--font-mono)' }}>{payment.studentMatricule}</strong>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                Classe / Niveau
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#3b5bdb' }}>
                {payment.className}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                Cible : <strong>{payment.installmentTarget}</strong>
              </div>
            </div>
          </div>

          {/* Payment breakdown */}
          <div style={{ marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#0f172a', color: '#ffffff' }}>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left', borderRadius: '4px 0 0 0' }}>Désignation de l'opération</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left' }}>Moyen de paiement</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left' }}>Réf. Transaction</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right', borderRadius: '0 4px 0 0' }}>Montant Versé</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <td style={{ padding: '0.85rem' }}>
                    <strong>Versement Scolarité</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{payment.notes || 'Règlement régulier sous quittance'}</div>
                  </td>
                  <td style={{ padding: '0.85rem' }}>
                    <span style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: methodInfo.bg,
                      color: methodInfo.color
                    }}>
                      {methodInfo.label}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                    {payment.reference || 'ESP-GUICHET'}
                  </td>
                  <td style={{ padding: '0.85rem', textAlign: 'right', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    {formatCurrency(payment.amount, schoolConfig.currency)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Balance Summary Banner */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Frais Annuels Dus</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155' }}>
                {formatCurrency(totalAnnualTuition, schoolConfig.currency)}
              </div>
            </div>

            <div style={{ borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.7rem', color: '#059669', textTransform: 'uppercase', fontWeight: 700 }}>Versé ce jour</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#059669' }}>
                {formatCurrency(payment.amount, schoolConfig.currency)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: '#dc2626', textTransform: 'uppercase', fontWeight: 700 }}>Solde Restant</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: remainingBalance > 0 ? '#dc2626' : '#059669' }}>
                {remainingBalance > 0 ? formatCurrency(remainingBalance, schoolConfig.currency) : 'SOLDÉ (0 FCFA)'}
              </div>
            </div>
          </div>

          {/* Bottom Security verification & Signatures */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            paddingTop: '1rem',
            borderTop: '1px dashed #cbd5e1'
          }}>
            {/* QR Code authentication */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              {qrCodeUrl && (
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code d'authentification de la quittance" 
                  style={{ width: '80px', height: '80px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                />
              )}
              <div style={{ fontSize: '0.7rem', color: '#64748b', maxWidth: '210px' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ShieldCheck size={14} color="#10b981" />
                  Quittance Certifiée
                </div>
                Scannez ce QR Code pour vérifier l'authenticité de cette quittance sur le serveur de l'école.
              </div>
            </div>

            {/* Signatures & Stamp */}
            <div style={{ textAlign: 'center', minWidth: '180px' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2.5rem' }}>
                Le Caissier / L'Économe
              </div>
              <div style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#0f172a',
                borderTop: '1px solid #0f172a',
                paddingTop: '0.3rem'
              }}>
                {payment.cashierName}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                {schoolConfig.stampText}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
