## Why

The project has no test suite (`"test": "echo \"Error: no test specified\" && exit 1"`). Its core value is transforming Thoughtworks HTML into structured data via brittle CSS selectors (`src/ingest/timeline/selectors.ts`). A Thoughtworks markup change silently corrupts the datasets — the highest-risk layer of the entire system has zero coverage.

## What Changes

- Add Vitest as the test runner and a `test` script (`vitest run`).
- Create fixture-based tests for the HTML parsing layer using captured Thoughtworks page HTML:
  - `getRingNameFromBlipDOM`, `getPublishedDateFromBlipDOM`, `getDescriptionHTMLFromBlipDOM`
  - `getQuadrantNameFromPath`, `getVolumeNameFromDate`, `getRelatedBlipsFromBlipDOM`
  - `extractBlipTimeline` end-to-end (fixture HTML → structured timeline entries)
- Test the movement calculation (`calculateBlipMovements`): isNew / hasMovedIn / hasMovedOut across ring transitions, including the hold→caution rename at volume 34.
- Test output generation: `formatCSVDataset`, `generateJSON`, `generateVolumes`, and `updateGoogleSheets` data shaping (against a mocked Sheets API).
- Add test fixtures directory (`test/fixtures/`) with representative blip pages.
- Wire Vitest into CI (`ci.yml`).

## Capabilities

This is a testing/tooling change with no behavior change to the CLI or data pipeline. No spec-level behavior changes.

## Impact

- New `vitest` devDependency, `test/` directory with fixtures
- `package.json` scripts, `.github/workflows/ci.yml`
- Tests will document and lock in current parser behavior (including the volume-100 fallback until `data-validation`/`robust-scraper` address it)