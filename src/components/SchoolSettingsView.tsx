import React, { useState, useEffect } from 'react';
import { 
  School, 
  Save, 
  Check, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Coins, 
  Calendar, 
  FileCheck, 
  UserCheck, 
  Download, 
  RotateCcw,
  Upload,
  Image,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { SchoolConfig, Currency } from '../types';
import { initialSchoolConfig } from '../data/mockData';
import { storageService } from '../services/storageService';

interface SchoolSettingsViewProps {
  schoolConfig: SchoolConfig;
  onUpdateSchoolConfig: (newConfig: SchoolConfig) => void;
}

export const SchoolSettingsView: React.FC<SchoolSettingsViewProps> = ({
  schoolConfig,
  onUpdateSchoolConfig,
}) => {
  const [formData, setFormData] = useState<SchoolConfig>(schoolConfig);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState<boolean>(false);
  const [isUploadingStamp, setIsUploadingStamp] = useState<boolean>(false);

  // Sync state if prop changes
  useEffect(() => {
    setFormData(schoolConfig);
  }, [schoolConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSchoolConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Voulez-vous restaurer les informations par défaut de l\'établissement ?')) {
      setFormData(initialSchoolConfig);
      onUpdateSchoolConfig(initialSchoolConfig);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Top Title */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{
              background: '#edf2ff',
              color: 'var(--primary)',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <School size={14} />
              ADMINISTRATION & PARAMÈTRES
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Configuration de l'Établissement</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Personnalisez l'identité de l'école, la devise monétaire, l'année scolaire et les informations des quittances officielles.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.5rem 0.85rem' }}
        >
          <RotateCcw size={14} />
          <span>Valeurs par défaut</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {savedSuccess && (
        <div style={{
          background: '#ecfdf5',
          border: '1.5px solid #a7f3d0',
          color: '#065f46',
          padding: '1rem 1.4rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <Check size={20} color="#059669" />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Configuration enregistrée avec succès !</div>
            <div style={{ fontSize: '0.8rem', color: '#047857' }}>
              Les modifications ont été immédiatement appliquées à tous les reçus, statistiques et tableaux de bord.
            </div>
          </div>
        </div>
      )}

      {/* Main Settings Form Card */}
      <div className="card" style={{ maxWidth: '960px', boxShadow: 'var(--shadow-md)' }}>
        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          
          {/* Section 1: Identité de l'école */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              paddingBottom: '0.75rem',
              borderBottom: '1.5px solid var(--border-subtle)',
              marginBottom: '1.25rem'
            }}>
              <Building size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                1. Identité Officielle de l'Établissement
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Nom Complet de l'Établissement *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  style={{ fontWeight: 700 }}
                  placeholder="Ex: Collège & Lycée International Sainte-Marie"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Sigle / Nom Court *</label>
                <input
                  type="text"
                  required
                  value={formData.shortName}
                  onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                  className="form-input"
                  style={{ fontWeight: 700 }}
                  placeholder="Ex: CLISMA"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Devise / Slogan de l'École</label>
                <input
                  type="text"
                  value={formData.motto}
                  onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                  className="form-input"
                  placeholder="Ex: Discipline - Travail - Réussite"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Code d'Agrément Ministère / Établissement *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                  placeholder="Ex: EP-CI-2024"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Année scolaire & Devise Monétaire */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              paddingBottom: '0.75rem',
              borderBottom: '1.5px solid var(--border-subtle)',
              marginBottom: '1.25rem'
            }}>
              <Coins size={18} color="#10b981" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                2. Période Scolaire & Monnaie de Gestion
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Devise Monétaire Principale *</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
                  className="form-select"
                  style={{ fontWeight: 800, fontSize: '0.95rem', borderColor: '#10b981' }}
                >
                  <option value="XOF">FCFA (Franc CFA - UEMOA / CEMAC)</option>
                  <option value="EUR">Euro (€ - EUR)</option>
                  <option value="USD">Dollar Américain ($ - USD)</option>
                </select>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  Tous les montants de l'application et des quittances seront affichés dans cette devise.
                </span>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Année Scolaire Active *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Calendar size={16} color="var(--primary)" style={{ position: 'absolute', left: '0.85rem' }} />
                  <input
                    type="text"
                    required
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="form-input"
                    style={{ paddingLeft: '2.4rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}
                    placeholder="2024-2025"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Coordonnées & Contacts */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              paddingBottom: '0.75rem',
              borderBottom: '1.5px solid var(--border-subtle)',
              marginBottom: '1.25rem'
            }}>
              <MapPin size={18} color="#0ea5e9" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                3. Localisation & Contacts Guichet
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Adresse Physique / Rue</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="form-input"
                  placeholder="Ex: Boulevard de la Paix, Cocody Riviera 3"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Ville</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="form-input"
                  placeholder="Ex: Abidjan"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Pays</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="form-input"
                  placeholder="Ex: Côte d'Ivoire"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Téléphone de Contact Guichet / Comptabilité *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Phone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem' }} />
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input"
                    style={{ paddingLeft: '2.4rem' }}
                    placeholder="+225 07 08 12 34 56"
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email Officiel</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem' }} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                    style={{ paddingLeft: '2.4rem' }}
                    placeholder="direction@ecole.org"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Signataires & Mentions de Quittance */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              paddingBottom: '0.75rem',
              borderBottom: '1.5px solid var(--border-subtle)',
              marginBottom: '1.25rem'
            }}>
              <UserCheck size={18} color="#6366f1" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                4. Responsables & Mentions pour les Reçus Officiels
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Nom du Directeur / Chef d'Établissement</label>
                <input
                  type="text"
                  value={formData.directorName}
                  onChange={(e) => setFormData({ ...formData, directorName: e.target.value })}
                  className="form-input"
                  style={{ fontWeight: 600 }}
                  placeholder="Prof. Amadou KOUYATE"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Nom de l'Économe / Intendant</label>
                <input
                  type="text"
                  value={formData.bursarName}
                  onChange={(e) => setFormData({ ...formData, bursarName: e.target.value })}
                  className="form-input"
                  style={{ fontWeight: 600 }}
                  placeholder="Mme Fatoumata CISSE"
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Mention Gravée sur le Tampon Officiel</label>
              <input
                type="text"
                value={formData.stampText}
                onChange={(e) => setFormData({ ...formData, stampText: e.target.value })}
                className="form-input"
                placeholder="SERVICE DE L'INTENDANCE ET DU RECOUVREMENT"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                Cette mention apparaîtra sous la signature sur chaque quittance délivrée.
              </span>
            </div>
          </div>

          {/* Section 5: Identité Visuelle & Stockage Cloud (Supabase Storage) */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              paddingBottom: '0.75rem',
              borderBottom: '1.5px solid var(--border-subtle)',
              marginBottom: '1.25rem'
            }}>
              <Sparkles size={18} color="#f59e0b" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                5. Identité Visuelle & Fichiers Cloud (Supabase Storage)
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Logo Upload Box */}
              <div style={{
                border: '1px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '1.25rem',
                background: '#f8fafc',
                textAlign: 'center'
              }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                  Logo Officiel de l'Établissement
                </label>
                {formData.logoUrl ? (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <img 
                      src={formData.logoUrl} 
                      alt="Logo École" 
                      style={{ maxHeight: '80px', maxWidth: '100%', objectFit: 'contain', borderRadius: '6px' }}
                    />
                  </div>
                ) : (
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.75rem',
                    color: '#64748b'
                  }}>
                    <Image size={28} />
                  </div>
                )}
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/png,image/jpeg,image/svg+xml"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setIsUploadingLogo(true);
                      const res = await storageService.uploadSchoolLogo(file);
                      setIsUploadingLogo(false);
                      if (res.url) {
                        setFormData({ ...formData, logoUrl: res.url });
                      }
                    }
                  }}
                />
                <label
                  htmlFor="logo-upload"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.9rem',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#4f46e5',
                    cursor: 'pointer'
                  }}
                >
                  <Upload size={14} />
                  <span>{isUploadingLogo ? 'Upload en cours...' : 'Changer le Logo'}</span>
                </label>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                  PNG, JPG ou SVG (Max. 2 Mo) - Stocké sur Supabase Cloud
                </div>
              </div>

              {/* Cachet Upload Box */}
              <div style={{
                border: '1px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '1.25rem',
                background: '#f8fafc',
                textAlign: 'center'
              }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                  Tampon / Cachet Numérique de Caisse
                </label>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: '#e0e7ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                  color: '#4f46e5'
                }}>
                  <ShieldCheck size={28} />
                </div>
                <input
                  type="file"
                  id="stamp-upload"
                  accept="image/png,image/jpeg"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setIsUploadingStamp(true);
                      const res = await storageService.uploadSchoolStamp(file);
                      setIsUploadingStamp(false);
                      if (res.url) {
                        alert('Cachet officiel sauvegardé avec succès dans Supabase Storage !');
                      }
                    }
                  }}
                />
                <label
                  htmlFor="stamp-upload"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.9rem',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#4f46e5',
                    cursor: 'pointer'
                  }}
                >
                  <Upload size={14} />
                  <span>{isUploadingStamp ? 'Upload en cours...' : 'Uploader le Cachet'}</span>
                </label>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                  Image avec fond transparent recommandée
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-color)'
          }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: '0.85rem 1.75rem',
                fontSize: '1rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}
            >
              <Save size={18} />
              <span>Enregistrer la Configuration de l'École</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
