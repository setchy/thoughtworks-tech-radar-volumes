## Context

Today `data/search-data.json` is read via a bare `JSON.parse` (generic type only, no runtime validation). Ring names are stored as the source emits them: `hold` for volumes 1-33, `caution` for volume 34. Outputs and `filter` use the raw stored value; movement math already normalizes via `normalizeRingName` (hold→caution). See proposal.md - Why for the consumer-facing inconsistencies.

## Goals / Non-Goals

**Goals:**
- Runtime schema validation on data reads
- A health-check surface for dataset anomalies
- Canonical ring naming at the output/filter boundary without rewriting history

**Non-Goals:**
- Backfilling or rewriting the 499 empty descriptions (source genuinely lacks them; documented, not changed)
- Rewriting historical `data/search-data.json` ring values (canonicalization happens at output/filter time)
- Schema validation of Thoughtworks's HTML structure (that is `add-tests`)

## Decisions

### D1. zod as the validation library
Use `zod` schemas for `BlipTimelineEntry` and `MasterData`, applied at the read boundary in `repository.ts`. Rationale: standard, TS-first, tiny. Alternatives: `ajv` (JSON Schema, more ceremony), hand-rolled guards (error-prone).

### D2. Canonicalization at output/filter time, not in stored data
Keep `hold`/`caution` as recorded in `search-data.json` (historical fidelity), and normalize at the boundary:
- Outputs emit canonical value via a single helper
- `filter --ring` maps the query term through the canonical form
Rationale: rewriting stored data would make every historical row change and lose provenance. Alternative considered (rewrite master data) rejected for churn/accuracy.

### D3. Canonical value choice: `caution`
Normalize `hold`→`caution` (the current Thoughtworks name). Rationale: matches today's vocabulary; matches the existing `normalizeRingName` in movement math.

### D4. Health check as part of `stats`/new `validate` surface
Surface health metrics via the CLI. Decide concrete command during implementation; spec only requires the capability exists.

## Risks / Trade-offs

- [Downstream consumers rely on raw `hold` value] → Breaking for CSV/JSON consumers; document the canonicalization as part of this change. Mitigated by making the canonical value the *new* norm and noting the rename.
- [Filter semantics change could surprise] → Treat both `hold` and `caution` as aliases, so neither query regresses.
- [zod adds a runtime dep to a zero-dep-at-runtime CLI today] → Acceptable; zod is small and only exercised on read.

## Migration Plan

1. Add zod, introduce schemas at the repository read boundary.
2. Introduce the canonicalization helper; switch outputs and filter to it.
3. Add health-check surface; document behavior change in README.

## Open Questions

None — the health-check command name is an implementation detail deferred to tasks.