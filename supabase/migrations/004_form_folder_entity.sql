CREATE TABLE IF NOT EXISTS form_folder (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (created_by, name)
);

ALTER TABLE forms ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES form_folder(id) ON DELETE SET NULL;

INSERT INTO form_folder (id, name, created_by)
SELECT gen_random_uuid(), d.folder_name, d.created_by
FROM (
  SELECT DISTINCT TRIM(folder) AS folder_name, created_by
  FROM forms
  WHERE folder IS NOT NULL AND TRIM(folder) <> ''
) d;

UPDATE forms fo
SET folder_id = ff.id
FROM form_folder ff
WHERE fo.folder IS NOT NULL
  AND TRIM(fo.folder) = ff.name
  AND (fo.created_by IS NOT DISTINCT FROM ff.created_by);

ALTER TABLE forms DROP COLUMN IF EXISTS folder;
