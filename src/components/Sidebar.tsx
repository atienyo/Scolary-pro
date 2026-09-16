import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Users, 
  AlertTriangle, 
  AlertOctagon,
  Settings2, 
  School, 
  GraduationCap, 
  Sliders, 
  DollarSign, 
  Layers, 
  X 
} from 'lucide-react';
import { SchoolConfig } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  schoolConfig: SchoolConfig;
  overdueCount: number;
  criticalCount?: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  schoolConfig,
  overdueCount,
  criticalCount = 0,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Configuration École',
      icon: Sliders,
      badge: null,
    },
    {
      id: 'fees',
      label: 'Grilles & Échéanciers',
      icon: Layers,
      badge: null,
    },
    {
      id: 'students',
      label: 'Élèves & Dossiers',
      icon: Users,
      badge: null,
    },
    {
      id: 'cashier',
      label: 'Guichet Caisse',
      icon: DollarSign,
      badge: 'Flash',
      badgeColor: '#10b981',
    },
    {
      id: 'overdue-critical',
      label: 'Cas Critiques (> 7j)',
      icon: AlertOctagon,
      badge: criticalCount > 0 ? `${criticalCount}` : null,
      badgeColor: '#dc2626',
    },
    {
      id: 'overdue',
      label: 'Impayés & Relances',
      icon: AlertTriangle,
      badge: overdueCount > 0 ? `${overdueCount}` : null,
      badgeColor: '#f59e0b',
    },
  ];

  return (
    <aside className={`sidebar no-print ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div style={{
        padding: '1.25rem 1.25rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b5bdb 0%, #0ea5e9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59, 91, 219, 0.4)',
            flexShrink: 0
          }}>
            <GraduationCap size={22} color="#fff" />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '1.15rem',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(to right, #ffffff, #93c5fd)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              ScolarPay <span style={{ 
                fontSize: '0.62rem', 
                background: '#3b5bdb', 
                color: '#fff', 
                padding: '2px 5px', 
                borderRadius: '4px',
                WebkitTextFillColor: '#fff',
                letterSpacing: '0.05em'
              }}>PRO</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              Collèges & Lycées SaaS
            </div>
          </div>
        </div>

        {/* Mobile Close Drawer Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
            }}
            aria-label="Fermer le menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* School Badge Active */}
      <div style={{
        margin: '1rem 1rem 0.5rem 1rem',
        padding: '0.8rem 0.9rem',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'rgba(59, 91, 219, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#60a5fa',
          flexShrink: 0
        }}>
          <School size={18} />
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ 
            fontSize: '0.8rem', 
            fontWeight: 600, 
            color: '#f1f5f9',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden'
          }}>
            {schoolConfig.shortName}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
            Année {schoolConfig.academicYear}
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{ padding: '0.75rem 0.65rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem', overflowY: 'auto' }}>
        <div style={{ 
          fontSize: '0.68rem', 
          textTransform: 'uppercase', 
          fontWeight: 700, 
          letterSpacing: '0.06em', 
          color: '#64748b', 
          padding: '0.4rem 0.75rem 0.2rem 0.75rem'
        }}>
          GESTION & CAISSE
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 0.95rem',
                borderRadius: 'var(--radius-md)',
                color: isActive ? '#ffffff' : '#94a3b8',
                background: isActive ? 'linear-gradient(90deg, #3b5bdb 0%, #2f49b5 100%)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                transition: 'all 0.15s ease',
                width: '100%',
                textAlign: 'left',
                boxShadow: isActive ? '0 4px 12px rgba(59, 91, 219, 0.35)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#f1f5f9';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <Icon size={19} color={isActive ? '#ffffff' : '#94a3b8'} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '10px',
                  background: item.badgeColor || '#3b5bdb',
                  color: '#fff',
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer info & Security stamp */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(0, 0, 0, 0.2)',
        fontSize: '0.75rem',
        color: '#64748b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', color: '#10b981' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          <span style={{ fontWeight: 600, fontSize: '0.72rem' }}>Caisse sécurisée en ligne</span>
        </div>
        <div>EduPay SaaS v2.4 • Multi-tenant</div>
      </div>
    </aside>
  );
};
