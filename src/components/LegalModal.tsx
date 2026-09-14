import React, { useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  FileText, 
  CheckCircle2, 
  X, 
  Database,
  Smartphone,
  Eye, 
  Scale
} from 'lucide-react';

export type LegalModalType = 'PRIVACY' | 'TERMS' | 'SECURITY';

interface LegalModalProps {
  type: LegalModalType;
  onClose: () => void;
  onSelectType: (type: LegalModalType) => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  type,
  onClose,
  onSelectType,
}) => {
  // Lock body scroll and handle Escape key
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(7, 10, 18, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #0b0f19 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '860px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(59, 91, 219, 0.2)',
          overflow: 'hidden',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onSelectType('PRIVACY')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.9rem',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: type === 'PRIVACY' ? 'rgba(59, 91, 219, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                color: type === 'PRIVACY' ? '#93c5fd' : '#94a3b8',
                border: type === 'PRIVACY' ? '1px solid rgba(59, 91, 219, 0.5)' : '1px solid transparent'
              }}
            >
              <Eye size={15} />
              <span>Confidentialité</span>
            </button>

            <button
              onClick={() => onSelectType('TERMS')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.9rem',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: type === 'TERMS' ? 'rgba(59, 91, 219, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                color: type === 'TERMS' ? '#93c5fd' : '#94a3b8',
                border: type === 'TERMS' ? '1px solid rgba(59, 91, 219, 0.5)' : '1px solid transparent'
              }}
            >
              <Scale size={15} />
              <span>Conditions Générales</span>
            </button>

            <button
              onClick={() => onSelectType('SECURITY')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.9rem',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: type === 'SECURITY' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                color: type === 'SECURITY' ? '#6ee7b7' : '#94a3b8',
                border: type === 'SECURITY' ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid transparent'
              }}
            >
              <ShieldCheck size={15} />
              <span>Sécurité des Données</span>
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{
          padding: '1.75rem 2rem',
          overflowY: 'auto',
          flex: 1,
          color: '#cbd5e1',
          fontSize: '0.9rem',
          lineHeight: 1.7
        }}>
          {/* ================================================================
              1. POLITIQUE DE CONFIDENTIALITÉ
              ================================================================ */}
          {type === 'PRIVACY' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(59, 91, 219, 0.2)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                    Politique de Confidentialité
                  </h2>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Dernière mise à jour : 14 Septembre 2026 • Protection des Données Scolaires & Financières
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(59, 91, 219, 0.08)', border: '1px solid rgba(59, 91, 219, 0.2)', borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '1.5rem', color: '#93c5fd', fontSize: '0.85rem' }}>
                <strong>Engagement Fondamental :</strong> ScolarPay Pro protège rigoureusement la vie privée des élèves, parents et établissements scolaires partenaires. Vos données financières et vos effectifs ne sont ni vendus, ni cédés à des tiers à des fins publicitaires.
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginTop: '1.25rem', marginBottom: '0.5rem' }}>
                1. Données collectées par la plateforme
              </h3>
              <p>Dans le cadre de la gestion des frais scolaires, nous traitons uniquement les informations indispensables au suivi administratif et financier :</p>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
                <li><strong>Informations des Élèves :</strong> Nom, prénoms, matricule scolaire, date de naissance, classe, statut de boursier / affecté de l'État.</li>
                <li><strong>Informations des Tuteurs / Parents :</strong> Nom, numéro de téléphone (utilisé exclusivement pour les alertes de reçus ou relances), adresse email.</li>
                <li><strong>Données de Paiement & Transactions :</strong> Montant, mode de règlement (Espèces, Wave, Orange Money, MTN MoMo, Moov Money, Chèque), référence de transaction, date et horodatage de l'encaissement.</li>
                <li><strong>Données de l'Établissement :</strong> Dénomination officielle, code établissement, logo, coordonnées bancaires de dépôt et signatures autorisées pour l'arrêté de caisse.</li>
              </ul>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginTop: '1.25rem', marginBottom: '0.5rem' }}>
                2. Finalité du traitement des données
              </h3>
              <p>Les données recueillies sont strictement utilisées pour :</p>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
                <li>L'émission instantanée des reçus certifiés avec QR Code infalsifiable.</li>
                <li>Le calcul automatique des états de recouvrement, soldes restants et tableaux d'impayés.</li>
                <li>L'édition des journaux de caisse et arrêtés journaliers pour la Direction et l'Économe.</li>
                <li>La synchronisation sécurisée et la restauration des données en cas de panne matérielle locale.</li>
              </ul>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginTop: '1.25rem', marginBottom: '0.5rem' }}>
                3. Propriété et Droit d'Accès
              </h3>
              <p>
                L'établissement scolaire demeure le <strong>seul et unique propriétaire</strong> de sa base de données. À tout moment, le Directeur Général peut exporter l'intégralité des listes d'élèves, de paiements et de bilans comptables au format Excel (.xlsx) ou PDF, ou demander la suppression définitive de ses archives.
              </p>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginTop: '1.25rem', marginBottom: '0.5rem' }}>
                4. Contact Délégué à la Protection des Données (DPO)
              </h3>
              <p>
                Pour toute question relative à l'exercice de vos droits ou à la suppression de données : <strong style={{ color: '#60a5fa' }}>contact@scolarpay.pro</strong> ou via notre assistance WhatsApp.
              </p>
            </div>
          )}

          {/* ================================================================
              2. CONDITIONS GÉNÉRALES D'UTILISATION (CGU / CGV)
              ================================================================ */}
          {type === 'TERMS' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(59, 91, 219, 0.2)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                    Conditions Générales d'Utilisation & de Vente
                  </h2>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Régissant l'accès et l'exploitation de la solution SaaS ScolarPay Pro
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginTop: '1.25rem', marginBottom: '0.5rem' }}>
                1. Objet et Champ d'Application
              </h3>
              <p>
                Les présentes Conditions Générales définissent les modalités d'accès et d'utilisation de la plateforme logicielle en mode SaaS <strong>ScolarPay Pro</strong>, dédiée aux collèges, lycées et groupes scolaires pour la gestion de leurs encaissements, reçus et suivi d'échéances.
              </p>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginTop: '1.25rem', marginBottom: '0.5rem' }}>
                2. Rôles et Comptes Utilisateurs
              </h3>
              <p>
                L'établissement s'engage à attribuer les accès conformément aux responsabilités réelles de son personnel :
              </p>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
                <li><strong>Directeur Général :</strong> Supervision globale, arrêté de caisse, paramétrage de l'école et export financier.</li>
                <li><strong>Économe / Intendant :</strong> Configuration des grilles tarifaires, gestion des moratoires et validation des bordereaux.</li>
                <li><strong>Guichet Caissier :</strong> Enregistrement exclusif des paiements au guichet et impression des reçus thermiques ou A4.</li>
              </ul>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginTop: '1.25rem', marginBottom: '0.5rem' }}>
                3. Tarification et Modalités de Règlement
              </h3>
              <p>
                L'accès à la plateforme est consenti sous forme d'abonnement mensuel ou annuel sans engagement de longue durée. Les tarifs affichés sur la grille sont en Francs CFA (XOF) hors taxes. Le paiement s'effectue par virement, chèque ou Mobile Money institutionnel.
              </p>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginTop: '1.25rem', marginBottom: '0.5rem' }}>
                4. Disponibilité du Service & Mode Hors-Ligne (Offline First)
              </h3>
              <p>
                ScolarPay Pro garantit un taux de disponibilité Cloud supérieur à <strong>99.9%</strong>. En cas d'interruption temporaire du réseau Internet dans l'établissement, le mode local intelligent permet la continuité totale des encaissements et impressions de tickets sans interruption.
              </p>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginTop: '1.25rem', marginBottom: '0.5rem' }}>
                5. Résiliation et Récupération des Données
              </h3>
              <p>
                L'établissement peut suspendre ou résilier son abonnement à tout moment avec un préavis de 30 jours. À l'issue de la résiliation, un export intégral chiffré de toutes les données de l'année scolaire est remis à la Direction.
              </p>
            </div>
          )}

          {/* ================================================================
              3. SÉCURITÉ DES DONNÉES
              ================================================================ */}
          {type === 'SECURITY' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                    Sécurité & Protection des Données
                  </h2>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Normes de sécurité bancaire et cryptographie appliquée
                  </div>
                </div>
              </div>

              {/* Security Highlights Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', margin: '1.25rem 0 1.5rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '1rem' }}>
                  <div style={{ color: '#60a5fa', marginBottom: '0.4rem' }}><Lock size={20} /></div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>Chiffrement AES-256 & TLS 1.3</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Toutes les données en transit et au repos sont cryptées selon les standards bancaires.</div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '1rem' }}>
                  <div style={{ color: '#34d399', marginBottom: '0.4rem' }}><Database size={20} /></div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>Sauvegardes Quotidiennes</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Snapshots automatiques toutes les 24h avec réplication multi-régions Cloud Supabase.</div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '1rem' }}>
                  <div style={{ color: '#fbbf24', marginBottom: '0.4rem' }}><Smartphone size={20} /></div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>Reçus QR Code Infalsifiables</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Signature cryptographique unique pour authentifier chaque reçu en 1 seconde.</div>
                </div>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginTop: '1.25rem', marginBottom: '0.5rem' }}>
                1. Architecture et Cloisonnement des Données (Multi-Tenant)
              </h3>
              <p>
                Chaque école dispose d'un espace logique étanche. Les caissiers et économes d'un établissement ne peuvent en aucun cas accéder aux enregistrements d'une autre école. L'accès est protégé par la technologie Row Level Security (RLS) certifiée au niveau de la base de données.
              </p>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginTop: '1.25rem', marginBottom: '0.5rem' }}>
                2. Traçabilité Complète des Encaissements & Arrêtés
              </h3>
              <p>
                Chaque paiement enregistré au guichet conserve une piste d'audit inaltérable : identifiant du caissier connecté, horodatage à la seconde près, mode de règlement et numéro de référence. Les arrêtés de caisse génèrent un condensé numérique empêchant toute manipulation rétroactive des montants.
              </p>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginTop: '1.25rem', marginBottom: '0.5rem' }}>
                3. Sécurité des Paiements Mobile Money
              </h3>
              <p>
                ScolarPay Pro ne stocke aucun code secret ou code PIN de portefeuille Mobile Money (Wave, Orange, MTN). Les transactions reposent exclusivement sur la validation des numéros de référence officiels émis par les opérateurs de téléphonie.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.78rem' }}>
            <CheckCircle2 size={15} />
            <span>Document contractuel et certifié conforme</span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #3b5bdb 0%, #4f46e5 100%)',
              color: '#ffffff',
              padding: '0.55rem 1.35rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(59, 91, 219, 0.35)'
            }}
          >
            Fermer le document
          </button>
        </div>
      </div>
    </div>
  );
};
