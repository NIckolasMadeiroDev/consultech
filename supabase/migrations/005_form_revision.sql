CREATE TABLE IF NOT EXISTS form_revision (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  version INT NOT NULL,
  edited_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  summary TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_form_revision_form_created ON form_revision (form_id, created_at DESC);
