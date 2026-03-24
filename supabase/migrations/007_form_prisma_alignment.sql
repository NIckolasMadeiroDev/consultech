ALTER TABLE forms ADD COLUMN IF NOT EXISTS slug TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS forms_slug_key ON forms (slug) WHERE slug IS NOT NULL;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS allow_anonymous BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE questions ADD COLUMN IF NOT EXISTS condition_question_id UUID;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS condition_operator TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS condition_value JSONB;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'questions_condition_question_id_fkey'
  ) THEN
    ALTER TABLE questions
      ADD CONSTRAINT questions_condition_question_id_fkey
      FOREIGN KEY (condition_question_id) REFERENCES questions(id) ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_type_check;
ALTER TABLE questions ADD CONSTRAINT questions_type_check CHECK (type IN (
  'short_text', 'long_text', 'multiple_choice', 'dropdown', 'checkbox', 'scale', 'yes_no', 'date', 'number', 'section'
));
