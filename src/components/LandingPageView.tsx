import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Coins, 
  QrCode, 
  Smartphone, 
  FileSpreadsheet, 
  Clock, 
  BarChart3, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Menu, 
  X, 
  Check, 
  Calculator, 
  Lock, 
  Cloud, 
  Star,
  Receipt,
  Layers,
  PhoneCall,
  Mail,
  Zap,
  CheckCircle
} from 'lucide-react';
import heroBannerImg from '../assets/hero-banner.jpg';
import cashierCounterImg from '../assets/cashier-counter.jpg';
import './LandingPage.css';

interface LandingPageViewProps {
  onStartDemo: () => void;
  onOpenLogin: () => void;
  onOpenSignUp: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onStartDemo,
  onOpenLogin,
  onOpenSignUp
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Track window scroll to enhance sticky navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Interactive ROI Calculator States
  const [studentCount, setStudentCount] = useState<number>(650);
  const [avgTuition, setAvgTuition] = useState<number>(180000); // 180 000 FCFA

  // Calculated estimates
  const totalTuitionBudget = studentCount * avgTuition;
  const estimatedUnpaidRecovered = Math.round(totalTuitionBudget * 0.08); // 8% recovered fees
  const hoursSavedPerMonth = Math.round(studentCount * 0.06 + 15); // e.g. ~54 hours saved

  const formatCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqData = [
    {
      q: "L'application fonctionne-t-elle sans connexion Internet ?",
      a: "Oui ! ScolarPay Pro intègre un mode local intelligent. Vous pouvez continuer à encaisser au guichet et imprimer vos reçus en continu. Dès que la connexion est rétablie, les données se synchronisent automatiquement avec le Cloud sécurisé Supabase."
    },
    {
      q: "Quels modes de paiement sont pris en charge ?",
      a: "ScolarPay Pro centralise les paiements en Espèces (avec calcul de monnaie rendu), Mobile Money (Wave, Orange Money, MTN MoMo, Moov Money), Virements bancaires et Chèques avec numéros de référence pour un suivi comptable irréprochable."
    },
    {
      q: "Comment sont générés et imprimés les reçus ?",
      a: "Chaque encaissement génère instantanément un reçu certifié infalsifiable muni d'un QR Code de vérification unique. Vous pouvez imprimer en format Ticket de caisse thermique (80mm/58mm) ou au format officiel A4."
    },
    {
      q: "Combien de temps faut-il pour démarrer avec notre établissement ?",
      a: "Moins de 15 minutes ! Vous configurez vos classes et tranches de scolarité, puis vous pouvez importer la liste de vos élèves existants par fichier Excel/CSV ou les saisir au fur et à mesure."
    },
    {
      q: "Est-ce sécurisé pour la gestion des rôles (Directeur, Économe, Caissier) ?",
      a: "Absolument. ScolarPay Pro intègre un contrôle d'accès strict par rôle. Les caissiers ne voient que le guichet de paiement, l'économe gère les grilles et relances, et le Directeur dispose de la vue analytique globale et de l'arrêté de caisse."
    }
  ];

