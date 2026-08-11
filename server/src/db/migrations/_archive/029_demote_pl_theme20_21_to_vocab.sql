-- Migration 029: Demote pl_theme20 and pl_theme21 to vocab-only
--
-- Rationale: per the polish-themes reorg, themes 20 and 21
-- ("Глаголы на -m и вежливое обращение", "Глаголы 2-го спряжения
-- и существительные мужского рода") are A1/A2 intro material and
-- are demoted to vocab-only: their write_answer exercise section
-- is removed in the front-end theme files; this migration drops
-- the matching theme_section rows so the DB stays in sync.
--
-- Idempotent: DELETE is a no-op on re-run. Narrow: only pl_theme20
-- and pl_theme21 with type='exercises'.
--
-- Safety: atomic, idempotent, narrow, reversible (re-insert from
-- pre-029 frontend theme files).

BEGIN;

DELETE FROM theme_section
WHERE theme_id IN ('pl_theme20', 'pl_theme21')
  AND type = 'exercises';

COMMIT;
