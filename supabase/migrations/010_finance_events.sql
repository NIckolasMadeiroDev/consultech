-- Migration: Finance Events and Scenarios
-- Description: Creates tables for event planning with multiple scenarios

-- Table: finance_event
-- Stores event information for financial planning
CREATE TABLE IF NOT EXISTS finance_event (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'approved', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: finance_event_scenario
-- Stores different cost scenarios for each event (pessimistic, realistic, optimistic)
CREATE TABLE IF NOT EXISTS finance_event_scenario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES finance_event(id) ON DELETE CASCADE,
  scenario_name TEXT NOT NULL,
  members_count INT NOT NULL CHECK (members_count > 0),
  cost_per_member NUMERIC(15, 2) NOT NULL CHECK (cost_per_member >= 0),
  total_cost NUMERIC(15, 2) NOT NULL CHECK (total_cost >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_finance_event_date ON finance_event(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_finance_event_status ON finance_event(status);
CREATE INDEX IF NOT EXISTS idx_finance_event_scenario_event_id ON finance_event_scenario(event_id);

-- Comments
COMMENT ON TABLE finance_event IS 'Stores events for financial planning';
COMMENT ON TABLE finance_event_scenario IS 'Stores multiple cost scenarios per event';
COMMENT ON COLUMN finance_event.status IS 'Event status: planning, approved, in_progress, completed, cancelled';
COMMENT ON COLUMN finance_event_scenario.total_cost IS 'Calculated as members_count * cost_per_member';