  return (
    <div className="landing-page">
      {/* Ambient background glow effects */}
      <div className="landing-glow glow-1" />
      <div className="landing-glow glow-2" />
      <div className="landing-glow glow-3" />

      {/* --------------------------------------------------------------------
          NAVBAR (Sticky / Visible on Scroll)
          -------------------------------------------------------------------- */}
      <header className={`landing-nav ${isScrolled ? 'landing-nav-scrolled' : ''}`}>
        <div className="landing-container landing-nav-inner">
          {/* Logo Brand */}
          <a href="#" className="landing-brand" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <div className="landing-logo-icon">
              <GraduationCap size={22} color="#ffffff" />
            </div>
            <div className="landing-brand-text">
              ScolarPay <span className="landing-brand-badge">PRO</span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="landing-nav-links">
            <a className="landing-nav-link" onClick={() => scrollToSection('features')}>Fonctionnalités</a>
            <a className="landing-nav-link" onClick={() => scrollToSection('how-it-works')}>Comment ça marche</a>
            <a className="landing-nav-link" onClick={() => scrollToSection('pricing')}>Tarifs</a>
          </nav>

          {/* Desktop Nav Actions */}
          <div className="landing-nav-actions">
            <button className="btn-nav-login" onClick={onOpenLogin}>
              Se connecter
            </button>
            <button className="btn-nav-cta" onClick={onStartDemo}>
              <Sparkles size={15} />
              <span>Tester la Démo</span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button 
            className="btn-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer - OUTSIDE <header> to avoid backdrop-filter stacking trap */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GraduationCap size={20} color="#60a5fa" />
                <span className="mobile-drawer-tag">Menu Navigation</span>
              </div>
              <button 
                className="btn-mobile-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fermer le menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mobile-drawer-links">
              <a className="mobile-drawer-link" onClick={() => scrollToSection('features')}>
                <div className="drawer-link-left">
                  <div className="drawer-icon-box" style={{ background: 'rgba(59, 91, 219, 0.15)', color: '#60a5fa' }}>
                    <Zap size={18} />
                  </div>
                  <div>
                    <span className="drawer-link-title">Fonctionnalités</span>
                    <span className="drawer-link-sub">Gestion complète des frais & caisse</span>
                  </div>
                </div>
                <ArrowRight size={16} className="drawer-arrow" />
              </a>

              <a className="mobile-drawer-link" onClick={() => scrollToSection('how-it-works')}>
                <div className="drawer-link-left">
                  <div className="drawer-icon-box" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                    <Clock size={18} />
                  </div>
                  <div>
                    <span className="drawer-link-title">Comment ça marche</span>
                    <span className="drawer-link-sub">Prise en main en 3 étapes simples</span>
                  </div>
                </div>
                <ArrowRight size={16} className="drawer-arrow" />
              </a>

              <a className="mobile-drawer-link" onClick={() => scrollToSection('pricing')}>
                <div className="drawer-link-left">
                  <div className="drawer-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                    <Star size={18} />
                  </div>
                  <div>
                    <span className="drawer-link-title">Grille tarifaire</span>
                    <span className="drawer-link-sub">Formules transparentes sans surprise</span>
                  </div>
                </div>
                <ArrowRight size={16} className="drawer-arrow" />
              </a>
            </div>

            <div className="mobile-drawer-actions">
              <button 
                className="btn-hero-primary" 
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => { setMobileMenuOpen(false); onStartDemo(); }}
              >
                <Sparkles size={18} />
                <span>Tester la Démo interactive</span>
              </button>

