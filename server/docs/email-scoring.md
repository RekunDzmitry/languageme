# Deterministic TELC email scoring

The Polish-email grading pipeline scores the learner on the four official
TELC Język polski B1·B2 Szkoła criteria, then derives a CEFR band and an
examiner-style summary. The score path is **fully deterministic** — no
LLM is involved in producing the integer criterion scores, the per-criterion
comments, the band, or the examiner summary. The LLM is still used for
high-value teaching content (error discovery, corrections, SRS
proposals) but **never** to derive the rubric.

This document describes the new architecture; the older LLM-rubric path
in `routes/email.js` is preserved but no longer invoked for scoring.

## Score path

```
                    ┌──────────────────────────────────────────────┐
                    │  emailScoring.grade(text, ctx)               │
                    │                                              │
   user text +       │   1. scoreComposition(text, register)        │
   register +        │   2. scoreAccuracy(text)                      │
   points +          │   3. scoreVocabulary(text, targetLevel)     │
   targetLevel       │   4. scoreContent(text, points, stance)      │
        │            │   5. aggregateRubric(parts)                 │
        │            │   6. applyDisqualifier (TELC rule)          │
        │            │   7. attachHardcodedComments                │
        ▼            └────────────────┬─────────────────────────┘
   deterministic                              │
                                             ▼
                          ┌──────────────────────────────┐
                          │  { score, telcRubric,         │
                          │    taskCoverage, etiquette,  │
                          │    errors[], registerMatch,   │
                          │    constructionReplacements, │
                          │    metricVersion,             │
                          │    deterministicSignals }     │
                          └──────────────────────────────┘
```

`grade()` is a pure function: same input → byte-identical output, every
run, on every machine, regardless of model or temperature. This is
verified by `tests/email-scoring.test.mjs::reproducibility` which re-runs
the same grade 100 times and asserts byte equality.

## Per-criterion scoring

### I Treść (Content) — `scoreContent()`

Per point $i \in [1, N]$:

| Signal | Source | Formula |
|---|---|---|
| `covered_i` | content-words overlap between sentence and point (after lemmatization, function-word filter, and stop-content-lemmas filter) | $\{0, 1\}$ |
| `wc_i` | word count of sentences assigned to point $i$ | int |
| `depth_i` | count of NER, numerals, time markers, cause/contrast markers, example markers, place names, 1st-person past/present | int |
| `stance_i` | LLM 0/1 on "did the learner do what the point verb asked?" — defaults to 1 on LLM failure | $\{0, 1\}$ |
| `relevance_i` | Jaccard cosine between point bow and span bow | $[0, 1]$ |

`point_i_raw = 0.50·min(1, wc_i/30) + 0.20·min(1, depth_i/2) + 0.20·stance_i + 0.10·relevance_i`

`coverageMultiplier = 0.5 + 0.5·(coveredCount/3)`

`content_score = floor(5 · mean(point_raw) · coverageMultiplier)`

### II Kompozycja (Composition) — `scoreComposition()`

| Signal | Source | Weight |
|---|---|---|
| `G` | greeting matches expected register (Unicode-aware regex on first line / first sentence) | 0.30 |
| `C` | closing matches expected register (Unicode-aware regex on last line, or line-before if last is a name) | 0.25 |
| `Rm` | register-fit: for `formalny` requires formal-marker present AND no informal; for `nieformalny` allows informal-only; `półformalny` between | 0.20 |
| `P` | paragraph count, saturated at 3 | 0.10 |
| `Lcv` | sentence-length coefficient of variation, saturated at 0.6 | 0.10 |
| `M` | conjunction density per 100 words, saturated at ~6.6 | 0.05 |

`composition_score = floor(5 · raw)`

### III Poprawność (Accuracy) — `scoreAccuracy()`

Severity-weighted error density $\rho = \frac{\sum w_e}{\text{word count}} \cdot 100$ where
$w_e$ comes from the matched error source:

| Source | Severity | Tool |
|---|---|---|
| Non-word | 2 | `nspell` + `dictionary-pl` (Hunspell) |
| Grammar (case government, anglicism, etc.) | 1–3 | 15 hand-written regex rules in `polishNlp.js::GRAMMAR_RULES` |
| Punctuation / capitalisation | 1 | 4 hand-written rules |

| $\rho$ | Score |
|---|---|
| $\le 1.0$ | 5 |
| $1.0 < \rho \le 3.0$ | 4 |
| $3.0 < \rho \le 6.0$ | 3 |
| $6.0 < \rho \le 10.0$ | 2 |
| $10.0 < \rho \le 15.0$ | 1 |
| $> 15.0$ OR $>6$ critical (severity 3) | 0 |

**TELC disqualifier**: if `accuracy.score === 0` OR `content.score === 0`,
all four criteria become 0 and `total = 0` — mirrors the real TELC rule
"if language or content = D, the whole text scores 0".

### IV Słownictwo (Vocabulary) — `scoreVocabulary()`

| Signal | Source | Weight |
|---|---|---|
| `MATTR` | length-independent TTR (window 500) | 0.30 |
| `CEFR_ge_t` | fraction of content tokens at or above target level (B1 default) | 0.30 |
| `1 − Rep` | words used ≥ 3 times / unique words (lower is better) | 0.10 |
| `Coll` | collocation match rate (in-list bigrams / total content bigrams) | 0.20 |
| `Reg_cx` | register-conformance of body lemmas vs target register | 0.10 |

`vocabulary_score = floor(5 · raw)`

