import React, { useState } from 'react';
import { 
  GraduationCap, 
  Lock, 
  Mail, 
  User, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Sparkles,
  KeyRound,
  Coins
} from 'lucide-react';
import { authService } from '../services/authService';
import { AuthUser, UserRole } from '../types';

interface AuthViewProps {
  onAuthSuccess: (user: AuthUser) => void;
}

type AuthTab = 'LOGIN' | 'SIGNUP' | 'FORGOT';

const GoogleIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('LOGIN');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('DIRECTOR');
  const [showPassword, setShowPassword] = useState(false);

  // Status feedback
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoadingGoogle(true);

    const res = await authService.signInWithGoogle();
    setIsLoadingGoogle(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.user) {
      setSuccessMsg('Connexion avec Google réussie !');
      setTimeout(() => {
        onAuthSuccess(res.user!);
      }, 500);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    const res = await authService.signIn(email, password);
    setIsLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.user) {
      onAuthSuccess(res.user);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password.length < 6) {
      setErrorMsg('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    setIsLoading(true);
    const res = await authService.signUp(email, password, fullName, role);
    setIsLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.user) {
      setSuccessMsg('Compte créé avec succès ! Connexion automatique...');
      setTimeout(() => {
        onAuthSuccess(res.user!);
      }, 1200);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg('Veuillez saisir votre adresse email.');
      return;
    }

    setIsLoading(true);
    const res = await authService.resetPassword(email);
    setIsLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg('Un lien de réinitialisation a été envoyé à votre adresse email.');
    }
  };

  const handleDemoMode = () => {
    const demoUser: AuthUser = {
      id: 'demo-user',
      email: 'demo@saintjoseph-ci.edu',
      fullName: 'M. KOUASSI Jean-Baptiste',
      role: 'DIRECTOR'
    };
    onAuthSuccess(demoUser);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Glow Circles */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0,0,0,0) 70%)',
        top: '-100px',
        left: '-100px',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '450px',
        height: '450px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(0,0,0,0) 70%)',
        bottom: '-80px',
        right: '-80px',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      {/* Main Card */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Card Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #3b5bdb 0%, #4f46e5 100%)',
          padding: '2.2rem 2rem 1.8rem',
          textAlign: 'center',
          color: '#ffffff',
          position: 'relative'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
          }}>
            <GraduationCap size={32} color="#ffffff" />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            ScolarPay Pro
          </h1>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
            Gestion Scolaire & Encaissement des Frais
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc'
        }}>
          <button
            type="button"
            onClick={() => { setActiveTab('LOGIN'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '0.9rem',
              border: 'none',
              background: activeTab === 'LOGIN' ? '#ffffff' : 'transparent',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: activeTab === 'LOGIN' ? '#3b5bdb' : '#64748b',
              borderBottom: activeTab === 'LOGIN' ? '2px solid #3b5bdb' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('SIGNUP'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '0.9rem',
              border: 'none',
              background: activeTab === 'SIGNUP' ? '#ffffff' : 'transparent',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: activeTab === 'SIGNUP' ? '#3b5bdb' : '#64748b',
              borderBottom: activeTab === 'SIGNUP' ? '2px solid #3b5bdb' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Créer un compte
          </button>
        </div>

        {/* Content Area */}
        <div style={{ padding: '1.75rem 2rem 2rem' }}>
          {/* Feedback Alerts */}
          {errorMsg && (
            <div style={{
              padding: '0.8rem 1rem',
              borderRadius: '10px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: '0.825rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={17} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              padding: '0.8rem 1rem',
              borderRadius: '10px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#15803d',
              fontSize: '0.825rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle2 size={17} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'LOGIN' && (
            <div>
              {/* Google Sign-in Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isLoadingGoogle}
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem',
                  borderRadius: '10px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#1e293b',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: (isLoading || isLoadingGoogle) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.65rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  marginBottom: '1.25rem',
                  opacity: isLoadingGoogle ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && !isLoadingGoogle) {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.borderColor = '#94a3b8';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && !isLoadingGoogle) {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                  }
                }}
              >
                <GoogleIcon />
                <span>{isLoadingGoogle ? 'Connexion avec Google...' : 'Se connecter avec Google'}</span>
              </button>

              {/* Modern Divider */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                margin: '1.15rem 0',
                gap: '0.75rem'
              }}>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ou par email
                </span>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              </div>

              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '1.15rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Adresse Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={17} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="directeur@ecole.ci"
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '0.6rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Mot de passe
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={17} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem 2.4rem 0.65rem 2.4rem',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.85rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <div style={{ textAlign: 'right', marginBottom: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('FORGOT'); setErrorMsg(''); setSuccessMsg(''); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.78rem',
                      color: '#4f46e5',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #3b5bdb 0%, #4f46e5 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.925rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(59, 91, 219, 0.3)',
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  <span>{isLoading ? 'Connexion en cours...' : 'Se connecter'}</span>
                  <ArrowRight size={17} />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: SIGN UP */}
          {activeTab === 'SIGNUP' && (
            <div>
              {/* Google Sign-up Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isLoadingGoogle}
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem',
                  borderRadius: '10px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#1e293b',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: (isLoading || isLoadingGoogle) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.65rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  marginBottom: '1.25rem',
                  opacity: isLoadingGoogle ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && !isLoadingGoogle) {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.borderColor = '#94a3b8';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && !isLoadingGoogle) {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                  }
                }}
              >
                <GoogleIcon />
                <span>{isLoadingGoogle ? 'Inscription avec Google...' : "S'inscrire avec Google"}</span>
              </button>

              {/* Modern Divider */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                margin: '1.15rem 0',
                gap: '0.75rem'
              }}>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ou par email
                </span>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              </div>

              <form onSubmit={handleSignUp}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Nom complet
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={17} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="M. KOUASSI Jean-Baptiste"
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Adresse Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={17} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="exemple@saintjoseph-ci.edu"
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Rôle dans l'établissement
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Shield size={17} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        outline: 'none',
                        background: '#ffffff',
                        boxSizing: 'border-box',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="DIRECTOR">Directeur Général / Fondateur</option>
                      <option value="BURSAR">Économe / Intendant</option>
                      <option value="CASHIER">Caissier / Agent de Guichet</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Mot de passe (min. 6 caractères)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={17} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem 2.4rem 0.65rem 2.4rem',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.85rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.925rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  <span>{isLoading ? 'Création en cours...' : 'Créer mon compte'}</span>
                  <CheckCircle2 size={17} />
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: FORGOT PASSWORD */}
          {activeTab === 'FORGOT' && (
            <form onSubmit={handleForgotPassword}>
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <div style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '12px',
                  background: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem'
                }}>
                  <KeyRound size={22} />
                </div>
                <h3 style={{ margin: '0 0 0.3rem', fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>
                  Réinitialiser le mot de passe
                </h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                  Entrez votre email pour recevoir les instructions de réinitialisation.
                </p>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Adresse Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={17} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre.email@ecole.ci"
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #3b5bdb 0%, #4f46e5 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                <span>{isLoading ? 'Envoi en cours...' : 'Envoyer le lien'}</span>
              </button>

              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => { setActiveTab('LOGIN'); setErrorMsg(''); setSuccessMsg(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.8rem',
                    color: '#64748b',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  ← Retour à la connexion
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Access */}
          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px dashed #e2e8f0',
            textAlign: 'center'
          }}>
            <button
              type="button"
              onClick={handleDemoMode}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s'
              }}
            >
              <Sparkles size={13} color="#f59e0b" />
              <span>Accès rapide Démo (Directeur)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