              <button 
                className="btn-hero-secondary" 
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => { setMobileMenuOpen(false); onOpenLogin(); }}
              >
                <Lock size={16} color="#60a5fa" />
                <span>Accès Espace Établissement</span>
              </button>

              <button 
                className="btn-mobile-signup"
                onClick={() => { setMobileMenuOpen(false); onOpenSignUp(); }}
              >
                <span>Créer un nouveau compte école →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------
          HERO SECTION (Integrated Split 2-Column Showcase)
          -------------------------------------------------------------------- */}
      <section className="landing-hero">
        <div className="landing-container">
          {/* Integrated Split Layout: Text on Left, Visual Showcase on Right */}
          <div className="hero-split-grid">
            {/* Left Column: Heading, Subtitle & CTAs */}
            <div className="hero-content-col">
              {/* Trust Pill */}
              <div className="hero-pill-badge">
                <Sparkles size={14} color="#60a5fa" />
                <span>N°1 de l'encaissement scolaire en Afrique de l'Ouest</span>
              </div>

              {/* Main Title */}
              <h1 className="hero-title">
                Simplifiez la gestion scolaire &{' '}
                <span className="hero-title-gradient">sécurisez 100% de vos encaissements</span>
              </h1>

              {/* Subtitle */}
              <p className="hero-subtitle">
                Guichet caisse ultra-rapide (Espèces & Mobile Money Wave/Orange/MTN), émission instantanée de reçus certifiés avec QR Code, suivi automatique des impayés et arrêté de caisse infalsifiable pour Collèges et Lycées.
              </p>

              {/* Call to Actions (CTAs) */}
              <div className="hero-cta-group">
                <button className="btn-hero-primary" onClick={onStartDemo}>
                  <Sparkles size={19} />
                  <span>Tester la Démo interactive</span>
                  <ArrowRight size={19} />
                </button>

                <button className="btn-hero-secondary" onClick={onOpenSignUp}>
                  <Lock size={18} color="#60a5fa" />
                  <span>Créer un compte école</span>
                </button>
              </div>

              {/* Trust bullet points */}
              <div className="hero-trust-bar">
                <div className="hero-trust-item">
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Essai gratuit sans carte bancaire</span>
                </div>
                <div className="hero-trust-item">
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Déploiement en 15 min</span>
                </div>
                <div className="hero-trust-item">
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Support WhatsApp 7j/7</span>
                </div>
              </div>
            </div>

            {/* Right Column: Integrated Realistic Visual Showcase */}
            <div className="hero-visual-col">
              <div className="hero-image-frame">
                <img 
                  src={heroBannerImg} 
                  alt="Gestion financière et scolarité moderne en Afrique de l'Ouest" 
                  className="hero-image"
                  loading="eager"
                />
                <div className="hero-image-gradient-overlay" />
                
                {/* Floating Badges overlaying the image */}
                <div className="hero-floating-badge badge-top-left">
                  <div className="badge-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
                    <CheckCircle2 size={18} />
                  </div>
                  <div className="badge-text-wrap">
                    <span className="badge-label">Taux de recouvrement</span>
                    <span className="badge-value" style={{ color: '#10b981' }}>99.4% à date</span>
                  </div>
                </div>

                <div className="hero-floating-badge badge-bottom-right">
                  <div className="badge-icon-wrap" style={{ background: 'rgba(59, 91, 219, 0.25)', color: '#60a5fa' }}>
                    <QrCode size={18} />
                  </div>
                  <div className="badge-text-wrap">
                    <span className="badge-label">Reçus infalsifiables</span>
                    <span className="badge-value" style={{ color: '#ffffff' }}>QR Code Certifié</span>
                  </div>
                </div>

                <div className="hero-image-caption-pill">
                  <span className="live-pulse-dot" />
                  <span className="caption-pill-text">Établissements partenaires en Côte d'Ivoire & Afrique</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          KEY METRICS / SOCIAL PROOF
          -------------------------------------------------------------------- */}
      <section className="metrics-section">
        <div className="landing-container">
          <div className="metrics-grid">
            <div>
              <div className="metric-number">+150</div>
              <div className="metric-label">Collèges & Lycées partenaires</div>
            </div>
            <div>
              <div className="metric-number">+45 000</div>
              <div className="metric-label">Élèves gérés chaque année</div>
            </div>
            <div>
              <div className="metric-number">3x plus rapide</div>
              <div className="metric-label">Encaissement & Émission de reçu</div>
            </div>
            <div>
              <div className="metric-number">0 Erreur</div>
              <div className="metric-label">Écarts de caisse éliminés</div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          CORE FEATURES GRID
          -------------------------------------------------------------------- */}
      <section id="features" className="features-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-tag">Fonctionnalités Clés</span>
            <h2 className="section-title">Tout ce dont votre établissement a besoin pour réussir</h2>
            <p className="section-desc">
              Une plateforme pensée spécialement pour les réalités administratives et financières des collèges et lycées africains.
            </p>
          </div>

          <div className="features-grid">
            {/* Feature 1 */}
            <div className="feature-card">
              <div className="feature-icon-box" style={{ background: 'rgba(59, 91, 219, 0.15)', color: '#60a5fa' }}>
                <Coins size={26} />
              </div>
              <h3 className="feature-title">Guichet Caisse Ultra-Rapide</h3>
              <p className="feature-desc">
                Enregistrez un paiement en moins de 15 secondes. Calcul automatique de la monnaie à rendre, gestion des acomptes et historique instantané.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card">
              <div className="feature-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                <Smartphone size={26} />
              </div>
              <h3 className="feature-title">Mobile Money & Multi-Paiements</h3>
              <p className="feature-desc">
                Encaissez facilement par Wave, Orange Money, MTN MoMo, Moov Money, Chèque, Virement ou Espèces avec traçabilité complète des références.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card">
              <div className="feature-icon-box" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                <QrCode size={26} />
              </div>
              <h3 className="feature-title">Reçus Certifiés avec QR Code</h3>
              <p className="feature-desc">
                Génération immédiate de reçus officiels infalsifiables. Impression directe sur imprimante thermique (ticket de caisse) ou format A4.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="feature-card">
              <div className="feature-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                <BarChart3 size={26} />
              </div>
              <h3 className="feature-title">Suivi des Impayés & Relances</h3>
              <p className="feature-desc">
                Visualisez en un clic les élèves en retard par classe, les moratoires accordés et exportez des listes de relance pour les parents d'élèves.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="feature-card">
              <div className="feature-icon-box" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }}>
                <FileSpreadsheet size={26} />
              </div>
              <h3 className="feature-title">Arrêté de Caisse Journalier</h3>
              <p className="feature-desc">
                Clôturez vos journées en toute sérénité. Édition du journal de caisse horodaté avec signature du caissier et du Directeur, export PDF & Excel.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="feature-card">
              <div className="feature-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                <ShieldCheck size={26} />
              </div>
              <h3 className="feature-title">Sécurité Multi-Postes & Cloud</h3>
              <p className="feature-desc">
                Accès cloisonné pour Directeurs, Économes et Caissiers. Données sauvegardées en temps réel sur le Cloud avec mode de secours local.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          FEATURE SPOTLIGHT : GUICHET CAISSE & MOBILE MONEY
          -------------------------------------------------------------------- */}
      <section id="guichet" className="spotlight-section">
        <div className="landing-container">
          <div className="spotlight-card">
            <div className="spotlight-grid">
              {/* Media Col Left */}
              <div className="spotlight-media-col">
                <div className="spotlight-image-wrapper">
                  <img 
                    src={cashierCounterImg} 
                    alt="Guichet caisse scolaire moderne avec paiement Mobile Money et impression de reçu thermique" 
                    className="spotlight-image"
                    loading="lazy"
                  />
                  <div className="spotlight-badge-overlay">
                    <div className="spotlight-badge-icon">
                      <Receipt size={18} />
                    </div>
                    <div className="badge-text-wrap">
                      <span className="spotlight-badge-label">Impression instantanée</span>
                      <span className="spotlight-badge-val">Ticket Thermique 80mm & A4</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Col Right */}
              <div className="spotlight-content-col">
                <div className="section-tag" style={{ display: 'inline-flex', marginBottom: '1rem', width: 'fit-content' }}>
                  <Sparkles size={13} style={{ marginRight: '6px' }} /> Réalité du Terrain au Guichet
                </div>
                <h3 className="spotlight-title">
                  Un guichet fluide, des parents rassurés et <span className="hero-title-gradient">zéro litige financier</span>
                </h3>
                <p className="spotlight-desc">
                  Transformez la période des inscriptions et paiements de tranches. Vos caissiers et économes enregistrent les règlements en un éclair avec confirmation et reçu certifié immédiat.
                </p>

                <div className="spotlight-benefits-list">
                  <div className="spotlight-benefit-item">
                    <div className="spotlight-benefit-icon" style={{ background: 'rgba(59, 91, 219, 0.18)', color: '#60a5fa' }}>
                      <Zap size={18} />
                    </div>
                    <div>
                      <div className="spotlight-benefit-title">Encaissement en 15 secondes chrono</div>
                      <div className="spotlight-benefit-text">Recherche instantanée de l'élève par nom ou matricule, sélection de la tranche due et calcul automatique de la monnaie à rendre.</div>
                    </div>
                  </div>

                  <div className="spotlight-benefit-item">
                    <div className="spotlight-benefit-icon" style={{ background: 'rgba(16, 185, 129, 0.18)', color: '#34d399' }}>
                      <Smartphone size={18} />
                    </div>
                    <div>
                      <div className="spotlight-benefit-title">Mobile Money & Espèces unifiés</div>
                      <div className="spotlight-benefit-text">Acceptez Wave, Orange Money, MTN MoMo, Moov Money, chèques et espèces avec saisie instantanée des références de transaction.</div>
                    </div>
                  </div>

                  <div className="spotlight-benefit-item">
                    <div className="spotlight-benefit-icon" style={{ background: 'rgba(168, 85, 247, 0.18)', color: '#c084fc' }}>
                      <QrCode size={18} />
                    </div>
                    <div>
                      <div className="spotlight-benefit-title">Reçus certifiés avec QR Code infalsifiable</div>
                      <div className="spotlight-benefit-text">Fini les faux reçus et reçus manuscrits illisibles. Chaque reçu dispose d'un identifiant cryptographique unique vérifiable par la Direction.</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '2rem' }}>
                  <button className="btn-hero-primary" onClick={onStartDemo}>
                    <Sparkles size={18} />
                    <span>Tester le Guichet Caisse en Démo</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          INTERACTIVE ROI & TIME CALCULATOR
          -------------------------------------------------------------------- */}
      <section id="calculator" className="calculator-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-tag">Calculateur Interactif</span>
            <h2 className="section-title">Estimez vos gains avec ScolarPay Pro</h2>
            <p className="section-desc">
              Déplacez les curseurs pour simuler l'impact direct sur la trésorerie et la gestion de votre établissement.
            </p>
          </div>

          <div className="calculator-card">
            <div className="calculator-layout">
              {/* Sliders Left */}
              <div>
                <div className="calc-slider-group">
                  <div className="calc-slider-header">
                    <span className="calc-slider-label">Nombre d'élèves inscrits :</span>
                    <span className="calc-slider-value">{studentCount} élèves</span>
                  </div>
                  <input 
                    type="range" 
                    min="100" 
                    max="2500" 
                    step="50"
                    value={studentCount}
                    onChange={(e) => setStudentCount(Number(e.target.value))}
                    className="calc-range-input"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                    <span>100 élèves</span>
                    <span>1 250 élèves</span>
                    <span>2 500 élèves</span>
                  </div>
                </div>

                <div className="calc-slider-group">
                  <div className="calc-slider-header">
                    <span className="calc-slider-label">Frais de scolarité moyens / an :</span>
                    <span className="calc-slider-value">{formatCFA(avgTuition)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="50000" 
                    max="600000" 
                    step="10000"
                    value={avgTuition}
                    onChange={(e) => setAvgTuition(Number(e.target.value))}
                    className="calc-range-input"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                    <span>50 000 F</span>
                    <span>300 000 F</span>
                    <span>600 000 F</span>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Budget annuel de scolarité estimé :</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                    {formatCFA(totalTuitionBudget)}
                  </div>
                </div>
              </div>

              {/* Results Box Right */}
              <div className="calc-results-box">
                <div className="calc-result-row">
                  <div>
                    <div className="calc-result-title">Temps de gestion économisé :</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Comptabilité, arrêtés & relances</div>
                  </div>
                  <div className="calc-result-val" style={{ color: '#60a5fa' }}>
                    ~{hoursSavedPerMonth} h / mois
                  </div>
                </div>

                <div className="calc-result-row">
                  <div>
                    <div className="calc-result-title">Impayés récupérés estimés :</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Grâce aux alertes et au suivi rigoureux</div>
                  </div>
                  <div className="calc-result-val">
                    +{formatCFA(estimatedUnpaidRecovered)}
                  </div>
                </div>

                <div className="calc-result-row">
                  <div>
                    <div className="calc-result-title">Écarts de caisse évités :</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Contrôle horodaté & reçu obligatoire</div>
                  </div>
                  <div className="calc-result-val" style={{ color: '#34d399' }}>
                    100% de traçabilité
                  </div>
                </div>

                <button 
                  className="btn-hero-primary" 
                  style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}
                  onClick={onStartDemo}
                >
                  <Zap size={18} />
                  <span>Obtenir ces résultats pour mon école</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          HOW IT WORKS (3 Simple Steps)
          -------------------------------------------------------------------- */}
      <section id="how-it-works" className="steps-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-tag">Mise en place Facile</span>
            <h2 className="section-title">Opérationnel en 3 étapes simples</h2>
            <p className="section-desc">
              Pas besoin de formation complexe. Notre interface est pensée pour être immédiatement utilisable par tous vos agents.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number-badge">1</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                Configurez vos grilles
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Définissez vos classes (Collège, Lycée) et les tranches de paiement (Inscription, Tranche 1, Tranche 2, Tranche 3).
              </p>
            </div>

            <div className="step-card">
              <div className="step-number-badge">2</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                Enregistrez vos élèves
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Importez vos listes Excel existantes en 1 clic ou ajoutez les élèves avec leurs matricules et contacts des parents.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number-badge">3</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                Encaissez & Suivez
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Encaissez au guichet, imprimez les reçus thermiques ou A4 et consultez vos indicateurs de trésorerie en direct.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          COMPARATIVE TABLE
          -------------------------------------------------------------------- */}
      <section id="comparatif" className="comparison-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-tag">Comparatif</span>
            <h2 className="section-title">Pourquoi abandonner les cahiers et Excel ?</h2>
            <p className="section-desc">
              Découvrez la différence entre les méthodes traditionnelles et la puissance de ScolarPay Pro.
            </p>
          </div>

          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th style={{ color: '#ffffff' }}>Fonctionnalité</th>
                  <th style={{ color: '#ef4444' }}>Cahiers & Fiches Papier</th>
                  <th style={{ color: '#f59e0b' }}>Tableur Excel classique</th>
                  <th style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>ScolarPay Pro ⭐</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600, color: '#e2e8f0' }}>Temps d'encaissement par élève</td>
                  <td style={{ color: '#94a3b8' }}>3 à 5 minutes (Lent)</td>
                  <td style={{ color: '#94a3b8' }}>1 à 2 minutes</td>
                  <td style={{ color: '#34d399', fontWeight: 700 }}>⚡ Moins de 15 secondes</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: '#e2e8f0' }}>Authenticité & Sécurité des reçus</td>
                  <td style={{ color: '#94a3b8' }}>Risque élevé de falsification</td>
                  <td style={{ color: '#94a3b8' }}>Facilement modifiable</td>
                  <td style={{ color: '#34d399', fontWeight: 700 }}>🔒 QR Code unique infalsifiable</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: '#e2e8f0' }}>Suivi des impayés par classe</td>
                  <td style={{ color: '#94a3b8' }}>Calcul manuel fastidieux</td>
                  <td style={{ color: '#94a3b8' }}>Formules complexes / Erreurs</td>
                  <td style={{ color: '#34d399', fontWeight: 700 }}>📊 Automatique en temps réel</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: '#e2e8f0' }}>Arrêté de caisse journalier</td>
                  <td style={{ color: '#94a3b8' }}>1 à 2 heures chaque soir</td>
                  <td style={{ color: '#94a3b8' }}>30 à 45 minutes</td>
                  <td style={{ color: '#34d399', fontWeight: 700 }}>📑 1 clic immédiat (PDF & Excel)</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: '#e2e8f0' }}>Paiements Mobile Money intégrés</td>
                  <td style={{ color: '#ef4444' }}>Non</td>
                  <td style={{ color: '#ef4444' }}>Non</td>
                  <td style={{ color: '#34d399', fontWeight: 700 }}>✅ Wave, Orange, MTN, Moov</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          TESTIMONIALS
          -------------------------------------------------------------------- */}
      <section id="testimonials" className="testimonials-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-tag">Témoignages</span>
            <h2 className="section-title">Approuvé par les chefs d'établissements</h2>
            <p className="section-desc">
              Voici ce que disent les directeurs et économes qui utilisent ScolarPay Pro au quotidien.
            </p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div>
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#fbbf24" />)}
                </div>
                <p className="testimonial-quote">
                  « Nous gérons 1 200 élèves. Les files d'attente à la caisse lors des rentrées scolaires ont été divisées par 3. L'impression instantanée des reçus avec QR Code a éliminé tous les litiges avec les parents. »
                </p>
              </div>
              <div className="testimonial-author">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" 
                  alt="M. KOUADIO" 
                  className="testimonial-avatar"
                />
                <div>
                  <div className="testimonial-name">M. KOUADIO Jean-Marc</div>
                  <div className="testimonial-role">Directeur Général, Collège d'Excellence (Abidjan)</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div>
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#fbbf24" />)}
                </div>
                <p className="testimonial-quote">
                  « L'arrêté de caisse journalier est magique. En fin de journée, en un seul clic, j'ai le bilan complet des encaissements par caissier, par mode de paiement (Wave, Orange, Espèces) prêt pour la signature. »
                </p>
              </div>
              <div className="testimonial-author">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80" 
                  alt="Mme TRAORE" 
                  className="testimonial-avatar"
                />
                <div>
                  <div className="testimonial-name">Mme TRAORÉ Aminata</div>
                  <div className="testimonial-role">Économe Principale, Lycée Moderne (Bouaké)</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div>
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#fbbf24" />)}
                </div>
                <p className="testimonial-quote">
                  « Le suivi des impayés par classe nous a permis de récupérer plus de 9 millions de FCFA de frais qui restaient impayés en fin d'année auparavant. L'investissement a été rentabilisé dès le premier mois. »
                </p>
              </div>
              <div className="testimonial-author">
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" 
                  alt="M. DIOP" 
                  className="testimonial-avatar"
                />
                <div>
                  <div className="testimonial-name">M. DIOP Ousmane</div>
                  <div className="testimonial-role">Fondateur & Directeur, Groupe Scolaire Saint-Paul</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          PRICING PLANS
          -------------------------------------------------------------------- */}
      <section id="pricing" className="pricing-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-tag">Tarifs Clairs & Sans Surprise</span>
            <h2 className="section-title">Une formule adaptée à la taille de votre école</h2>
            <p className="section-desc">
              Tarification transparente par établissement, sans frais cachés. Mises à jour et assistance incluses.
            </p>
          </div>

          <div className="pricing-grid">
            {/* Plan 1 */}
            <div className="pricing-card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Starter Établissement</h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>Pour les petites écoles et collèges débutants</p>
              
              <div className="pricing-price">
                45 000 <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>FCFA / mois</span>
              </div>

              <ul className="pricing-features-list">
                <li className="pricing-feature-item">
                  <Check size={16} color="#10b981" />
                  <span>Jusqu'à <strong>350 élèves</strong></span>
                </li>
                <li className="pricing-feature-item">
                  <Check size={16} color="#10b981" />
                  <span>Guichet Caisse & Reçus QR Code</span>
                </li>
                <li className="pricing-feature-item">
                  <Check size={16} color="#10b981" />
                  <span>Espèces & Mobile Money Wave/Orange</span>
                </li>
                <li className="pricing-feature-item">
                  <Check size={16} color="#10b981" />
                  <span>Arrêté de caisse journalier PDF</span>
                </li>
                <li className="pricing-feature-item">
                  <Check size={16} color="#10b981" />
                  <span>1 poste caissier + 1 poste directeur</span>
                </li>
              </ul>

              <button className="btn-hero-secondary" style={{ width: '100%' }} onClick={onStartDemo}>
                Choisir Starter
              </button>
            </div>

            {/* Plan 2 (Popular) */}
            <div className="pricing-card pricing-card-popular">
              <div className="pricing-popular-tag">Le Plus Choisi ⭐</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Pro Collège & Lycée</h3>
              <p style={{ fontSize: '0.85rem', color: '#c7d2fe', marginTop: '4px' }}>Pour les collèges et lycées en pleine activité</p>
              
              <div className="pricing-price" style={{ color: '#60a5fa' }}>
                85 000 <span style={{ fontSize: '0.9rem', color: '#c7d2fe', fontWeight: 500 }}>FCFA / mois</span>
              </div>

              <ul className="pricing-features-list">
                <li className="pricing-feature-item">
                  <Check size={16} color="#10b981" />
                  <span>Jusqu'à <strong>1 500 élèves</strong></span>
                </li>
                <li className="pricing-feature-item">
                  <Check size={16} color="#10b981" />
                  <span>Guichets multiples & postes illimités</span>
                </li>
                <li className="pricing-feature-item">
                  <Check size={16} color="#10b981" />
                  <span>Impression Thermique 80mm & A4</span>
                </li>
                <li className="pricing-feature-item">
                  <Check size={16} color="#10b981" />
                  <span>Tableaux d'impayés, bourses & moratoires</span>
                </li>
                <li className="pricing-feature-item">
                  <Check size={16} color="#10b981" />
                  <span>Export comptable Excel & PDF certifié</span>
                </li>
                <li className="pricing-feature-item">
                  <Check size={16} color="#10b981" />
                  <span>Synchronisation Cloud Supabase + Backup</span>
                </li>
                <li className="pricing-feature-item">
                  <Check size={16} color="#10b981" />
                  <span>Support prioritaire WhatsApp & Téléphone</span>
                </li>
              </ul>

              <button className="btn-hero-primary" style={{ width: '100%' }} onClick={onStartDemo}>
                <Sparkles size={16} />
                <span>Démarrer avec la formule Pro</span>
              </button>
            </div>

            {/* Plan 3 */}
            <div className="pricing-card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Réseau Scolaire</h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>Pour les groupes scolaires et multi-établissements</p>
              
              <div className="pricing-price">
                Sur Mesure
              </div>

              <ul className="pricing-features-list">
                <li className="pricing-feature-item">
                  <Check size={16} color="#10b981" />
                  <span>Élèves <strong>illimités</strong></span>
                </li>
                <li className="pricing-feature-item">
                  <Check size={16} color="#10b981" />
                  <span>Gestion centralisée multi-écoles</span>
                </li>
                <li className="pricing-feature-item">
                  <Check size={16} color="#10b981" />
                  <span>Consolidation financière du groupe</span>
                </li>
                <li className="pricing-feature-item">
                  <Check size={16} color="#10b981" />
                  <span>Intégrations API & banques sur mesure</span>
                </li>
                <li className="pricing-feature-item">
                  <Check size={16} color="#10b981" />
                  <span>Chef de projet dédié & formation sur site</span>
                </li>
              </ul>

              <button className="btn-hero-secondary" style={{ width: '100%' }} onClick={onOpenSignUp}>
                Contacter un conseiller
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          FAQ ACCORDION
          -------------------------------------------------------------------- */}
      <section id="faq" className="faq-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-tag">FAQ</span>
            <h2 className="section-title">Foire aux questions</h2>
            <p className="section-desc">
              Toutes les réponses à vos questions pour choisir en toute confiance.
            </p>
          </div>

          <div className="faq-list">
            {faqData.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className={`faq-item ${isOpen ? 'faq-item-open' : ''}`}>
                  <button 
                    className="faq-question-btn"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  >
                    <span>{item.q}</span>
                    {isOpen ? <ChevronUp size={18} color="#60a5fa" /> : <ChevronDown size={18} color="#64748b" />}
                  </button>
                  {isOpen && (
                    <div className="faq-answer">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          FINAL CTA BANNER
          -------------------------------------------------------------------- */}
      <section className="cta-banner-section">
        <div className="landing-container">
          <div className="cta-banner-card">
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, color: '#ffffff', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              Prêt à moderniser la gestion financière de votre établissement ?
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#cbd5e1', maxWidth: '640px', margin: '0 auto 2.25rem', lineHeight: 1.6 }}>
              Rejoignez plus de 150 collèges et lycées qui ont automatisé leurs encaissements scolaires et éliminé les impayés.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn-hero-primary" onClick={onStartDemo}>
                  <Sparkles size={18} />
                  <span>Tester la Démo interactive</span>
                  <ArrowRight size={18} />
                </button>
                <button className="btn-hero-secondary" onClick={onOpenSignUp}>
                  <Lock size={18} color="#60a5fa" />
                  <span>Créer mon compte école</span>
                </button>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                Démo immédiate • Aucune carte requise • Prise en main en 5 minutes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          FOOTER
          -------------------------------------------------------------------- */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-grid">
            {/* Col 1 */}
            <div>
              <div className="landing-brand" style={{ marginBottom: '1rem' }}>
                <div className="landing-logo-icon">
                  <GraduationCap size={20} color="#ffffff" />
                </div>
                <div className="landing-brand-text">
                  ScolarPay <span className="landing-brand-badge">PRO</span>
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '320px', marginBottom: '1.25rem' }}>
                Plateforme SaaS de référence pour la gestion des frais scolaires, l'encaissement et le suivi des impayés dans les Collèges et Lycées en Afrique.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', color: '#60a5fa', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>Abidjan, Côte d'Ivoire & Afrique de l'Ouest</span>
              </div>
            </div>

            {/* Col 2 */}
            <div>
              <div className="footer-col-title">Navigation</div>
              <ul className="footer-links">
                <li><a className="footer-link" onClick={() => scrollToSection('features')}>Fonctionnalités</a></li>
                <li><a className="footer-link" onClick={() => scrollToSection('how-it-works')}>Comment ça marche</a></li>
                <li><a className="footer-link" onClick={() => scrollToSection('pricing')}>Tarifs</a></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <div className="footer-col-title">Accès SaaS</div>
              <ul className="footer-links">
                <li><a className="footer-link" onClick={onStartDemo}>Démo interactive</a></li>
                <li><a className="footer-link" onClick={onOpenLogin}>Espace Directeur</a></li>
                <li><a className="footer-link" onClick={onOpenLogin}>Espace Économe</a></li>
                <li><a className="footer-link" onClick={onOpenLogin}>Guichet Caissier</a></li>
                <li><a className="footer-link" onClick={onOpenSignUp}>Nouvel établissement</a></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <div className="footer-col-title">Assistance & Contact</div>
              <ul className="footer-links">
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                  <PhoneCall size={15} color="#10b981" />
                  <span>+225 07 00 00 00 00</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                  <Mail size={15} color="#60a5fa" />
                  <span>contact@scolarpay.pro</span>
                </li>
                <li style={{ marginTop: '0.75rem' }}>
                  <button 
                    onClick={onStartDemo}
                    style={{
                      background: 'rgba(59, 91, 219, 0.15)',
                      border: '1px solid rgba(59, 91, 219, 0.3)',
                      color: '#93c5fd',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Sparkles size={13} />
                    <span>Lancer la démo gratuite</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div>
              © {new Date().getFullYear()} ScolarPay Pro. Tous droits réservés.
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Confidentialité</a>
              <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Conditions Générales</a>
              <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Sécurité des Données</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
