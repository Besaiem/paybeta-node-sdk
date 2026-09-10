# Changelog

All notable changes to `@paybetaby/node-sdk` will be documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/) and this project adheres to [Semantic Versioning](https://semver.org/).


## [1.0.0](https://github.com/Besaiem/paybeta-node-sdk/compare/node-sdk-v0.1.1...node-sdk-v1.0.0) (2026-09-10)


### ⚠ BREAKING CHANGES

* package renamed from @paybeta/node to @paybetaby/node-sdk.
Default baseUrl changed from https://api.paybeta.com to
https://api.usepaybeta.com. list() return shapes changed per resource
(bare arrays for payments/transactions/disputes; { escrows, total, limit,
offset } for escrows) instead of a generic { data, total, limit, offset }
envelope. webhooks.constructEvent() now requires a third `timestamp`
argument and verifies HMAC-SHA256 instead of SHA512. Several dispute and
escrow enum values changed to match the API's actual accepted values.

### Features

* rename package to @paybetaby/node-sdk and align SDK with real API behavior ([b022a98](https://github.com/Besaiem/paybeta-node-sdk/commit/b022a98e95a2844a83e29e8ffce623970db91d75))


### Bug Fixes

* add repository field required for npm provenance verification ([a7e2e88](https://github.com/Besaiem/paybeta-node-sdk/commit/a7e2e887f4fbf366b60ec44b9e687158d57559a5))
* enhance PaybetaError handling and update README documentation ([92e3384](https://github.com/Besaiem/paybeta-node-sdk/commit/92e338498b6d1cf44286801f4ca030f8e19d334f))

## 0.1.1 (2026-05-29)

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
