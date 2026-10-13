-- ========================================================
-- SAITO Control — Cloudflare D1 SQL Schema (schema.sql)
-- Create database via: npx wrangler d1 create saito_accounts_db
-- Apply schema via: npx wrangler d1 execute saito_accounts_db --file=schema.sql --remote
-- ========================================================

CREATE TABLE IF NOT EXISTS accounts (
  uid TEXT PRIMARY KEY,
  encrypted_password TEXT,
  nickname TEXT NOT NULL,
  region TEXT DEFAULT 'BD',
  level INTEGER DEFAULT 1,
  initial_exp INTEGER DEFAULT 0,
  current_exp INTEGER DEFAULT 0,
  gained_exp INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'STOPPED',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_accounts_region ON accounts(region);
CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts(status);
