-- ============================================================
-- FRETSEND — Tables supplémentaires
-- Exécuter après schema.sql dans Supabase SQL Editor
-- ============================================================

-- Table des tokens de paiement
CREATE TABLE IF NOT EXISTS payment_tokens (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id   UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  token        VARCHAR(64) UNIQUE NOT NULL,
  status       VARCHAR(20) NOT NULL DEFAULT 'pending',
  expires_at   TIMESTAMPTZ NOT NULL,
  processed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payment_tokens_token   ON payment_tokens(token);
CREATE INDEX IF NOT EXISTS idx_payment_tokens_package ON payment_tokens(package_id);

-- Table des mots de passe temporaires
CREATE TABLE IF NOT EXISTS temp_passwords (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  email      VARCHAR(255) NOT NULL,
  password   VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Colonne statut paiement sur les colis
ALTER TABLE packages ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending';

-- RLS permissif (les policies NestJS gèrent la sécurité)
ALTER TABLE payment_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE temp_passwords  ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payment_tokens_all" ON payment_tokens FOR ALL USING (true);
CREATE POLICY "temp_passwords_all" ON temp_passwords FOR ALL USING (true);

-- Vue stats par agence
CREATE OR REPLACE VIEW agency_package_stats AS
SELECT
  a.id AS agency_id, a.name, a.city, a.country,
  COUNT(p.id) AS total_packages,
  COUNT(p.id) FILTER (WHERE p.status = 'delivered')           AS delivered_packages,
  COUNT(p.id) FILTER (WHERE DATE(p.created_at) = CURRENT_DATE) AS today_packages,
  COALESCE(SUM(p.price) FILTER (WHERE p.currency = 'EUR'), 0)  AS revenue_eur
FROM agencies a
LEFT JOIN packages p ON p.origin_agency_id = a.id
GROUP BY a.id, a.name, a.city, a.country;
