import React, { useState, useMemo } from 'react';
import { 
  X, 
  UserPlus, 
  Check, 
  GraduationCap, 
  Phone, 
  Mail, 
  Calendar,
  Percent,
  Bus,
  Utensils,
  Upload,
  Camera,
  Image as ImageIcon,
  Edit3
} from 'lucide-react';
import { Student, ClassFeePlan, SchoolConfig } from '../types';
import { formatCurrency } from '../utils/formatters';
import { storageService } from '../services/storageService';

interface NewStudentModalProps {
  initialStudent?: Student | null;
  feePlans: ClassFeePlan[];
  schoolConfig: SchoolConfig;
  onClose: () => void;
  onSaveStudent: (student: Student) => void;
}

export const NewStudentModal: React.FC<NewStudentModalProps> = ({
  initialStudent,
  feePlans,
  schoolConfig,
  onClose,
  onSaveStudent,
}) => {
  const isEditing = Boolean(initialStudent);
  const [matricule, setMatricule] = useState<string>(initialStudent?.matricule || `MAT-${Date.now().toString().slice(-5)}`);
  const [firstName, setFirstName] = useState<string>(initialStudent?.firstName || '');
  const [lastName, setLastName] = useState<string>(initialStudent?.lastName || '');
  const [gender, setGender] = useState<'M' | 'F'>(initialStudent?.gender || 'M');
  const [birthDate, setBirthDate] = useState<string>(initialStudent?.birthDate || '');
  const [classId, setClassId] = useState<string>(initialStudent?.classId || feePlans[0]?.classId || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(initialStudent?.avatarUrl || '');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  
  // Guardian
  const [guardianName, setGuardianName] = useState<string>(initialStudent?.guardianName || '');
  const [guardianRelation, setGuardianRelation] = useState<string>(initialStudent?.guardianRelation || 'Père');
  const [guardianPhone, setGuardianPhone] = useState<string>(initialStudent?.guardianPhone || '');
  const [guardianEmail, setGuardianEmail] = useState<string>(initialStudent?.guardianEmail || '');

  // Discount
  const [discountType, setDiscountType] = useState<string>(initialStudent?.discountType || 'NONE');
  const [canteen, setCanteen] = useState<boolean>(initialStudent?.optionalFees?.canteen || false);
  const [transport, setTransport] = useState<boolean>(initialStudent?.optionalFees?.transport || false);
  const [uniform, setUniform] = useState<boolean>(initialStudent?.optionalFees?.uniform || false);

  // Class plan
  const selectedPlan = feePlans.find((p) => p.classId === classId) || feePlans[0];

  // Discount percentage mapping
  const discountRate = useMemo(() => {
    switch (discountType) {
      case 'SCHOLARSHIP_25': return 25;
      case 'SCHOLARSHIP_50': return 50;
      case 'STAFF_CHILD_30': return 30;
      case 'SIBLING_15': return 15;
      default: return 0;
    }
  }, [discountType]);

  // Projected annual total
  const projectedTotal = useMemo(() => {
    const baseTuition = selectedPlan ? selectedPlan.totalTuition : 0;
    let total = baseTuition * (1 - discountRate / 100);
    if (uniform) total += 25000;
    if (canteen) total += 90000;
    if (transport) total += 75000;
    return total;
  }, [selectedPlan, discountRate, uniform, canteen, transport]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !guardianName) return;

    const savedStudent: Student = {
      id: initialStudent?.id || `std-${Date.now()}`,
      matricule: matricule || `MAT-${Date.now().toString().slice(-6)}`,
      firstName,
      lastName: lastName.toUpperCase(),
      gender,
      birthDate: birthDate || '',
      classId: selectedPlan?.classId || 'cls-default',
      className: selectedPlan?.className || 'Classe Standard',
      level: selectedPlan?.level || 'COLLEGE',
      avatarUrl: avatarUrl || undefined,
      guardianName,
      guardianRelation,
      guardianPhone,
      guardianEmail,
      discountType: discountType as any,
      discountPercentage: discountRate,
      optionalFees: { canteen, transport, uniform },
      enrollmentDate: initialStudent?.enrollmentDate || new Date().toISOString().split('T')[0],
    };

    onSaveStudent(savedStudent);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '680px' }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {isEditing ? <Edit3 size={20} color="var(--primary)" /> : <UserPlus size={20} color="var(--primary)" />}
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
              {isEditing ? `Modifier le Dossier de l'Élève : ${initialStudent?.lastName} ${initialStudent?.firstName}` : "Nouvelle Inscription & Dossier Scolaire"}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#e2e8f0'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Section: Identité de l'élève */}
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.75rem' }}>
              1. Identité & Photo de l'Élève
            </div>

            {/* Photo Avatar Upload Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: avatarUrl ? 'transparent' : '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: '2px solid #cbd5e1',
                flexShrink: 0
              }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Aperçu Élève" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Camera size={24} color="#64748b" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>
                  Photo d'identité (Optionnel)
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.35rem' }}>
                  Enregistrée dans Supabase Storage pour le dossier scolaire
                </div>
                <input
                  type="file"
                  id="student-photo-upload"
                  accept="image/png,image/jpeg"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setIsUploadingPhoto(true);
                      const res = await storageService.uploadStudentAvatar(matricule, file);
                      setIsUploadingPhoto(false);
                      if (res.url) {
                        setAvatarUrl(res.url);
                      }
                    }
                  }}
                />
                <label
                  htmlFor="student-photo-upload"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.3rem 0.65rem',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#4f46e5',
                    cursor: 'pointer'
                  }}
                >
                  <Upload size={12} />
                  <span>{isUploadingPhoto ? 'Envoi...' : avatarUrl ? 'Modifier photo' : 'Ajouter une photo'}</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Matricule Unique</label>
                <input
                  type="text"
                  required
                  value={matricule}
                  onChange={(e) => setMatricule(e.target.value)}
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Nom de Famille *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: KONE"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Prénoms *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: David Eric"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Genre</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="form-select"
                >
                  <option value="M">Masculin (M)</option>
                  <option value="F">Féminin (F)</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Date de Naissance</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Classe d'Affectation *</label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="form-select"
                  style={{ fontWeight: 700 }}
                >
                  {feePlans.length === 0 ? (
                    <option value="">(Aucune classe - Grilles Tarifaires)</option>
                  ) : (
                    feePlans.map((p) => (
                      <option key={p.classId} value={p.classId}>
                        {p.className} ({p.level === 'COLLEGE' ? 'Collège' : 'Lycée'})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Section: Tuteur / Parent */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.75rem' }}>
              2. Tuteur Légal & Contact
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Nom & Prénoms du Tuteur *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: M. Ousmane KONE"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Lien de Parenté</label>
                <select
                  value={guardianRelation}
                  onChange={(e) => setGuardianRelation(e.target.value)}
                  className="form-select"
                >
                  <option value="Père">Père</option>
                  <option value="Mère">Mère</option>
                  <option value="Tuteur légal">Tuteur légal</option>
                  <option value="Oncle / Tante">Oncle / Tante</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Téléphone / WhatsApp pour Relances *</label>
                <input
                  type="text"
                  required
                  placeholder="+225 07 00 00 00 00"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Adresse Email (Optionnel)</label>
                <input
                  type="email"
                  placeholder="parent@email.com"
                  value={guardianEmail}
                  onChange={(e) => setGuardianEmail(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Section: Bourse & Options */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.75rem' }}>
              3. Régime Financier & Frais Annexes
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Régime de Bourse / Réduction</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="form-select"
                >
                  <option value="NONE">Plein tarif (Aucune réduction)</option>
                  <option value="SCHOLARSHIP_25">Demi-Bourse (-25%)</option>
                  <option value="SCHOLARSHIP_50">Bourse Majeure (-50%)</option>
                  <option value="STAFF_CHILD_30">Enfant du Personnel Enseignant (-30%)</option>
                  <option value="SIBLING_15">Réduction Fratrie (-15%)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', justifyContent: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={uniform} onChange={(e) => setUniform(e.target.checked)} />
                  <span>Tenue & Uniforme scolaire (+25 000)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={canteen} onChange={(e) => setCanteen(e.target.checked)} />
                  <span>Demi-pension / Cantine (+90 000)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={transport} onChange={(e) => setTransport(e.target.checked)} />
                  <span>Transport scolaire (+75 000)</span>
                </label>
              </div>
            </div>

            {/* Projected Financial Summary Banner */}
            <div style={{
              background: '#f8fafc',
              border: '1.5px solid #dbe4ff',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '0.75rem'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Total Annuel Attendu
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Grille {selectedPlan?.className || 'Standard'} {discountRate > 0 && `(Réduction de ${discountRate}%)`}
                </div>
              </div>

              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)' }}>
                {formatCurrency(projectedTotal, schoolConfig.currency)}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Annuler
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '0.7rem 1.4rem' }}
            >
              {isEditing ? "Enregistrer les Modifications" : "Enregistrer l'Inscription"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
