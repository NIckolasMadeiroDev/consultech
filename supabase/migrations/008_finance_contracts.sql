-- Tabela de contratos
CREATE TABLE IF NOT EXISTS finance_contract (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number TEXT NOT NULL UNIQUE,
  client_name TEXT,
  total_value NUMERIC(15, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_finance_contract_status ON finance_contract(status);
CREATE INDEX idx_finance_contract_number ON finance_contract(contract_number);

-- Adicionar coluna contract_id em finance_receivable
ALTER TABLE finance_receivable
ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES finance_contract(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_finance_receivable_contract ON finance_receivable(contract_id);
