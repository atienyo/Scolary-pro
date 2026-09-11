import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AuthUser, UserRole } from '../types';

export const authService = {
  isConfigured: () => isSupabaseConfigured,

  // S'inscrire / Créer un compte
  async signUp(
    email: string,
    password: string,
    fullName: string,
    role: UserRole
  ): Promise<{ user: AuthUser | null; error?: string }> {
    if (!supabase) {
      // Fallback mode local
      const mockUser: AuthUser = {
        id: 'local-' + Date.now(),
        email,
        fullName,
        role
      };
      localStorage.setItem('scolarpay_auth_user', JSON.stringify(mockUser));
      return { user: mockUser };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
          }
        }
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const metadata = data.user.user_metadata || {};
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || email,
          fullName: metadata.full_name || metadata.name || fullName,
          role: (metadata.role as UserRole) || role,
          avatarUrl: metadata.avatar_url || metadata.picture
        };
        return { user: authUser };
      }

      return { user: null, error: 'Compte créé mais confirmation requise.' };
    } catch (err: any) {
      return { user: null, error: err.message || 'Erreur lors de la création de compte.' };
    }
  },

  // Se connecter avec email & mot de passe
  async signIn(
    email: string,
    password: string
  ): Promise<{ user: AuthUser | null; error?: string }> {
    if (!supabase) {
      // Fallback local
      const saved = localStorage.getItem('scolarpay_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email.toLowerCase() === email.toLowerCase()) {
          return { user: parsed };
        }
      }
      const defaultUser: AuthUser = {
        id: 'local-user-1',
        email,
        fullName: 'M. KOUASSI Jean-Baptiste',
        role: 'DIRECTOR'
      };
      localStorage.setItem('scolarpay_auth_user', JSON.stringify(defaultUser));
      return { user: defaultUser };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const metadata = data.user.user_metadata || {};
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || email,
          fullName: metadata.full_name || metadata.name || 'Utilisateur',
          role: (metadata.role as UserRole) || 'DIRECTOR',
          avatarUrl: metadata.avatar_url || metadata.picture
        };
        return { user: authUser };
      }

      return { user: null, error: 'Identifiants invalides.' };
    } catch (err: any) {
      return { user: null, error: err.message || 'Erreur lors de la connexion.' };
    }
  },

  // Se connecter / S'inscrire avec Google (OAuth)
  async signInWithGoogle(): Promise<{ user?: AuthUser; error?: string }> {
    if (!supabase) {
      // Fallback mode local / démo
      const mockGoogleUser: AuthUser = {
        id: 'google-local-' + Date.now(),
        email: 'directeur.google@saintjoseph-ci.edu',
        fullName: 'M. KOUASSI Jean-Baptiste',
        role: 'DIRECTOR',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
      };
      localStorage.setItem('scolarpay_auth_user', JSON.stringify(mockGoogleUser));
      return { user: mockGoogleUser };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'Erreur lors de la connexion avec Google.' };
    }
  },

  // Se déconnecter
  async signOut(): Promise<void> {
    localStorage.removeItem('scolarpay_auth_user');
    if (supabase) {
      await supabase.auth.signOut();
    }
  },

  // Récupérer l'utilisateur courant
  async getCurrentUser(): Promise<AuthUser | null> {
    if (!supabase) {
      const saved = localStorage.getItem('scolarpay_auth_user');
      return saved ? JSON.parse(saved) : null;
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) {
        const saved = localStorage.getItem('scolarpay_auth_user');
        return saved ? JSON.parse(saved) : null;
      }

      const user = session.user;
      const metadata = user.user_metadata || {};
      return {
        id: user.id,
        email: user.email || '',
        fullName: metadata.full_name || metadata.name || 'Utilisateur',
        role: (metadata.role as UserRole) || 'DIRECTOR',
        avatarUrl: metadata.avatar_url || metadata.picture
      };
    } catch {
      return null;
    }
  },

  // Modifier le mot de passe (Utilisateur connecté)
  async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur lors de la mise à jour du mot de passe.' };
    }
  },

  // Demander la réinitialisation du mot de passe par email
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur lors de la demande de réinitialisation.' };
    }
  },

  // Écouter les changements d'état d'authentification
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    if (!supabase) {
      return () => {};
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          const metadata = session.user.user_metadata || {};
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            fullName: metadata.full_name || metadata.name || 'Utilisateur',
            role: (metadata.role as UserRole) || 'DIRECTOR',
            avatarUrl: metadata.avatar_url || metadata.picture
          };
          callback(authUser);
        } else {
          callback(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }
};
