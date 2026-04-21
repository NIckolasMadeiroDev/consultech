-- Migration: Dashboard Charts
-- Description: Creates table for customizable charts in dashboards

-- Table: dashboard_chart
-- Stores custom chart configurations for dashboards
CREATE TABLE IF NOT EXISTS dashboard_chart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES "Dashboard"(id) ON DELETE CASCADE,
  form_id UUID NOT NULL REFERENCES "Form"(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES "Question"(id) ON DELETE CASCADE,
  chart_type TEXT NOT NULL CHECK (chart_type IN ('bar', 'line', 'pie')),
  title TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_dashboard_chart_dashboard_id ON dashboard_chart(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_chart_form_id ON dashboard_chart(form_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_chart_question_id ON dashboard_chart(question_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_chart_display_order ON dashboard_chart(dashboard_id, display_order);

-- Comments
COMMENT ON TABLE dashboard_chart IS 'Stores custom chart configurations for dashboards';
COMMENT ON COLUMN dashboard_chart.chart_type IS 'Chart type: bar, line, or pie';
COMMENT ON COLUMN dashboard_chart.display_order IS 'Order in which charts are displayed';
