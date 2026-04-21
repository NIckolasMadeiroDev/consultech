ALTER TABLE forms ADD COLUMN IF NOT EXISTS response_settings JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE forms
SET response_settings = jsonb_build_object(
  'respondentIdentificationMode', CASE WHEN allow_anonymous THEN 'anonymous' ELSE 'required' END,
  'responseLayoutMode', 'single_page',
  'showProgressBar', true,
  'allowSaveDraft', true
)
WHERE response_settings = '{}'::jsonb;

ALTER TABLE responses ALTER COLUMN respondent_id DROP NOT NULL;

ALTER TABLE responses ADD COLUMN IF NOT EXISTS submission_metadata JSONB;
