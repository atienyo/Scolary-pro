import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { PaymentTransaction, SchoolConfig } from '../types';
import { formatCurrency, formatPaymentMethod } from '../utils/formatters';

export const pdfService = {
  async generateReceiptPDF(
    payment: PaymentTransaction,
    schoolConfig: SchoolConfig,
    remainingBalance: number,
    totalAnnualTuition: number
  ): Promise<void> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;

    // --- 1. EN-TÊTE ÉTABLISSEMENT ---
    doc.setFillColor(59, 91, 219); // Primary blue
    doc.rect(0, 0, pageWidth, 5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text(schoolConfig.name.toUpperCase(), margin, 18);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    if (schoolConfig.motto) {
      doc.text(`« ${schoolConfig.motto} »`, margin, 23);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`${schoolConfig.address} - ${schoolConfig.city}, ${schoolConfig.country}`, margin, 28);
    doc.text(`Tél : ${schoolConfig.phone} | Email : ${schoolConfig.email}`, margin, 32);

    // Année Scolaire & Code (Right aligned)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(59, 91, 219);
    doc.text(`ANNÉE SCOLAIRE : ${schoolConfig.academicYear}`, pageWidth - margin, 18, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Code Établissement : ${schoolConfig.code}`, pageWidth - margin, 23, { align: 'right' });

    // Ligne de séparation
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, 36, pageWidth - margin, 36);

    // --- 2. TITRE & NUMÉRO DE REÇU ---
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, 40, pageWidth - (margin * 2), 16, 3, 3, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, 40, pageWidth - (margin * 2), 16, 3, 3, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59);
    doc.text('REÇU OFFICIEL D\'ENCAISSEMENT', margin + 6, 49);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(59, 91, 219);
    doc.text(`N° ${payment.receiptNumber}`, pageWidth - margin - 6, 47, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const dateFormatted = new Date(payment.timestamp).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Date : ${dateFormatted}`, pageWidth - margin - 6, 52, { align: 'right' });

    // --- 3. INFORMATIONS ÉLÈVE & PARENT ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('INFORMATIONS DE L\'ÉLÈVE', margin, 64);

    const studentInfo = [
      ['Nom & Prénoms :', payment.studentName, 'Classe :', payment.className],
      ['Matricule Élève :', payment.studentMatricule, 'Opérateur Caisse :', payment.cashierName]
    ];

    autoTable(doc, {
      startY: 67,
      margin: { left: margin, right: margin },
      body: studentInfo,
      theme: 'plain',
      styles: {
        fontSize: 9,
        cellPadding: 2,
        textColor: [51, 65, 85]
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 35, textColor: [100, 116, 139] },
        1: { fontStyle: 'bold', cellWidth: 65, textColor: [15, 23, 42] },
        2: { fontStyle: 'bold', cellWidth: 35, textColor: [100, 116, 139] },
        3: { fontStyle: 'bold', textColor: [15, 23, 42] }
      }
    });

    // --- 4. DÉTAILS DE LA TRANSACTION ---
    const tableStartY = (doc as any).lastAutoTable.finalY + 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('DÉTAILS DU PAIEMENT EFFECTUÉ', margin, tableStartY);

    const transactionData = [
      [
        payment.installmentTarget,
        formatPaymentMethod(payment.method),
        payment.reference || 'ESPÈCES GUICHET',
        formatCurrency(payment.amount, schoolConfig.currency)
      ]
    ];

    autoTable(doc, {
      startY: tableStartY + 3,
      margin: { left: margin, right: margin },
      head: [['Motif / Tranche', 'Mode de Règlement', 'Référence Transaction', 'Montant Encaissé']],
      body: transactionData,
      theme: 'grid',
      headStyles: {
        fillColor: [59, 91, 219],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 4,
        textColor: [30, 41, 59]
      },
      columnStyles: {
        3: { halign: 'right', fontStyle: 'bold', textColor: [16, 185, 129] }
      }
    });

    // --- 5. SITUATION FINANCIÈRE & SOLDE RESTANT ---
    const finStartY = (doc as any).lastAutoTable.finalY + 6;

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(pageWidth - margin - 85, finStartY, 85, 26, 2, 2, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(pageWidth - margin - 85, finStartY, 85, 26, 2, 2, 'D');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Total Scolarité Annuelle :', pageWidth - margin - 80, finStartY + 7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(formatCurrency(totalAnnualTuition, schoolConfig.currency), pageWidth - margin - 5, finStartY + 7, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text('SOLDE RESTANT DÛ :', pageWidth - margin - 80, finStartY + 16);
    doc.setFontSize(11);
    doc.text(formatCurrency(remainingBalance, schoolConfig.currency), pageWidth - margin - 5, finStartY + 16, { align: 'right' });

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text(remainingBalance <= 0 ? '✓ Scolarité soldée en totalité' : '* Hors pénalités de retard éventuelles', pageWidth - margin - 80, finStartY + 22);

    // --- 6. QR CODE DE SÉCURITÉ & AUTHENTICITÉ ---
    const qrText = `SCOLARPAY_VERIF:${payment.receiptNumber}|STUDENT:${payment.studentMatricule}|AMT:${payment.amount}|DATE:${payment.timestamp}`;
    const qrDataUrl = await QRCode.toDataURL(qrText, { width: 100, margin: 1 });

    doc.addImage(qrDataUrl, 'PNG', margin, finStartY, 25, 25);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Scanner pour vérifier', margin + 12.5, finStartY + 29, { align: 'center' });
    doc.text('l\'authenticité du reçu', margin + 12.5, finStartY + 32, { align: 'center' });

    // --- 7. CACHET & SIGNATURES ---
    const signStartY = finStartY + 38;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Le Caissier / L\'Économe', margin + 10, signStartY);
    doc.text('Le Parent / Tuteur Légal', pageWidth - margin - 50, signStartY);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(148, 163, 184);
    doc.text('(Signature & Cachet Officiel)', margin + 10, signStartY + 5);
    doc.text('(Pour acquit et acceptation)', pageWidth - margin - 50, signStartY + 5);

    // Cachet text box
    doc.setDrawColor(59, 91, 219);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin + 5, signStartY + 9, 65, 18, 2, 2, 'D');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(59, 91, 219);
    doc.text(schoolConfig.stampText || 'VU ET APPROUVÉ - SERVICE COMPTABILITÉ', margin + 37.5, signStartY + 19, { align: 'center' });

    // --- 8. PIED DE PAGE ---
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(148, 163, 184);
    doc.text('Ce reçu est une pièce justificative officielle de paiement. Veuillez le conserver précieusement.', pageWidth / 2, 285, { align: 'center' });
    doc.text(`Document généré par ScolarPay Pro - Système de Gestion Scolaire & Caisse | ${schoolConfig.name}`, pageWidth / 2, 289, { align: 'center' });

    // Téléchargement du fichier
    const cleanStudent = payment.studentName.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Recu_${payment.receiptNumber}_${cleanStudent}.pdf`);
  }
};
