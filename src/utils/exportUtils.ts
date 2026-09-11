import { PaymentTransaction, Student, ClassFeePlan, SchoolConfig } from '../types';
import { calculateStudentFinancials, formatCurrency, formatPaymentMethod } from './formatters';

function downloadCSV(csvContent: string, fileName: string) {
  // UTF-8 BOM so Excel opens accents (é, è, à) properly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const exportUtils = {
  // Export du Journal des Paiements
  exportPaymentsToCSV(payments: PaymentTransaction[], schoolConfig: SchoolConfig) {
    const headers = [
      'N° Reçu',
      'Date & Heure',
      'Matricule',
      'Nom de l\'Élève',
      'Classe',
      'Motif / Tranche',
      'Montant (' + schoolConfig.currency + ')',
      'Mode de Paiement',
      'Référence Transaction',
      'Caissier'
    ];

    const rows = payments.map((p) => [
      `"${p.receiptNumber}"`,
      `"${new Date(p.timestamp).toLocaleString('fr-FR')}"`,
      `"${p.studentMatricule}"`,
      `"${p.studentName.replace(/"/g, '""')}"`,
      `"${p.className}"`,
      `"${p.installmentTarget}"`,
      p.amount,
      `"${formatPaymentMethod(p.method)}"`,
      `"${p.reference || 'ESPÈCES'}"`,
      `"${p.cashierName.replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map((r) => r.join(';'))
    ].join('\r\n');

    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCSV(csvContent, `Journal_Paiements_${schoolConfig.code}_${dateStr}.csv`);
  },

  // Export de la Situation Financière des Élèves
  exportStudentsToCSV(
    students: Student[],
    feePlans: ClassFeePlan[],
    payments: PaymentTransaction[],
    schoolConfig: SchoolConfig
  ) {
    const headers = [
      'Matricule',
      'Nom',
      'Prénoms',
      'Classe',
      'Cycle',
      'Nom du Tuteur',
      'Téléphone Tuteur',
      'Total Scolarité Dû (' + schoolConfig.currency + ')',
      'Montant Payé (' + schoolConfig.currency + ')',
      'Solde Restant (' + schoolConfig.currency + ')',
      'Statut Financier',
      'Jours de Retard'
    ];

    const rows = students.map((s) => {
      const fin = calculateStudentFinancials(s, feePlans, payments);
      const statusLabel = 
        fin.status === 'UP_TO_DATE' ? 'À jour' :
        fin.status === 'LATE' ? 'En retard' :
        fin.status === 'CRITICAL' ? 'Critique' : 'Trop-perçu';

      return [
        `"${s.matricule}"`,
        `"${s.lastName.replace(/"/g, '""')}"`,
        `"${s.firstName.replace(/"/g, '""')}"`,
        `"${s.className}"`,
        `"${s.level}"`,
        `"${s.guardianName.replace(/"/g, '""')}"`,
        `"${s.guardianPhone}"`,
        fin.totalDue,
        fin.totalPaid,
        fin.remainingBalance,
        `"${statusLabel}"`,
        fin.daysLate
      ];
    });

    const csvContent = [
      headers.join(';'),
      ...rows.map((r) => r.join(';'))
    ].join('\r\n');

    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCSV(csvContent, `Situation_Eleves_${schoolConfig.code}_${dateStr}.csv`);
  },

  // Export des Impayés et Relances
  exportOverdueToCSV(
    overdueStudents: Student[],
    feePlans: ClassFeePlan[],
    payments: PaymentTransaction[],
    schoolConfig: SchoolConfig
  ) {
    const headers = [
      'Matricule',
      'Élève',
      'Classe',
      'Tuteur Légal',
      'Téléphone (Relance)',
      'Email Tuteur',
      'Solde Restant Dû (' + schoolConfig.currency + ')',
      'Niveau d\'Alerte',
      'Jours de Retard'
    ];

    const rows = overdueStudents.map((s) => {
      const fin = calculateStudentFinancials(s, feePlans, payments);
      return [
        `"${s.matricule}"`,
        `"${s.lastName} ${s.firstName}"`,
        `"${s.className}"`,
        `"${s.guardianName}"`,
        `"${s.guardianPhone}"`,
        `"${s.guardianEmail}"`,
        fin.remainingBalance,
        `"${fin.status === 'CRITICAL' ? 'CRITIQUE (>30j)' : 'RETARD'}"`,
        fin.daysLate
      ];
    });

    const csvContent = [
      headers.join(';'),
      ...rows.map((r) => r.join(';'))
    ].join('\r\n');

    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCSV(csvContent, `Liste_Impayes_Relances_${schoolConfig.code}_${dateStr}.csv`);
  }
};
