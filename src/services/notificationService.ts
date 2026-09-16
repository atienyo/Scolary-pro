import { PaymentTransaction, Student, SchoolConfig, StudentFinancialSummary } from '../types';
import { formatCurrency, formatPaymentMethod } from '../utils/formatters';

export const notificationService = {
  // Envoi d'un reçu officiel par WhatsApp au parent
  sendReceiptViaWhatsApp(
    payment: PaymentTransaction,
    student: Student | undefined,
    schoolConfig: SchoolConfig,
    remainingBalance: number
  ) {
    const rawPhone = student?.guardianPhone || '';
    // Clean phone number to international format (e.g. remove spaces, dashes, ensure country code)
    let cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10 && cleanPhone.startsWith('0')) {
      cleanPhone = '225' + cleanPhone.slice(1); // Default Côte d'Ivoire prefix if missing
    }

    const dateFormatted = new Date(payment.timestamp).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    const message = 
`🎓 *${schoolConfig.name.toUpperCase()}*
_Service Comptabilité & Caisse_
━━━━━━━━━━━━━━━━━━━━
🧾 *REÇU DE PAIEMENT SCOLAIRE*
• *N° Reçu :* ${payment.receiptNumber}
• *Date :* ${dateFormatted}
• *Élève :* ${payment.studentName}
• *Matricule :* ${payment.studentMatricule}
• *Classe :* ${payment.className}
• *Motif :* ${payment.installmentTarget}

💰 *Montant Encaissé :* *${formatCurrency(payment.amount, schoolConfig.currency)}*
💳 *Mode :* ${formatPaymentMethod(payment.method)}
${payment.reference ? `• *Réf :* ${payment.reference}\n` : ''}
${remainingBalance > 0 
  ? `⚠️ *Solde restant à solder :* ${formatCurrency(remainingBalance, schoolConfig.currency)}`
  : `✅ *Statut :* Scolarité 100% soldée`
}
━━━━━━━━━━━━━━━━━━━━
Merci de votre confiance.
📞 Contact école : ${schoolConfig.phone}`;

    const encodedText = encodeURIComponent(message);
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodedText}`
      : `https://wa.me/?text=${encodedText}`;

    window.open(waUrl, '_blank');
  },

  // Envoi d'un message de relance pour impayé par WhatsApp
  sendOverdueReminderViaWhatsApp(
    student: Student,
    financialSummary: StudentFinancialSummary,
    schoolConfig: SchoolConfig
  ) {
    const rawPhone = student.guardianPhone || '';
    let cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10 && cleanPhone.startsWith('0')) {
      cleanPhone = '225' + cleanPhone.slice(1);
    }

    const message = 
`🔔 *AVIS D'ÉCHÉANCE - FRAIS DE SCOLARITÉ*
*${schoolConfig.name.toUpperCase()}*
━━━━━━━━━━━━━━━━━━━━
Bonjour ${student.guardianRelation} ${student.guardianName},

Sauf erreur de notre part, nous constatons un solde restant dû pour la scolarité de votre enfant *${student.lastName} ${student.firstName}* (Classe : *${student.className}*).

📊 *Situation financière :*
• *Total Scolarité :* ${formatCurrency(financialSummary.totalDue, schoolConfig.currency)}
• *Montant déjà payé :* ${formatCurrency(financialSummary.totalPaid, schoolConfig.currency)}
• *Reste à payer :* *${formatCurrency(financialSummary.remainingBalance, schoolConfig.currency)}*

Merci de bien vouloir vous rapprocher du service de la caisse pour régulariser la situation dans les meilleurs délais.

💳 *Paiements acceptés au guichet :* Wave, Orange Money, Espèces, Chèque, Virement.
📞 Contact comptabilité : ${schoolConfig.phone}`;

    const encodedText = encodeURIComponent(message);
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodedText}`
      : `https://wa.me/?text=${encodedText}`;

    window.open(waUrl, '_blank');
  },

  // Envoi d'un pré-avis / rappel d'échéance imminente (J-3) par WhatsApp
  sendDueSoonReminderViaWhatsApp(
    student: Student,
    installmentTitle: string,
    amountDue: number,
    dueDate: string,
    daysRemaining: number,
    schoolConfig: SchoolConfig
  ) {
    const rawPhone = student.guardianPhone || '';
    let cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10 && cleanPhone.startsWith('0')) {
      cleanPhone = '225' + cleanPhone.slice(1);
    }

    const dateFormatted = new Date(dueDate).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const deadlineNotice = daysRemaining === 0 
      ? `arrive à échéance *AUJOURD'HUI*`
      : `arrive à échéance dans *${daysRemaining} jour(s)* (le ${dateFormatted})`;

    const message = 
`🔔 *RAPPEL PRÉVENTIF D'ÉCHÉANCE - FRAIS DE SCOLARITÉ*
*${schoolConfig.name.toUpperCase()}*
━━━━━━━━━━━━━━━━━━━━
Bonjour ${student.guardianRelation} ${student.guardianName},

Nous vous informons que l'échéance pour la *${installmentTitle}* de votre enfant *${student.lastName} ${student.firstName}* (Classe : *${student.className}*) ${deadlineNotice}.

💰 *Montant attendu :* *${formatCurrency(amountDue, schoolConfig.currency)}*

💡 Réglez dès maintenant pour éviter tout retard ou frais additionnels.

💳 *Moyens de paiement acceptés au guichet :*
• Wave Mobile & Orange Money
• Espèces (Caisse Centrale)
• MTN MoMo, Chèque & Virement

📞 Service Caisse & Intendance : ${schoolConfig.phone}`;

    const encodedText = encodeURIComponent(message);
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodedText}`
      : `https://wa.me/?text=${encodedText}`;

    window.open(waUrl, '_blank');
  },

  // Envoi par SMS direct (via protocole sms:)
  sendSMS(phone: string, text: string) {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(text)}`;
    window.open(smsUrl, '_blank');
  }
};
