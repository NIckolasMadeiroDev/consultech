ALTER TABLE forms
  ADD COLUMN IF NOT EXISTS section_visibility_rules jsonb NOT NULL DEFAULT '[]'::jsonb;
