import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Search, 
  PlusCircle, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  UserCheck, 
  FileSpreadsheet,
  Coins,
  Database,
  Cloud,
  CheckCircle2,
  LogOut,
  KeyRound,
  ChevronDown,
  User
} from 'lucide-react';
import { SchoolConfig, UserRole, AuthUser } from '../types';

interface HeaderProps {
  schoolConfig: SchoolConfig;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser?: AuthUser | null;
  onOpenCashier: () => void;
  onOpenDailyRegister: () => void;
  onQuickSearch: (query: string) => void;
  onLogout?: () => void;
  onOpenChangePassword?: () => void;
  isSupabaseConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  schoolConfig,
  currentRole,
  setCurrentRole,
  currentUser,
  onOpenCashier,
  onOpenDailyRegister,
  onQuickSearch,
  onLogout,
  onOpenChangePassword,
  isSupabaseConnected = false,
}) => {
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'DIRECTOR':
        return { label: 'Directeur Général', color: '#6366f1' };
      case 'BURSAR':
        return { label: 'Économe / Intendant', color: '#0ea5e9' };
      case 'CASHIER':
        return { label: 'Guichet Caisse', color: '#10b981' };
      default:
        return { label: 'Administrateur', color: '#3b5bdb' };
    }
  };

  const displayName = currentUser?.fullName || (
    currentRole === 'DIRECTOR' ? schoolConfig.directorName : currentRole === 'BURSAR' ? schoolConfig.bursarName : 'Mme KOUADIO'
  );

  return (
    <header className="header no-print" style={{
      height: '70px',
      background: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
    }}>
      {/* Left: Quick search input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', width: '380px' }}>
        <div style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search 
            size={17} 
            color="var(--text-muted)" 
            style={{ position: 'absolute', left: '0.85rem' }} 
          />
          <input
            type="text"
            placeholder="Rechercher élève (Matricule, Nom, Classe)..."
            onChange={(e) => onQuickSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.9rem 0.55rem 2.4rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
              background: '#f8fafc',
              fontSize: '0.85rem',
              transition: 'all 0.2s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 91, 219, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {/* Right: Live time, Role Switcher, Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Database Status Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          background: isSupabaseConnected ? '#ecfdf5' : '#f8fafc',
          border: `1px solid ${isSupabaseConnected ? '#a7f3d0' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-full)',
          padding: '0.35rem 0.75rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: isSupabaseConnected ? '#065f46' : 'var(--text-muted)'
        }}
        title={isSupabaseConnected ? 'Connecté à Supabase Cloud DB' : 'Mode Local'}
        >
          <Database size={13} color={isSupabaseConnected ? '#10b981' : 'var(--text-muted)'} />
          <span>{isSupabaseConnected ? 'Supabase Connecté' : 'Mode Local'}</span>
          {isSupabaseConnected && <CheckCircle2 size={12} color="#10b981" />}
        </div>

        {/* Clock & Date Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: '#f8fafc',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0.4rem 0.8rem',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={14} color="var(--primary)" />
            <span style={{ textTransform: 'capitalize' }}>{dateStr}</span>
          </div>
          <span style={{ color: 'var(--border-color)' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
            <Clock size={14} color="#10b981" />
            <span>{time}</span>
          </div>
        </div>

        {/* Arrêté de Caisse journalier */}
        <button
          onClick={onOpenDailyRegister}
          className="btn btn-secondary"
          style={{
            fontSize: '0.825rem',
            padding: '0.5rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}
          title="Consulter le journal et l'arrêté de caisse journalier"
        >
          <FileSpreadsheet size={15} color="var(--primary)" />
          <span>Arrêté de Caisse</span>
        </button>

        {/* Fast Cashier Button */}
        <button
          onClick={onOpenCashier}
          className="btn btn-primary"
          style={{
            fontSize: '0.825rem',
            padding: '0.5rem 0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}
        >
          <Coins size={16} />
          <span>Nouvel Encaissement</span>
        </button>

        {/* User Profile & Menu Area */}
        <div ref={menuRef} style={{ position: 'relative', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem', marginLeft: '0.25rem' }}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem 0.4rem',
              borderRadius: '8px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {displayName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: getRoleBadge(currentRole).color
                }} />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {getRoleBadge(currentRole).label}
                </span>
              </div>
            </div>

            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={displayName}
                referrerPolicy="no-referrer"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid rgba(59, 91, 219, 0.2)',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)'
                }}
              />
            ) : (
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b5bdb 0%, #4f46e5 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}>
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}

            <ChevronDown size={14} color="#64748b" style={{ transform: isMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {/* User Dropdown Menu */}
          {isMenuOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: '240px',
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
              padding: '0.5rem',
              zIndex: 100,
              animation: 'fadeIn 0.15s ease-out'
            }}>
              {/* User summary */}
              <div style={{
                padding: '0.75rem 0.85rem',
                borderBottom: '1px solid #f1f5f9',
                marginBottom: '0.35rem'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                  {displayName}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', wordBreak: 'break-all' }}>
                  {currentUser?.email || schoolConfig.email}
                </div>
                <div style={{
                  display: 'inline-block',
                  marginTop: '0.35rem',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: getRoleBadge(currentRole).color,
                  background: '#f8fafc',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0'
                }}>
                  {getRoleBadge(currentRole).label}
                </div>
              </div>

              {/* Modifier rôle rapide */}
              <div style={{ padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Rôle actif :</span>
                <select
                  value={currentRole}
                  onChange={(e) => {
                    setCurrentRole(e.target.value as UserRole);
                  }}
                  style={{
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    padding: '0.2rem 0.4rem',
                    background: '#ffffff',
                    fontWeight: 600,
                    color: '#334155'
                  }}
                >
                  <option value="DIRECTOR">Directeur</option>
                  <option value="BURSAR">Économe</option>
                  <option value="CASHIER">Caissier</option>
                </select>
              </div>

              {/* Option Modifier Mot de passe */}
              {onOpenChangePassword && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenChangePassword();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.6rem 0.85rem',
                    border: 'none',
                    background: 'none',
                    borderRadius: '8px',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <KeyRound size={15} color="#4f46e5" />
                  <span>Modifier mot de passe</span>
                </button>
              )}

              {/* Option Déconnexion */}
              {onLogout && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onLogout();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.6rem 0.85rem',
                    border: 'none',
                    background: 'none',
                    borderRadius: '8px',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    color: '#dc2626',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                    marginTop: '0.2rem',
                    borderTop: '1px solid #f1f5f9'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <LogOut size={15} color="#dc2626" />
                  <span>Se déconnecter</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

