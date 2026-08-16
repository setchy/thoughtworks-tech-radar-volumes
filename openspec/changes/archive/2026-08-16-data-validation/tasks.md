## 1. Schema Validation

- [x] 1.1 Add `zod` dependency to package.json
- [x] 1.2 Define a zod schema for `BlipTimelineEntry` and `MasterData`
- [x] 1.3 Apply schema validation at the repository read boundary (`readJSONFile`)
- [x] 1.4 Verify malformed-data error path surfaces the offending record

## 2. Canonical Ring Naming

- [x] 2.1 Add a canonicalization helper for ring values (hold→caution)
- [x] 2.2 Apply canonicalization in `output/csv.ts`, `output/json.ts`, `output/googleSheets.ts`
- [x] 2.3 Update `filter` to treat `hold` and `caution` as equivalent query terms
- [x] 2.4 Confirm movement calculation already treats them as equivalent (verify, adjust if needed)

## 3. Health Check

- [x] 3.1 Add a dataset health-check surface reporting totals, unknown volumes, unknown quadrants, empty descriptions
- [x] 3.2 Report unknown-volume records as an error condition
- [x] 3.3 Report early-volume empty descriptions as informational
- [x] 3.4 Expose the health check via the CLI

## 4. Documentation

- [x] 4.1 Document canonical ring behavior in README
- [x] 4.2 Document that volumes 1-14 descriptions are genuinely absent from the source