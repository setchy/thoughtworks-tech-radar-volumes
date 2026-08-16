## Context

The project has no tests. Its core is HTML→structured-data transformation driven by brittle CSS selectors (`src/ingest/timeline/selectors.ts`), with no coverage guarding the parser layer or output generation. See proposal.md - Why.

## Goals / Non-Goals

**Goals:**
- Vitest test suite with HTML fixtures for the parsing layer
- Tests for movement calculation and output generation
- Test coverage wired into CI

**Non-Goals:**
- Testing Thoughtworks's live site (network-dependent; fixtures instead)
- Changing parser/output behavior (tests document current behavior; behavioral fixes are `robust-scraper`/`data-validation`)
- Achieving a specific coverage percentage (focus on high-value layers)

## Decisions

### D1. Vitest as the test runner
Use Vitest (native ESM, fast, zero-config). Alternative: Jest (slower, needs ESM config). No test framework is currently present.

### D2. Fixture-based parser tests
Capture real Thoughtworks blip pages as HTML fixtures in `test/fixtures/` and run the parser helpers against them. Rationale: deterministic, offline, and regression-detectable when Thoughtworks changes markup. Include fixtures covering: multi-volume timeline, missing description (early volumes), ring at hold/caution, related blips present/absent.

### D3. Movement tests use synthetic data
Unit-test `calculateBlipMovements` with hand-built `BlipTimelineEntry[]` arrays covering isNew, hasMovedIn, hasMovedOut, and the vol-34 hold→caution boundary. Rationale: precise control over edge cases without fixtures.

### D4. Output tests mock Google Sheets API
Test `formatCSVDataset`, `generateJSON`, and `generateVolumes` directly; for `updateGoogleSheets`, mock `googleapis` sheets client. Rationale: validate data shaping (headers, canonical status) without real credentials.

### D5. Tests in CI
Add a `test` job (or step) to `ci.yml` running `vitest run`.

## Risks / Trade-offs

- [Fixtures go stale as Thoughtworks changes markup] → Keep fixtures pinned; when tests fail, that IS the signal to review selectors.
- [Over-coupling tests to current (possibly buggy) behavior] → Document current behavior; behavioral corrections land in the related changes first.
- [Vitest adds devDependency surface] → devDependencies only; no runtime impact.

## Migration Plan

1. Add Vitest + `test` script.
2. Add fixtures and parser tests.
3. Add movement + output tests.
4. Wire into CI.

## Open Questions

None.