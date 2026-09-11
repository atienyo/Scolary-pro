import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { CashierView } from './components/CashierView';
import { StudentsView } from './components/StudentsView';
import { OverdueView } from './components/OverdueView';
import { FeeSettingsView } from './components/FeeSettingsView';
import { SchoolSettingsView } from './components/SchoolSettingsView';
import { ReceiptModal } from './components/ReceiptModal';
import { DailyRegisterModal } from './components/DailyRegisterModal';
import { NewStudentModal } from './components/NewStudentModal';
import { AuthView } from './components/AuthView';
import { ChangePasswordModal } from './components/ChangePasswordModal';

import { 
  initialSchoolConfig, 
  initialFeePlans, 
  initialStudents, 
  initialPayments 
} from './data/mockData';
import { 
  SchoolConfig, 
  ClassFeePlan, 
  Student, 
  PaymentTransaction, 
  UserRole,
  AuthUser 
} from './types';
import { calculateStudentFinancials, formatCurrency } from './utils/formatters';
import { supabaseService } from './services/supabaseService';
import { authService } from './services/authService';
import { realtimeService } from './services/realtimeService';
import { Zap, CheckCircle2, Sparkles, X } from 'lucide-react';

export function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [showChangePassword, setShowChangePassword] = useState<boolean>(false);
  const [liveNotification, setLiveNotification] = useState<{ title: string; subtitle: string; amount?: number } | null>(null);

  // Application state with localStorage cache fallbacks
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(() => {
    const saved = localStorage.getItem('scolarpay_school_config');
    return saved ? JSON.parse(saved) : initialSchoolConfig;
  });

  const [feePlans, setFeePlans] = useState<ClassFeePlan[]>(() => {
    const saved = localStorage.getItem('scolarpay_fee_plans');
    return saved ? JSON.parse(saved) : initialFeePlans;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('scolarpay_students');
    return saved ? JSON.parse(saved) : initialStudents;
  });

  const [payments, setPayments] = useState<PaymentTransaction[]>(() => {
    const saved = localStorage.getItem('scolarpay_payments');
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('DIRECTOR');
  
  // Modals state
  const [activeReceipt, setActiveReceipt] = useState<{
    payment: PaymentTransaction;
    remainingBalance: number;
    totalAnnualTuition: number;
  } | null>(null);

  const [showDailyRegister, setShowDailyRegister] = useState<boolean>(false);
  const [showNewStudent, setShowNewStudent] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [cashierPreselectedStudentId, setCashierPreselectedStudentId] = useState<string>('');

  // Check initial authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          setCurrentRole(user.role);
        }
      } catch (e) {
        console.error('Erreur vérification auth:', e);
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkAuth();

    // Listen to Supabase auth state changes
    const unsubscribe = authService.onAuthStateChange((user) => {
      setCurrentUser(user);
      if (user) {
        setCurrentRole(user.role);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Initial fetch from Supabase if connected
  useEffect(() => {
    if (!supabaseService.isConfigured()) return;

    const loadRemoteData = async () => {
      try {
        const [remoteConfig, remotePlans, remoteStudents, remotePayments] = await Promise.all([
          supabaseService.getSchoolConfig(),
          supabaseService.getFeePlans(),
          supabaseService.getStudents(),
          supabaseService.getPayments()
        ]);

        if (remoteConfig) {
          setSchoolConfig(remoteConfig);
          localStorage.setItem('scolarpay_school_config', JSON.stringify(remoteConfig));
        }
        if (remotePlans !== null) {
          setFeePlans(remotePlans);
          localStorage.setItem('scolarpay_fee_plans', JSON.stringify(remotePlans));
        }
        if (remoteStudents !== null) {
          setStudents(remoteStudents);
          localStorage.setItem('scolarpay_students', JSON.stringify(remoteStudents));
        }
        if (remotePayments !== null) {
          setPayments(remotePayments);
          localStorage.setItem('scolarpay_payments', JSON.stringify(remotePayments));
        }
      } catch (err) {
        console.error('Erreur synchronisation Supabase:', err);
      }
    };

    loadRemoteData();
  }, []);

  // Supabase Realtime Live Subscription
  useEffect(() => {
    const unsubscribe = realtimeService.subscribe({
      onPaymentInsert: (newPayment) => {
        setPayments((prev) => {
          if (prev.some((p) => p.id === newPayment.id || p.receiptNumber === newPayment.receiptNumber)) return prev;
          return [newPayment, ...prev];
        });
        setLiveNotification({
          title: '⚡ Paiement Encaissé en Temps Réel !',
          subtitle: `${newPayment.studentName} (${newPayment.className}) • ${newPayment.installmentTarget}`,
          amount: newPayment.amount
        });
        setTimeout(() => setLiveNotification(null), 5000);
      },
      onStudentInsert: (newStudent) => {
        setStudents((prev) => {
          if (prev.some((s) => s.id === newStudent.id || s.matricule === newStudent.matricule)) return prev;
          return [newStudent, ...prev];
        });
        setLiveNotification({
          title: '🎓 Nouvelle Inscription Enregistrée',
          subtitle: `${newStudent.lastName} ${newStudent.firstName} (${newStudent.className})`
        });
        setTimeout(() => setLiveNotification(null), 5000);
      },
      onFeePlanUpdate: (updatedPlan) => {
        setFeePlans((prev) => prev.map((p) => (p.classId === updatedPlan.classId ? updatedPlan : p)));
      },
      onSchoolConfigUpdate: (updatedConfig) => {
        setSchoolConfig(updatedConfig);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Persist state updates to localStorage
  useEffect(() => {
    localStorage.setItem('scolarpay_school_config', JSON.stringify(schoolConfig));
  }, [schoolConfig]);

  useEffect(() => {
    localStorage.setItem('scolarpay_fee_plans', JSON.stringify(feePlans));
  }, [feePlans]);

  useEffect(() => {
    localStorage.setItem('scolarpay_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('scolarpay_payments', JSON.stringify(payments));
  }, [payments]);

  // Compute overdue count for sidebar badge
  const overdueCount = useMemo(() => {
    return students.filter((s) => {
      const fin = calculateStudentFinancials(s, feePlans, payments);
      return fin.status === 'LATE' || fin.status === 'CRITICAL';
    }).length;
  }, [students, feePlans, payments]);

  // Active cashier title
  const activeCashierName = useMemo(() => {
    if (currentUser?.fullName) {
      const roleLabel = currentRole === 'DIRECTOR' ? 'Directeur' : currentRole === 'BURSAR' ? 'Économe' : 'Guichet Caisse';
      return `${currentUser.fullName} (${roleLabel})`;
    }
    switch (currentRole) {
      case 'DIRECTOR': return schoolConfig.directorName ? `${schoolConfig.directorName} (Directeur)` : 'Directeur';
      case 'BURSAR': return schoolConfig.bursarName ? `${schoolConfig.bursarName} (Économe)` : 'Économe';
      case 'CASHIER': return 'Guichet Caisse';
      default: return 'Caissier';
    }
  }, [currentUser, currentRole, schoolConfig]);

  // Auth Handlers
  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
  };

  const handleLogout = async () => {
    await authService.signOut();
    setCurrentUser(null);
  };

  // Handlers with Supabase sync
  const handlePaymentSuccess = (newPayment: PaymentTransaction) => {
    setPayments((prev) => [newPayment, ...prev]);
    if (supabaseService.isConfigured()) {
      supabaseService.addPayment(newPayment);
    }
  };

  const handleSaveStudent = (student: Student) => {
    setStudents((prev) => {
      const exists = prev.some((s) => s.id === student.id);
      if (exists) {
        return prev.map((s) => (s.id === student.id ? student : s));
      }
      return [student, ...prev];
    });
    if (supabaseService.isConfigured()) {
      supabaseService.addOrUpdateStudent(student);
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    if (supabaseService.isConfigured()) {
      supabaseService.deleteStudent(studentId);
    }
  };

  const handleUpdateSchoolConfig = (newConfig: SchoolConfig) => {
    setSchoolConfig(newConfig);
    if (supabaseService.isConfigured()) {
      supabaseService.saveSchoolConfig(newConfig);
    }
  };

  const handleUpdateFeePlans = (newPlans: ClassFeePlan[]) => {
    setFeePlans(newPlans);
    if (supabaseService.isConfigured()) {
      newPlans.forEach((plan) => supabaseService.saveFeePlan(plan));
    }
  };

  const handlePayForStudent = (studentId: string) => {
    setCashierPreselectedStudentId(studentId);
    setCurrentTab('cashier');
  };

  const handleViewReceipt = (payment: PaymentTransaction, remaining?: number, total?: number) => {
    const student = students.find((s) => s.id === payment.studentId);
    const fin = student ? calculateStudentFinancials(student, feePlans, payments) : null;
    setActiveReceipt({
      payment,
      remainingBalance: remaining !== undefined ? remaining : (fin?.remainingBalance || 0),
      totalAnnualTuition: total !== undefined ? total : (fin?.totalDue || 380000),
    });
  };

  // If checking session on startup, display loading indicator
  if (isAuthLoading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        color: '#ffffff'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(255,255,255,0.1)',
          borderTopColor: '#6366f1',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '1rem'
        }} />
        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Chargement de ScolarPay Pro...</p>
      </div>
    );
  }

  // If user is not authenticated, show the login / signup screen
  if (!currentUser) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        schoolConfig={schoolConfig}
        overdueCount={overdueCount}
      />

      {/* Main App Canvas */}
      <main className="main-content">
        <Header
          schoolConfig={schoolConfig}
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          currentUser={currentUser}
          isSupabaseConnected={supabaseService.isConfigured()}
          onOpenCashier={() => setCurrentTab('cashier')}
          onOpenDailyRegister={() => setShowDailyRegister(true)}
          onQuickSearch={(query) => {
            if (query.trim()) {
              setCurrentTab('students');
            }
          }}
          onLogout={handleLogout}
          onOpenChangePassword={() => setShowChangePassword(true)}
        />

        {/* Dynamic View Router */}
        {currentTab === 'dashboard' && (
          <DashboardView
            students={students}
            feePlans={feePlans}
            payments={payments}
            schoolConfig={schoolConfig}
            onNavigateToTab={setCurrentTab}
            onViewReceipt={handleViewReceipt}
          />
        )}

        {currentTab === 'cashier' && (
          <CashierView
            students={students}
            feePlans={feePlans}
            payments={payments}
            schoolConfig={schoolConfig}
            activeCashierName={activeCashierName}
            onPaymentSuccess={handlePaymentSuccess}
            onViewReceipt={(p, rem, tot) => handleViewReceipt(p, rem, tot)}
          />
        )}

        {currentTab === 'students' && (
          <StudentsView
            students={students}
            feePlans={feePlans}
            payments={payments}
            schoolConfig={schoolConfig}
            onOpenNewStudent={() => {
              setEditingStudent(null);
              setShowNewStudent(true);
            }}
            onEditStudent={(student) => {
              setEditingStudent(student);
            }}
            onDeleteStudent={handleDeleteStudent}
            onPayForStudent={handlePayForStudent}
            onViewReceipt={(p, rem, tot) => handleViewReceipt(p, rem, tot)}
          />
        )}

        {currentTab === 'overdue' && (
          <OverdueView
            students={students}
            feePlans={feePlans}
            payments={payments}
            schoolConfig={schoolConfig}
            onPayForStudent={handlePayForStudent}
          />
        )}

        {currentTab === 'fees' && (
          <FeeSettingsView
            feePlans={feePlans}
            schoolConfig={schoolConfig}
            onUpdateFeePlans={handleUpdateFeePlans}
          />
        )}

        {currentTab === 'settings' && (
          <SchoolSettingsView
            schoolConfig={schoolConfig}
            onUpdateSchoolConfig={handleUpdateSchoolConfig}
          />
        )}
      </main>

      {/* Official Receipt Modal */}
      {activeReceipt && (
        <ReceiptModal
          payment={activeReceipt.payment}
          schoolConfig={schoolConfig}
          remainingBalance={activeReceipt.remainingBalance}
          totalAnnualTuition={activeReceipt.totalAnnualTuition}
          onClose={() => setActiveReceipt(null)}
        />
      )}

      {/* Daily Cash Register Modal */}
      {showDailyRegister && (
        <DailyRegisterModal
          payments={payments}
          schoolConfig={schoolConfig}
          cashierName={activeCashierName}
          onClose={() => setShowDailyRegister(false)}
        />
      )}

      {/* Student Enrollment / Edit Modal */}
      {(showNewStudent || editingStudent) && (
        <NewStudentModal
          initialStudent={editingStudent}
          feePlans={feePlans}
          schoolConfig={schoolConfig}
          onClose={() => {
            setShowNewStudent(false);
            setEditingStudent(null);
          }}
          onSaveStudent={handleSaveStudent}
        />
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePasswordModal
          userEmail={currentUser.email}
          onClose={() => setShowChangePassword(false)}
        />
      )}

      {/* Floating Live Realtime Notification Toast */}
      {liveNotification && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 99999,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '1rem 1.25rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          maxWidth: '420px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Zap size={22} color="#facc15" />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>{liveNotification.title}</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.15rem' }}>
              {liveNotification.subtitle}
            </div>
            {liveNotification.amount !== undefined && (
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>
                + {formatCurrency(liveNotification.amount, schoolConfig.currency)}
              </div>
            )}
          </div>

          <button
            onClick={() => setLiveNotification(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;

