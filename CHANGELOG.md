# Changelog

All notable changes to SmartMoving MCP Server will be documented here.

This project uses semantic versioning while the public API is stabilizing.

## 0.1.0 - Public launch preparation

### Added

- Read-only `audit_followup_gaps` MCP tool and `smartmoving reports follow-up-gaps` CLI workflow for up to 1,000 SmartMoving job/quote rows.
- CSV ingestion for Opportunity by Move Date exports with explicit classification of gaps, invalid input, not-found records, and API failures.
- Bounded concurrency, deduplication, transient retry handling, and SmartMoving-specific HTTP 400 not-found handling.
- Read-only-by-default safety model for write/destructive SmartMoving operations.
- `SMARTMOVING_ALLOW_WRITES=true` gate for POST, PUT, and PATCH requests.
- `SMARTMOVING_ALLOW_DESTRUCTIVE=true` gate for DELETE requests.
- API-key redaction for SmartMoving API error messages.
- Vitest test harness with mocked HTTP-client coverage.
- Public release instructions for maintainers.
- Fork-and-contribute guide for operators, developers, and AI-agent users.
- Sample agent prompts for smoke tests, lookup workflows, write-enabled workflows, and coding-agent contributions.
- NPM package file whitelist for cleaner public installs.

### Changed

- Package version reset from `1.0.0` to `0.1.0` to reflect first public release status.
- Verification now runs build, tests, and high-severity npm audit.
- Install docs now recommend safe read-only first-run configuration.

### Security

- Writes are disabled unless explicitly enabled by environment variable.
- Delete-style destructive operations require a second explicit environment variable.
