## 1. Test Setup

- [x] 1.1 Add Vitest as a devDependency and a `test` script (`vitest run`)
- [x] 1.2 Add `test/` directory with `test/fixtures/` for HTML fixtures
- [x] 1.3 Add a minimal vitest config (or use defaults)

## 2. Parser Tests

- [x] 2.1 Capture a multi-volume Thoughtworks blip page as a fixture
- [x] 2.2 Capture fixtures for missing description, hold/caution rings, and related blips present/absent
- [x] 2.3 Test `getRingNameFromBlipDOM`, `getPublishedDateFromBlipDOM`, `getDescriptionHTMLFromBlipDOM`
- [x] 2.4 Test `getQuadrantNameFromPath`, `getVolumeNameFromDate`, `getRelatedBlipsFromBlipDOM`
- [x] 2.5 Test `extractBlipTimeline` end-to-end against a fixture

## 3. Movement Tests

- [x] 3.1 Test `calculateBlipMovements` for isNew on first appearance
- [x] 3.2 Test hasMovedIn/hasMovedOut across ring transitions
- [x] 3.3 Test the vol-34 hold→caution boundary produces no movement

## 4. Output Tests

- [x] 4.1 Test `formatCSVDataset` and `generateJSON` data shaping
- [x] 4.2 Test `generateVolumes` grouping and ordering
- [x] 4.3 Mock the googleapis sheets client and test `updateGoogleSheets` data prep

## 5. CI Integration

- [x] 5.1 Add a test step/job to `ci.yml` running `vitest run`