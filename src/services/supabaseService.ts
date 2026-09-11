import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SchoolConfig, ClassFeePlan, Student, PaymentTransaction } from '../types';

export const supabaseService = {
  isConfigured: () => isSupabaseConfigured,

  // --- SCHOOL CONFIG ---
  async getSchoolConfig(): Promise<SchoolConfig | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('school_config')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('Erreur chargement school_config depuis Supabase:', error.message);
      return null;
    }
    return data;
  },

  async saveSchoolConfig(config: SchoolConfig): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
      .from('school_config')
      .upsert(config, { onConflict: 'id' });

    if (error) {
      console.error('Erreur sauvegarde school_config:', error.message);
      return false;
    }
    return true;
  },

  // --- FEE PLANS ---
  async getFeePlans(): Promise<ClassFeePlan[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('fee_plans')
      .select('*');

    if (error) {
      console.warn('Erreur chargement fee_plans:', error.message);
      return null;
    }
    return data;
  },

  async saveFeePlan(plan: ClassFeePlan): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
      .from('fee_plans')
      .upsert(plan, { onConflict: 'classId' });

    if (error) {
      console.error('Erreur sauvegarde fee_plan:', error.message);
      return false;
    }
    return true;
  },

  // --- STUDENTS ---
  async getStudents(): Promise<Student[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('lastName', { ascending: true });

    if (error) {
      console.warn('Erreur chargement students:', error.message);
      return null;
    }
    return data;
  },

  async addOrUpdateStudent(student: Student): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
      .from('students')
      .upsert(student, { onConflict: 'id' });

    if (error) {
      console.error('Erreur sauvegarde student:', error.message);
      return false;
    }
    return true;
  },

  async deleteStudent(id: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur suppression student:', error.message);
      return false;
    }
    return true;
  },

  // --- PAYMENTS ---
  async getPayments(): Promise<PaymentTransaction[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.warn('Erreur chargement payments:', error.message);
      return null;
    }
    return data;
  },

  async addPayment(payment: PaymentTransaction): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
      .from('payments')
      .insert(payment);

    if (error) {
      console.error('Erreur ajout payment:', error.message);
      return false;
    }
    return true;
  }
};
