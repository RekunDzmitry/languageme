-- Align exercise_card.ease with srs_card and conjugation_card (both REAL).
-- node-postgres returns DECIMAL/NUMERIC as a JavaScript string, which broke
-- the client-side SM-2 algorithm: `ease + 0.1` did string concatenation
-- ("2.50" + 0.1 -> "2.500.1"), then arithmetic produced NaN, propagating to
-- the card's `due` on the next review. The Polish training UI rendered this
-- as "NaNд".
UPDATE exercise_card SET ease = 2.5 WHERE ease IS NULL OR ease::text = 'NaN';
ALTER TABLE exercise_card ALTER COLUMN ease TYPE REAL USING ease::real;
ALTER TABLE exercise_card ALTER COLUMN ease SET DEFAULT 2.5;
