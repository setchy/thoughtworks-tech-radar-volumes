## Purpose

Applies canonical ring naming consistently across outputs and filtering so the hold→caution rename at volume 34 does not fragment the dataset for consumers.

## ADDED Requirements

### Requirement: Canonical ring value in outputs
The system SHALL emit a single canonical ring value for the hold/caution ring in CSV, JSON, and Google Sheets outputs.

#### Scenario: Volume 34 caution emitted consistently
- **WHEN** a blip in volume 34 has ring `caution`
- **THEN** the output uses the canonical value matching earlier volumes' `hold`

#### Scenario: Pre-rename hold emitted consistently
- **WHEN** a blip in volumes 1-33 has ring `hold`
- **THEN** the output uses the same canonical value as volume 34's `caution`

### Requirement: Ring filtering treats hold and caution as equivalent
The system SHALL match `filter --ring hold` and `filter --ring caution` against both hold and caution records.

#### Scenario: Filtering for hold returns volume 34 rows
- **WHEN** a user filters for ring `hold`
- **THEN** the results include records with ring `caution` from volume 34

#### Scenario: Filtering for caution returns pre-rename rows
- **WHEN** a user filters for ring `caution`
- **THEN** the results include records with ring `hold` from volumes 1-33

### Requirement: Movement calculations use canonical rings
The system SHALL compute ring movements using normalized ring names so the vol-34 rename does not create spurious movements.

#### Scenario: No spurious movement at the rename boundary
- **WHEN** a blip stays on hold from volume 33 to volume 34
- **THEN** the movement calculation reports no change rather than a ring movement