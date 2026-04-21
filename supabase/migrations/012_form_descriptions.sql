ALTER TABLE form_question ADD COLUMN IF NOT EXISTS section_title TEXT;
ALTER TABLE form_question ADD COLUMN IF NOT EXISTS section_description TEXT;
ALTER TABLE form_question ADD COLUMN IF NOT EXISTS help_text TEXT;
ALTER TABLE form_question ADD COLUMN IF NOT EXISTS placeholder TEXT;
