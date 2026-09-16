import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Save, 
  Check, 
  Calendar, 
  Coins, 
  Copy, 
  School,
  AlertCircle,
  Building,
  GraduationCap
} from 'lucide-react';
import { ClassFeePlan, SchoolConfig, SchoolLevel, InstallmentDef } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface FeeSettingsViewProps {
  feePlans: ClassFeePlan[];
  schoolConfig: SchoolConfig;
  onUpdateFeePlans: (newPlans: ClassFeePlan[]) => void;
}

export const FeeSettingsView: React.FC<FeeSettingsViewProps> = ({
  feePlans,
  schoolConfig,
  onUpdateFeePlans,
}) => {
  const [plans, setPlans] = useState<ClassFeePlan[]>(feePlans);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(feePlans[0]?.classId || '');
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  // New class modal state
  const [showAddClassModal, setShowAddClassModal] = useState<boolean>(false);
  const [newClassName, setNewClassName] = useState<string>('');
  const [newClassLevel, setNewClassLevel] = useState<SchoolLevel>('COLLEGE');

  // Sync if prop changes
  useEffect(() => {
    setPlans(feePlans);
  }, [feePlans]);

  // Current active plan
  const currentPlan = plans.find((p) => p.classId === selectedPlanId) || plans[0];

  // Modify installment field
  const handleUpdateInstallment = (
    installmentId: string, 
    field: keyof InstallmentDef, 
    value: any
  ) => {
    if (!currentPlan) return;

    const updatedInstallments = currentPlan.installments.map((inst) => {
      if (inst.id === installmentId) {
        return { ...inst, [field]: value };
      }
      return inst;
    });

    // Recompute total tuition as sum of installment amounts
    const updatedTotal = updatedInstallments.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);

    const updatedPlans = plans.map((p) => {
      if (p.classId === currentPlan.classId) {
        return {
          ...p,
          totalTuition: updatedTotal,
          installments: updatedInstallments,
        };
      }
      return p;
    });

    setPlans(updatedPlans);
    onUpdateFeePlans(updatedPlans);
  };

  // Modify class metadata (name, level)
  const handleUpdateClassMeta = (field: 'className' | 'level', value: any) => {
    if (!currentPlan) return;
    const updatedPlans = plans.map((p) => {
      if (p.classId === currentPlan.classId) {
        return { ...p, [field]: value };
      }
      return p;
    });
    setPlans(updatedPlans);
    onUpdateFeePlans(updatedPlans);
  };

  // Add a new installment to the current plan
  const handleAddInstallment = () => {
    if (!currentPlan) return;
    const nextIndex = currentPlan.installments.length + 1;
    const newInstallment: InstallmentDef = {
      id: `inst-${Date.now()}`,
      title: `${nextIndex}ème Tranche`,
      amount: 50000,
      dueDate: '2025-05-15',
      mandatory: true,
    };

    const updatedInstallments = [...currentPlan.installments, newInstallment];
    const updatedTotal = updatedInstallments.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);

    const updatedPlans = plans.map((p) => {
      if (p.classId === currentPlan.classId) {
        return {
          ...p,
          totalTuition: updatedTotal,
          installments: updatedInstallments,
        };
      }
      return p;
    });

    setPlans(updatedPlans);
    onUpdateFeePlans(updatedPlans);
  };

  // Delete an installment
  const handleDeleteInstallment = (installmentId: string) => {
    if (!currentPlan) return;
    if (currentPlan.installments.length <= 1) {
      alert('Une classe doit posséder au moins une tranche de paiement.');
      return;
    }

    const updatedInstallments = currentPlan.installments.filter((i) => i.id !== installmentId);
    const updatedTotal = updatedInstallments.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);

    const updatedPlans = plans.map((p) => {
      if (p.classId === currentPlan.classId) {
        return {
          ...p,
          totalTuition: updatedTotal,
          installments: updatedInstallments,
        };
      }
      return p;
    });

    setPlans(updatedPlans);
    onUpdateFeePlans(updatedPlans);
  };

  // Save all fee changes
  const handleSaveAll = () => {
    onUpdateFeePlans(plans);
    setSavedSuccess(`Grille tarifaire enregistrée pour la classe "${currentPlan.className}" !`);
    setTimeout(() => setSavedSuccess(null), 3000);
  };

  // Duplicate current fee plan to all classes of the same level
  const handleApplyToAllSameLevel = () => {
    if (!currentPlan) return;
    if (window.confirm(`Voulez-vous répliquer les montants et échéances de "${currentPlan.className}" à TOUTES les classes de niveau ${currentPlan.level === 'COLLEGE' ? 'Collège' : 'Lycée'} ?`)) {
      const updatedPlans = plans.map((p) => {
        if (p.level === currentPlan.level) {
          return {
            ...p,
            totalTuition: currentPlan.totalTuition,
            installments: currentPlan.installments.map((inst) => ({ ...inst, id: `inst-${p.classId}-${Math.random().toString().slice(2, 6)}` })),
          };
        }
        return p;
      });

      setPlans(updatedPlans);
      onUpdateFeePlans(updatedPlans);
      setSavedSuccess(`Grille appliquée à toutes les classes du ${currentPlan.level === 'COLLEGE' ? 'Collège' : 'Lycée'} avec succès !`);
      setTimeout(() => setSavedSuccess(null), 3500);
    }
  };

  // Create new class
  const handleCreateNewClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const newClassId = `cls-${Date.now()}`;
    const newClass: ClassFeePlan = {
      classId: newClassId,
      className: newClassName.trim(),
      level: newClassLevel,
      totalTuition: newClassLevel === 'COLLEGE' ? 340000 : 430000,
      installments: [
        { id: `inst-1-${newClassId}`, title: 'Inscription & Dossier', amount: 60000, dueDate: '2024-09-15', mandatory: true },
        { id: `inst-2-${newClassId}`, title: '1ère Tranche', amount: 120000, dueDate: '2024-10-15', mandatory: true },
        { id: `inst-3-${newClassId}`, title: '2ème Tranche', amount: 90000, dueDate: '2025-01-15', mandatory: true },
        { id: `inst-4-${newClassId}`, title: '3ème Tranche (Solde)', amount: 70000, dueDate: '2025-04-15', mandatory: true },
      ]
    };

    const updated = [...plans, newClass];
    setPlans(updated);
    onUpdateFeePlans(updated);
    setSelectedPlanId(newClassId);
    setShowAddClassModal(false);
    setNewClassName('');
    setSavedSuccess(`Nouvelle classe "${newClass.className}" créée avec succès !`);
    setTimeout(() => setSavedSuccess(null), 3000);
  };

  // Delete class
  const handleDeleteClass = (classId: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la classe "${currentPlan?.className || ''}" ?`)) {
      const updated = plans.filter((p) => p.classId !== classId);
      setPlans(updated);
      onUpdateFeePlans(updated);
      setSelectedPlanId(updated[0]?.classId || '');
      setSavedSuccess(`Classe supprimée.`);
      setTimeout(() => setSavedSuccess(null), 2500);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Top Title */}
      <div className="view-header-flex">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{
              background: '#ecfdf5',
              color: '#059669',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <Layers size={14} />
              GESTION TARIFAIRE
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Grilles Tarifaires & Échéanciers par Classe</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Modifiez directement les montants des scolarités, découpage en tranches et dates d'échéances pour chaque niveau.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowAddClassModal(true)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <Plus size={16} />
            <span>Ajouter une Classe</span>
          </button>

          <button
            onClick={handleSaveAll}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
          >
            <Save size={17} />
            <span>Enregistrer la Grille</span>
          </button>
        </div>
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
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{savedSuccess}</span>
        </div>
      )}

      {/* Main Grid: Class Selector on Left & Plan Editor on Right */}
      <div className="fees-split-grid">
        
        {/* Left: Classes List */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Classes Définies ({plans.length})</div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Cliquez pour éditer</span>
          </div>

          <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '580px', overflowY: 'auto' }}>
            {plans.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                <Layers size={28} style={{ margin: '0 auto 0.4rem', opacity: 0.35 }} />
                <div>Aucune classe configurée.</div>
              </div>
            ) : (
              plans.map((plan) => {
                const isSelected = plan.classId === currentPlan?.classId;
                return (
                  <button
                    key={plan.classId}
                    onClick={() => setSelectedPlanId(plan.classId)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? '#edf2ff' : '#ffffff',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      fontWeight: isSelected ? 800 : 600,
                      color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 2px 8px rgba(59, 91, 219, 0.15)' : 'none'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.9rem' }}>{plan.className}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                        {plan.level === 'COLLEGE' ? <Building size={12} /> : <GraduationCap size={12} />}
                        <span>{plan.level === 'COLLEGE' ? 'Collège' : 'Lycée'} • {plan.installments.length} tranches</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: isSelected ? 'var(--primary)' : '#0f172a' }}>
                        {formatCurrency(plan.totalTuition, schoolConfig.currency)}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Class Plan Editor */}
        {!currentPlan ? (
          <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
            <Layers size={44} style={{ margin: '0 auto 0.75rem', opacity: 0.35, color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.4rem' }}>Aucune classe configurée</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              Créez les classes de votre établissement et définissez leurs montants de scolarité ainsi que leur découpage en tranches.
            </p>
            <button
              type="button"
              onClick={() => setShowAddClassModal(true)}
              className="btn btn-primary"
              style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Plus size={16} />
              <span>Ajouter une première classe</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Plan Header Card */}
            <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em' }}>
                    ÉDITION DE LA GRILLE TARIFAIRE
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>
                    {currentPlan.className}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scolarité Totale Annuelle :</div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#059669' }}>
                    {formatCurrency(currentPlan.totalTuition, schoolConfig.currency)}
                  </div>
                </div>
              </div>

              {/* Class Metadata Inputs */}
              <div style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', alignItems: 'flex-end' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Nom de la Classe</label>
                    <input
                      type="text"
                      value={currentPlan.className}
                      onChange={(e) => handleUpdateClassMeta('className', e.target.value)}
                      className="form-input"
                      style={{ fontWeight: 700 }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Cycle / Niveau</label>
                    <select
                      value={currentPlan.level}
                      onChange={(e) => handleUpdateClassMeta('level', e.target.value as SchoolLevel)}
                      className="form-select"
                      style={{ fontWeight: 700 }}
                    >
                      <option value="COLLEGE">Collège (6ème - 3ème)</option>
                      <option value="LYCEE">Lycée (2nde - Tle)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={handleApplyToAllSameLevel}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '0.65rem 0.8rem', width: '100%' }}
                      title="Dupliquer ces montants à toutes les autres classes du même niveau"
                    >
                      <Copy size={14} />
                      <span>Dupliquer au niveau</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Installments Table Editor */}
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                      Tranches de Paiement & Dates Limites
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Le total de la scolarité ({formatCurrency(currentPlan.totalTuition, schoolConfig.currency)}) est automatiquement recalculé dès que vous modifiez un montant.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddInstallment}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                  >
                    <Plus size={15} color="var(--primary)" />
                    <span>Ajouter une Tranche</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {currentPlan.installments.map((inst, index) => (
                    <div
                      key={inst.id}
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--border-color)',
                        background: '#ffffff',
                        display: 'grid',
                        gridTemplateColumns: '2fr 1.5fr 1.5fr auto',
                        gap: '1rem',
                        alignItems: 'center',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                      }}
                    >
                      {/* Tranche Title */}
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>
                          Intitulé de la Tranche {index + 1}
                        </label>
                        <input
                          type="text"
                          value={inst.title}
                          onChange={(e) => handleUpdateInstallment(inst.id, 'title', e.target.value)}
                          className="form-input"
                          style={{ fontWeight: 700 }}
                          placeholder="Ex: 1ère Tranche, Solde..."
                        />
                      </div>

                      {/* Amount */}
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>
                          Montant ({schoolConfig.currency}) *
                        </label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input
                            type="number"
                            min={0}
                            step={1000}
                            value={inst.amount}
                            onChange={(e) => handleUpdateInstallment(inst.id, 'amount', Number(e.target.value))}
                            className="form-input"
                            style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: '1.05rem', color: '#0f172a' }}
                          />
                        </div>
                      </div>

                      {/* Due Date */}
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>
                          Date d'Échéance Limite
                        </label>
                        <input
                          type="date"
                          value={inst.dueDate}
                          onChange={(e) => handleUpdateInstallment(inst.id, 'dueDate', e.target.value)}
                          className="form-input"
                          style={{ fontSize: '0.85rem' }}
                        />
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.1rem' }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteInstallment(inst.id)}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: '#fee2e2',
                            color: '#dc2626',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease'
                          }}
                          title="Supprimer cette tranche"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Card Actions */}
                <div style={{
                  marginTop: '1.75rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <button
                    type="button"
                    onClick={() => handleDeleteClass(currentPlan.classId)}
                    className="btn btn-danger"
                    style={{ fontSize: '0.8rem' }}
                  >
                    <Trash2 size={15} />
                    <span>Supprimer la classe "{currentPlan.className}"</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAll}
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem', fontWeight: 800 }}
                  >
                    <Save size={18} />
                    <span>Enregistrer les Tarifs de {currentPlan.className}</span>
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>

      {/* Modal Add New Class */}
      {showAddClassModal && (
        <div className="modal-overlay" onClick={() => setShowAddClassModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="card-header">
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Ajouter une Nouvelle Classe</div>
            </div>

            <form onSubmit={handleCreateNewClass} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Nom de la Classe *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 1ère C, 6ème C, Terminale A2..."
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="form-input"
                  style={{ fontWeight: 700 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cycle / Niveau</label>
                <select
                  value={newClassLevel}
                  onChange={(e) => setNewClassLevel(e.target.value as SchoolLevel)}
                  className="form-select"
                >
                  <option value="COLLEGE">Collège (6ème à 3ème)</option>
                  <option value="LYCEE">Lycée (2nde à Terminale)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="btn btn-secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Créer la Classe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
