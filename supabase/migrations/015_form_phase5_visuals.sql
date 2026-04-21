ALTER TABLE "forms"
  ADD COLUMN IF NOT EXISTS success_page_html TEXT,
  ADD COLUMN IF NOT EXISTS success_redirect_url TEXT,
  ADD COLUMN IF NOT EXISTS success_redirect_delay INT DEFAULT 0;

ALTER TABLE "form_question"
  ADD COLUMN IF NOT EXISTS custom_icon TEXT;
