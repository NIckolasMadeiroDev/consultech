CREATE TABLE IF NOT EXISTS response_attachment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES form_question(id) ON DELETE RESTRICT,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  original_filename TEXT NOT NULL,
  virus_scan_status TEXT NOT NULL DEFAULT 'not_scanned',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_response_attachment_response_id ON response_attachment(response_id);
CREATE INDEX IF NOT EXISTS idx_response_attachment_question_id ON response_attachment(question_id);

CREATE TABLE IF NOT EXISTS form_static_asset (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  label TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_form_static_asset_form_id ON form_static_asset(form_id);
