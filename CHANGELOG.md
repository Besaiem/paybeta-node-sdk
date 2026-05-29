# Changelog

All notable changes to `@paybeta/node` will be documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/) and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-05-29

### Features

- Initial release of the official Paybeta Node.js SDK
- `PaybetaClient` with configurable `apiKey`, `baseUrl`, `webhookSecret`, and `timeout`
- `transactions` resource — create, list, retrieve, list history
- `payments` resource — initiate, list, retrieve, verify, retry, list attempts
- `escrows` resource — create, list, retrieve, release, refund, dispute, confirm delivery/buyer, retrieve balance and conditions
- `disputes` resource — open, list, retrieve, upload evidence, resolve, cancel
- `webhooks` resource — `constructEvent()` with HMAC-SHA512 signature verification
- `PaybetaApiError` with structured `status`, `code`, and `traceId` fields
- Dual CJS + ESM output, full TypeScript declarations, zero runtime dependencies
