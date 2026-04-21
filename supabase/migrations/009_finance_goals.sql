-- Tabela de metas mensais de faturamento
CREATE TABLE IF NOT EXISTS finance_revenue_goal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL,
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  goal_value NUMERIC(15, 2) NOT NULL CHECK (goal_value >= 0),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(year, month)
);

CREATE INDEX idx_finance_revenue_goal_year_month ON finance_revenue_goal(year, month);

-- Tabela de custo operacional mensal previsto
CREATE TABLE IF NOT EXISTS finance_operational_cost (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL,
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  predicted_cost NUMERIC(15, 2) NOT NULL CHECK (predicted_cost >= 0),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(year, month)
);

CREATE INDEX idx_finance_operational_cost_year_month ON finance_operational_cost(year, month);
