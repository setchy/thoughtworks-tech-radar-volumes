## Purpose

Validates ingested radar data against schemas and provides dataset health checks so malformed or corrupt data is detected instead of silently shipped.

## ADDED Requirements

### Requirement: Schema-validated data reads
The system SHALL validate radar data against a schema when reading the master dataset, rejecting clearly malformed data.

#### Scenario: Valid dataset parses normally
- **WHEN** the master dataset conforms to the `BlipTimelineEntry` schema
- **THEN** the data is read and used without error

#### Scenario: Malformed dataset is flagged
- **WHEN** a record in the master dataset fails schema validation
- **THEN** the system reports the invalid record with a clear error instead of silently using it

### Requirement: Dataset health check
The system SHALL provide a way to surface dataset health, including counts of unknown volumes, unknown quadrants, and empty descriptions.

#### Scenario: Reporting health metrics
- **WHEN** a user runs the health check
- **THEN** the output reports total entries, unknown-volume count, unknown-quadrant count, and empty-description count

#### Scenario: Health check fails loudly on unknown volume
- **WHEN** any record carries the unknown-volume marker
- **THEN** the health check reports it as an error condition

### Requirement: Documented empty descriptions
The system SHALL treat empty descriptions in early volumes as expected data (volumes 1-14 genuinely lack descriptions in the source), not as a validation error.

#### Scenario: Early-volume empty description is accepted
- **WHEN** a record in volumes 1-14 has an empty description
- **THEN** the health check reports it as informational, not an error