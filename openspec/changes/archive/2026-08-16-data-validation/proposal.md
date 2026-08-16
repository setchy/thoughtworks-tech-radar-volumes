## Why

The shipped datasets contain silent inconsistencies. The `hold` ring (volumes 1-33) and `caution` ring (volume 34) are the *same* ring under a Thoughtworks rename, but the CSV/JSON emit the raw name and the CLI `filter --ring` does an exact string match — so querying "everything on hold across history" silently misses all of volume 34. There is no schema validation anywhere (`readJSONFile` is a bare `JSON.parse`), so any future corruption goes undetected.

## What Changes

- Add zod schema validation for `BlipTimelineEntry` (and `MasterData`) at ingest and read time; reject or clearly flag malformed data instead of trusting it.
- **Canonical ring naming**: expose the normalized ring (`hold`→`caution`) consistently in outputs and filtering:
  - `filter --ring hold` matches both `hold` and `caution` rows (or normalizes input to canonical form)
  - CSV/JSON emit one canonical value for the ring column
  - Movement calculations continue to treat them as equivalent (already done via `normalizeRingName`)
- Document the empty-description reality (volumes 1-14 genuinely lack descriptions in the source; not a scrape gap). No data backfill in this change.
- Add a lightweight dataset health check (e.g. `stats` includes counts of unknowns/anomalies, or a `validate` command) that fails loudly on volume-100 or unknown-quadrant rows.

## Capabilities

### New Capabilities

- `data-validation`: Schema validation and dataset health checks for ingested radar data.
- `output-normalization`: Canonical ring naming applied consistently across CSV, JSON, Google Sheets, and CLI filtering.

### Modified Capabilities

No existing specs to modify (specs/ is empty).

## Impact

- `src/operations/filter.ts`, `src/operations/utils.ts`, `src/shared/constants.ts`, `src/data/repository.ts`
- `src/output/{csv,json,googleSheets,index}.ts`
- Adds `zod` dependency
- Historical `data/search-data.json` ring values remain as recorded; normalization applies at output/filter time unless the change opts to rewrite the master data