## Hardcoded comments

The four per-criterion comments and the one- or two-sentence examiner
summary are stored in `data/telcComments.js`. The LLM does **not** write
them. Every learner with the same integer score reads the same comment,
byte-identical, regardless of model or temperature.

For example, the Kompozycja=4 comment is always:

> Tekst jest w większości dobrze zorganizowany. Wybór stylu odpowiedni, choć spójność mogłaby być lepsza.

This mirrors the official TELC mark-descriptor register (A/B/C/D →
5/3/1/0 with intermediate 4/2).

The examiner summary is keyed by band:
- B2 → "Praca spełnia wymagania poziomu B2…"
- B1 → "Praca spełnia wymagania poziomu B1…"
- below_B1 → "Praca nie osiąga poziomu B1…"
- `offTopic: true` → "Praca nie jest na temat…"
- `taskMisunderstood: true` → "Polecenie zostało źle zrozumiane…"

## Polish NLP layer

`services/polishNlp.js` is the deterministic NLP backend:

| Function | Used for |
|---|---|
| `tokenizeWords`, `wordCount`, `splitSentences`, `splitParagraphs` | baseline |
| `lemmatize` | collapses 100+ irregular verb forms (`jadę`/`jedziesz`/`jechałem` → `jechać`) + suffix-strip fallback for the rest |
| `findSpellingErrors` | nspell + `dictionary-pl` (Hunspell pl_PL) |
| `findPunctuationErrors` | 4 hand-written rules (space before punct, missing space after, lowercase after period, missing end punct) |
| `findGrammarErrors` | 15 hand-written regex rules (case government, common anglicisms) |
| `findAllErrors` | aggregator |
| `assignSentencesToPoints` | sentence → point assignment via content bow (function-word + stop-content-lemmas filtered, lemmatized) |
| `countDepthSignals` | depth signals for content scoring |
| `mattr` | length-independent TTR for vocabulary |
| `cefrDistribution`, `cefrAtOrAbove` | CEFR-banded vocabulary profile |
| `repetitionIndex` | repeated words (≥3 uses) / unique words |
| `collocationRate` | in-list bigrams / total content bigrams |
| `detectGreeting`, `detectClosing`, `registerMarkerCounts` | Kompozycja signals |
| `offTopicByCoverage` | off-topic heuristic (lemmatizes both sides; threshold 20 words) |

Polish data:
- `data/polishCefrWords.js` — 802 lemmas across A1 (246), A2 (164), B1 (208), B2 (182), C1 (43)
- `data/emailRegisterMarkers.js` — register greets/closings, discourse markers, collocations, function words (all with Unicode-aware boundaries using `(?<!\p{L})` / `(?!\\p{L})` since JS \b is ASCII-only)
- `data/telcComments.js` — 4 × 6 per-criterion strings + 5 band summaries + 2 special-case summaries

## LLM scope (what's still LLM-driven)

The LLM is still called for content that benefits from a generative model
and that the deterministic pipeline can't reproduce:

- `errors[]` — per-category error discovery (spelling, grammar, style, vocabulary) with offsets, corrections, explanations, alternatives
- `constructionReplacements[]` — level-appropriate alternative wordings for correct-but-level-mismatched phrases
- Stance classification (optional, defaults to 1) — "did the learner actually do what the point verb asked?"
- Narrative per-criterion comment (optional, defaults to the hardcoded string)

The LLM is **never** asked to produce integer scores, the band, the
percentage, or the per-criterion comments. The temperature for any LLM
call that feeds a numeric decision is 0.

## Database

`email_attempt` now persists:
- `deterministic_signals JSONB` — per-criterion signals from the deterministic scorer (composition/accuracy/vocabulary/content)
- `metric_version TEXT` — version stamp of the formula that produced the stored score (e.g. `'2026-07-31.1'`). Bumped on threshold/weight changes; legacy rows carry `'legacy-llm'`.

Migration: `server/src/db/migrations/027_email_scoring_metrics.sql`.

## Calibration

Tuning the formula weights and thresholds is a separate pass. The
calibration entry point:

```bash
node server/scripts/grade-fixtures.mjs
```

Runs `grade()` over every fixture in `tests/email-scoring.fixtures.json`,
prints per-criterion MAE + band agreement, and exits non-zero if
`max MAE > 0.5` OR `band agreement < 0.85`.

**Current state (as of 2026-07-31.1):** the gate is NOT yet met. The
unit tests (14/14) pass; the architecture is correct; a follow-up
calibration pass is needed to tune the formula weights / ρ bands so the
deterministic scores match human TELC rater scores within MAE 0.5.

## Tests

```bash
cd server
node --test tests/email-scoring.test.mjs
```

14 tests, hermetic (no DB, no network, no LLM), covering:
- reproducibility (100 identical runs)
- hardcoded comment key-stability
- accuracy ρ → 0-5 mapping
- disqualifier (content=0 OR accuracy=0 → total=0)
- attachHardcodedComments
- off-topic / task-misunderstood
- composition greeting/closing register detection
- per-point coverage drives content score
- metricVersion presence
- good email → B1/B2 band
- bad email → below_B1

## Migration plan from the legacy LLM rubric

The legacy `buildFinalEvaluation()` is still in `routes/email.js` but is
no longer reached by either route. The deterministic path returns a
wire-identical shape so the client needs no changes.

To roll back: revert commit `feat(email): wire deterministic scoring
into /evaluate + /evaluate-stream` — the legacy path comes back online.
