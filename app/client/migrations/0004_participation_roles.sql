-- Roles are now: متطوع / مشرف / مساعد مشرف / free text ("أخرى").
UPDATE participations SET role = 'مشرف' WHERE role = 'مشرف عام';
UPDATE participations SET role = 'مساعد مشرف' WHERE role = 'نائب المشرف';
-- Supervisor/deputy flags always follow the role.
UPDATE participations SET
  is_supervisor = CASE WHEN role = 'مشرف' THEN 1 ELSE 0 END,
  is_deputy = CASE WHEN role = 'مساعد مشرف' THEN 1 ELSE 0 END;

-- A volunteer appears in a program once; hours and role are edited on that one row.
CREATE UNIQUE INDEX IF NOT EXISTS idx_participations_volunteer_program ON participations(volunteer_id, program_id);
