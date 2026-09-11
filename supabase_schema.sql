-- ==========================================================
-- SCRIPT D'INITIALISATION SUPABASE - SAAS PAIEMENT SCOLARITÉ
-- Exécutez ce script dans l'onglet "SQL Editor" de votre tableau de bord Supabase
-- ==========================================================

-- 1. Table de configuration de l'établissement
CREATE TABLE IF NOT EXISTS school_config (
  id TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "shortName" TEXT,
  motto TEXT,
  code TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  phone TEXT,
  email TEXT,
  currency TEXT DEFAULT 'XOF',
  "academicYear" TEXT,
  "directorName" TEXT,
  "bursarName" TEXT,
  "stampText" TEXT,
  "logoUrl" TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table des grilles tarifaires par classe
CREATE TABLE IF NOT EXISTS fee_plans (
  "classId" TEXT PRIMARY KEY,
  "className" TEXT NOT NULL,
  level TEXT NOT NULL,
  "totalTuition" NUMERIC NOT NULL DEFAULT 0,
  installments JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table des élèves
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  matricule TEXT NOT NULL UNIQUE,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  gender TEXT DEFAULT 'M',
  "birthDate" TEXT,
  "classId" TEXT NOT NULL,
  "className" TEXT NOT NULL,
  level TEXT NOT NULL,
  "avatarUrl" TEXT,
  "guardianName" TEXT NOT NULL,
  "guardianRelation" TEXT,
  "guardianPhone" TEXT NOT NULL,
  "guardianEmail" TEXT,
  "discountType" TEXT DEFAULT 'NONE',
  "discountPercentage" NUMERIC DEFAULT 0,
  "optionalFees" JSONB DEFAULT '{"canteen": false, "transport": false, "uniform": false}'::jsonb,
  "enrollmentDate" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table des paiements et transactions
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  "receiptNumber" TEXT NOT NULL UNIQUE,
  "studentId" TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  "studentMatricule" TEXT NOT NULL,
  "className" TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  method TEXT NOT NULL,
  reference TEXT,
  "cashierName" TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  notes TEXT,
  "installmentTarget" TEXT NOT NULL,
  "cashGiven" NUMERIC,
  "cashReturned" NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_students_class ON students("classId");
CREATE INDEX IF NOT EXISTS idx_students_matricule ON students(matricule);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments("studentId");
CREATE INDEX IF NOT EXISTS idx_payments_receipt ON payments("receiptNumber");

-- Activation de Row Level Security (RLS) avec accès public (pour anon key)
ALTER TABLE school_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on school_config" ON school_config FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on school_config" ON school_config FOR ALL USING (true);

CREATE POLICY "Allow public select on fee_plans" ON fee_plans FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on fee_plans" ON fee_plans FOR ALL USING (true);

CREATE POLICY "Allow public select on students" ON students FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update/delete on students" ON students FOR ALL USING (true);

CREATE POLICY "Allow public select on payments" ON payments FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on payments" ON payments FOR ALL USING (true);

-- Données initiales pour l'école
INSERT INTO school_config (
  id, "name", "shortName", motto, code, address, city, country, phone, email, currency, "academicYear", "directorName", "bursarName", "stampText"
) VALUES (
  'school-001',
  'Complexe Scolaire d''Excellence Saint-Joseph',
  'CS Saint-Joseph',
  'Discipline - Travail - Succès',
  'CS-STJ-2026',
  'Boulevard de la Paix, Cocody Riviera 3',
  'Abidjan',
  'Côte d''Ivoire',
  '+225 07 08 09 10 11',
  'contact@saintjoseph-ci.edu',
  'XOF',
  '2025 - 2026',
  'M. KOUASSI Jean-Baptiste',
  'Mme TOURE Aminata',
  'VU ET APPROUVÉ - SERVICE COMPTABILITÉ'
) ON CONFLICT (id) DO NOTHING;
