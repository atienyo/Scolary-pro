import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { PaymentTransaction, Student, ClassFeePlan, SchoolConfig } from '../types';

export interface RealtimeHandlers {
  onPaymentInsert?: (payment: PaymentTransaction) => void;
  onPaymentUpdate?: (payment: PaymentTransaction) => void;
  onStudentInsert?: (student: Student) => void;
  onStudentUpdate?: (student: Student) => void;
  onStudentDelete?: (studentId: string) => void;
  onFeePlanUpdate?: (plan: ClassFeePlan) => void;
  onSchoolConfigUpdate?: (config: SchoolConfig) => void;
}

export const realtimeService = {
  subscribe(handlers: RealtimeHandlers) {
    if (!supabase || !isSupabaseConfigured) {
      return () => {};
    }

    const channel = supabase
      .channel('schema-db-changes')
      // Payments changes
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'payments' },
        (payload) => {
          if (handlers.onPaymentInsert && payload.new) {
            handlers.onPaymentInsert(payload.new as PaymentTransaction);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'payments' },
        (payload) => {
          if (handlers.onPaymentUpdate && payload.new) {
            handlers.onPaymentUpdate(payload.new as PaymentTransaction);
          }
        }
      )
      // Students changes
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'students' },
        (payload) => {
          if (handlers.onStudentInsert && payload.new) {
            handlers.onStudentInsert(payload.new as Student);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'students' },
        (payload) => {
          if (handlers.onStudentUpdate && payload.new) {
            handlers.onStudentUpdate(payload.new as Student);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'students' },
        (payload) => {
          if (handlers.onStudentDelete && payload.old) {
            handlers.onStudentDelete(payload.old.id);
          }
        }
      )
      // Fee Plans changes
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'fee_plans' },
        (payload) => {
          if (handlers.onFeePlanUpdate && payload.new) {
            handlers.onFeePlanUpdate(payload.new as ClassFeePlan);
          }
        }
      )
      // School Config changes
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'school_config' },
        (payload) => {
          if (handlers.onSchoolConfigUpdate && payload.new) {
            handlers.onSchoolConfigUpdate(payload.new as SchoolConfig);
          }
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }
};
