# @paybeta/node

Official Node.js SDK for the [Paybeta](https://paybeta.com) payments API. Fully typed TypeScript library with zero runtime dependencies, native `fetch`, and dual CJS/ESM output.

---

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [Configuration](#configuration)
- [Resources](#resources)
  - [Transactions](#transactions)
  - [Payments](#payments)
  - [Escrows](#escrows)
  - [Disputes](#disputes)
  - [Webhooks](#webhooks)
- [Error Handling](#error-handling)
- [TypeScript](#typescript)
- [Building from Source](#building-from-source)

---

## Requirements

- Node.js **18** or later (uses native `fetch`)
- A Paybeta merchant account — [sign up at paybeta.com](https://paybeta.com)
- An API key from your Paybeta dashboard (`pb_live_…` for production, `pb_test_…` for sandbox)

---

## Installation

```bash
npm install @paybeta/node
# or
yarn add @paybeta/node
# or
pnpm add @paybeta/node
```

---

## Quick Start

```typescript
import { PaybetaClient } from '@paybeta/node';

const paybeta = new PaybetaClient({
  apiKey: process.env.PAYBETA_API_KEY!,
  webhookSecret: process.env.PAYBETA_WEBHOOK_SECRET,
});

// 1. Create a transaction
const transaction = await paybeta.transactions.create({
  buyerEmail:  'buyer@example.com',
  sellerEmail: 'seller@example.com',
  amount:      50_000,   // in kobo (₦500.00)
  currency:    'NGN',
});

// 2. Initiate payment — get a redirect URL for your customer
const payment = await paybeta.payments.initiate({
  merchantId:    'your-merchant-id',
  transactionId: transaction.id,
  amount:        50_000,
  currency:      'NGN',
  paymentMethod: 'CARD',
  pspType:       'PAYSTACK',
  customerEmail: 'buyer@example.com',
});

// Redirect the customer to complete payment
console.log(payment.authorizationUrl);
```

---

## Authentication

Paybeta uses **API key authentication**. Pass your key once when constructing the client — all subsequent requests carry it automatically via the `X-API-Key` header.

```typescript
const paybeta = new PaybetaClient({ apiKey: 'pb_live_...' });
```

| Key prefix  | Environment           |
|-------------|----------------------|
| `pb_live_…` | Production (live)    |
| `pb_test_…` | Sandbox (test mode)  |

> **Keep your API key secret.** Never embed it in client-side code or commit it to version control. Use environment variables.

---

## Configuration

```typescript
const paybeta = new PaybetaClient({
  // Required
  apiKey: 'pb_live_...',

  // Optional — defaults to https://api.paybeta.com
  baseUrl: 'https://api.paybeta.com',

  // Optional — required only for webhook.constructEvent()
  webhookSecret: 'your-webhook-secret',

  // Optional — request timeout in milliseconds (default: 30000)
  timeout: 30_000,
});
```

### `PaybetaClientConfig`

| Option          | Type     | Default                        | Description                                   |
|-----------------|----------|--------------------------------|-----------------------------------------------|
| `apiKey`        | `string` | **required**                   | Your Paybeta API key                          |
| `baseUrl`       | `string` | `https://api.paybeta.com`      | Override for staging or self-hosted instances |
| `webhookSecret` | `string` | `undefined`                    | HMAC secret for webhook signature verification|
| `timeout`       | `number` | `30000`                        | Request timeout in milliseconds               |

---

## Resources

### Transactions

A **transaction** represents the commercial relationship between a buyer and seller. Create one before initiating a payment or creating an escrow.

#### `paybeta.transactions.create(params)`

```typescript
const transaction = await paybeta.transactions.create({
  buyerEmail:  'buyer@example.com',
  sellerEmail: 'seller@example.com',
  amount:      150_000,   // ₦1,500.00 in kobo
  currency:    'NGN',
  metadata: {
    orderId:     'ORD-001',
    productName: 'MacBook Air',
  },
});

console.log(transaction.id);     // UUID
console.log(transaction.status); // 'INITIATED'
```

#### `paybeta.transactions.list(params?)`

```typescript
const { data, total } = await paybeta.transactions.list({
  merchantId: 'your-merchant-id',
  status:     'FUNDED',
  limit:      20,
  offset:     0,
});
```

#### `paybeta.transactions.retrieve(id)`

```typescript
const transaction = await paybeta.transactions.retrieve('txn-uuid');
```

#### `paybeta.transactions.listHistory(id)`

```typescript
const events = await paybeta.transactions.listHistory('txn-uuid');
// Returns TransactionEvent[] — status changes, saga steps, etc.
```

**Transaction statuses:** `INITIATED` → `FUNDED` → `IN_ESCROW` → `RELEASED` / `DISPUTED` / `REFUNDED`

---

### Payments

A **payment** records a customer's attempt to fund a transaction via a PSP (Paystack, Flutterwave).

#### `paybeta.payments.initiate(params)`

```typescript
const payment = await paybeta.payments.initiate({
  merchantId:    'your-merchant-id',
  transactionId: transaction.id,
  amount:        150_000,
  currency:      'NGN',
  paymentMethod: 'CARD',       // 'CARD' | 'BANK_TRANSFER' | 'USSD' | 'MOBILE_MONEY'
  pspType:       'PAYSTACK',   // 'PAYSTACK' | 'FLUTTERWAVE' | 'BANK_DIRECT'
  customerEmail: 'buyer@example.com',
  customerName:  'Jane Doe',   // optional
  redirectUrl:   'https://yourapp.com/payment/callback', // optional
  metadata: { sessionId: 'abc' }, // optional
});

// Redirect your customer to complete the payment
window.location.href = payment.authorizationUrl!;
```

#### `paybeta.payments.verify(id)`

Call this when the customer returns from the PSP redirect to confirm the payment status.

```typescript
const payment = await paybeta.payments.verify(paymentId);

if (payment.status === 'COMPLETED') {
  // fulfil the order
}
```

#### `paybeta.payments.retrieve(id)`

```typescript
const payment = await paybeta.payments.retrieve(paymentId);
```

#### `paybeta.payments.list(params?)`

```typescript
const { data } = await paybeta.payments.list({ merchantId: 'your-merchant-id', limit: 50 });
```

#### `paybeta.payments.retry(id)`

```typescript
const retried = await paybeta.payments.retry(paymentId);
```

#### `paybeta.payments.listAttempts(id)`

```typescript
const attempts = await paybeta.payments.listAttempts(paymentId);
```

**Payment statuses:** `PENDING` → `PROCESSING` → `COMPLETED` / `FAILED` / `CANCELLED`

---

### Escrows

**Escrows** hold funds securely between buyer and seller until configurable release conditions are met. Available on **Growth** and **Enterprise** plans.

#### `paybeta.escrows.create(params)`

```typescript
const escrow = await paybeta.escrows.create({
  transactionId: transaction.id,
  merchantId:    'your-merchant-id',
  buyerEmail:    'buyer@example.com',
  sellerEmail:   'seller@example.com',
  amount:        150_000,
  currency:      'NGN',
  releasePolicy: {
    conditionLogic: 'AND',   // release only when ALL conditions are met
    conditions: [
      { type: 'DELIVERY_CONFIRMED' },
      { type: 'BUYER_APPROVED' },
    ],
  },
});
```

**Condition types:**

| Type                  | Description                                        |
|-----------------------|----------------------------------------------------|
| `DELIVERY_CONFIRMED`  | Seller confirms goods/services delivered           |
| `BUYER_APPROVED`      | Buyer explicitly approves release                  |
| `TIMEOUT_ELAPSED`     | Auto-release after a configured time window        |
| `MANUAL_RELEASE`      | Merchant triggers release manually                 |

**Condition logic:**

| Value | Meaning                                   |
|-------|-------------------------------------------|
| `AND` | All conditions must be met before release |
| `OR`  | Any one condition triggers release        |

#### `paybeta.escrows.release(id, params?)`

```typescript
await paybeta.escrows.release(escrowId, { reason: 'Order delivered and confirmed' });
```

#### `paybeta.escrows.confirmDelivery(id)`

```typescript
await paybeta.escrows.confirmDelivery(escrowId);
```

#### `paybeta.escrows.confirmBuyer(id)`

```typescript
await paybeta.escrows.confirmBuyer(escrowId);
```

#### `paybeta.escrows.dispute(id)`

```typescript
await paybeta.escrows.dispute(escrowId);
```

#### `paybeta.escrows.refund(id)`

```typescript
await paybeta.escrows.refund(escrowId);
```

#### `paybeta.escrows.retrieve(id)`

```typescript
const escrow = await paybeta.escrows.retrieve(escrowId);
console.log(escrow.status); // 'FUNDED' | 'PENDING_RELEASE' | 'RELEASED' | ...
```

#### `paybeta.escrows.retrieveBalance(id)`

```typescript
const { balance, currency } = await paybeta.escrows.retrieveBalance(escrowId);
```

#### `paybeta.escrows.retrieveConditions(id)`

```typescript
const conditions = await paybeta.escrows.retrieveConditions(escrowId);
conditions.forEach(c => console.log(c.type, c.isMet));
```

#### `paybeta.escrows.list(params?)`

```typescript
const { data } = await paybeta.escrows.list({
  merchantId: 'your-merchant-id',
  status:     'FUNDED',
  limit:      20,
});
```

**Escrow statuses:** `CREATED` → `FUNDED` → `PENDING_RELEASE` → `RELEASED` / `DISPUTED` / `REFUNDED` / `CANCELLED`

---

### Disputes

A **dispute** is opened when buyer and seller cannot agree. Paybeta provides a structured arbitration workflow.

#### `paybeta.disputes.open(params)`

```typescript
const dispute = await paybeta.disputes.open({
  transactionId: transaction.id,
  escrowId:      escrow.id,         // optional
  disputeType:   'BUYER_COMPLAINT',
  description:   'Item not as described.',
  priority:      'HIGH',
});
```

#### `paybeta.disputes.uploadEvidence(id, params)`

```typescript
await paybeta.disputes.uploadEvidence(disputeId, {
  fileBase64:  Buffer.from(fileBytes).toString('base64'),
  fileType:    'image/jpeg',
  description: 'Photo of damaged packaging',
  submittedBy: 'buyer@example.com',
});
```

#### `paybeta.disputes.resolve(id, params)`

```typescript
await paybeta.disputes.resolve(disputeId, {
  outcome:              'BUYER_WINS',
  notes:                'Evidence confirmed item was not delivered.',
  buyerRefundAmount:    150_000,
  sellerPayoutAmount:   0,
});
```

#### `paybeta.disputes.cancel(id, params)`

```typescript
await paybeta.disputes.cancel(disputeId, { reason: 'Parties reached mutual agreement.' });
```

#### `paybeta.disputes.retrieve(id)` / `paybeta.disputes.list(params?)`

```typescript
const dispute = await paybeta.disputes.retrieve(disputeId);
const { data } = await paybeta.disputes.list({ merchantId: 'your-merchant-id', status: 'OPEN' });
```

---

### Webhooks

Paybeta sends signed webhook events to your server when key state changes occur (payment completed, escrow released, dispute opened, etc.). Use `webhooks.constructEvent()` to verify the signature and parse the payload safely.

#### Setup

Configure your client with a `webhookSecret`:

```typescript
const paybeta = new PaybetaClient({
  apiKey:        process.env.PAYBETA_API_KEY!,
  webhookSecret: process.env.PAYBETA_WEBHOOK_SECRET!,
});
```

#### Express example

```typescript
import express from 'express';
import { PaybetaClient, PaybetaError, type WebhookEvent } from '@paybeta/node';

const app = express();
const paybeta = new PaybetaClient({
  apiKey:        process.env.PAYBETA_API_KEY!,
  webhookSecret: process.env.PAYBETA_WEBHOOK_SECRET!,
});

// IMPORTANT: use raw body — do NOT use express.json() for this route
app.post(
  '/webhooks/paybeta',
  express.raw({ type: '*/*' }),
  (req, res) => {
    const signature = req.headers['x-paybeta-signature'] as string;

    let event: WebhookEvent;
    try {
      event = paybeta.webhooks.constructEvent(req.body, signature);
    } catch (err) {
      if (err instanceof PaybetaError) {
        console.error('Webhook signature invalid:', err.message);
        return res.status(400).send('Webhook signature verification failed');
      }
      throw err;
    }

    switch (event.type) {
      case 'payment.completed':
        console.log('Payment completed:', event.data);
        // fulfil order, send confirmation email, etc.
        break;
      case 'transaction.funded':
        console.log('Transaction funded:', event.data);
        break;
      case 'escrow.released':
        console.log('Escrow released:', event.data);
        break;
      case 'dispute.opened':
        console.log('Dispute opened:', event.data);
        break;
      default:
        console.log('Unhandled event type:', event.type);
    }

    res.json({ received: true });
  }
);
```

#### Event types

| Event type              | Description                                      |
|-------------------------|--------------------------------------------------|
| `transaction.created`   | New transaction created                          |
| `transaction.funded`    | Customer's payment cleared; funds received       |
| `transaction.in_escrow` | Funds moved into escrow hold                     |
| `transaction.released`  | Funds released to seller                         |
| `transaction.disputed`  | Dispute opened on transaction                    |
| `transaction.refunded`  | Transaction refunded to buyer                    |
| `payment.initiated`     | Payment initiated with PSP                       |
| `payment.completed`     | Payment confirmed as successful                  |
| `payment.failed`        | Payment failed or declined                       |
| `escrow.created`        | Escrow created and awaiting funding              |
| `escrow.funded`         | Escrow funded                                    |
| `escrow.released`       | Escrow funds disbursed to seller                 |
| `escrow.disputed`       | Escrow placed into dispute hold                  |
| `escrow.refunded`       | Escrow funds returned to buyer                   |
| `dispute.opened`        | Dispute opened                                   |
| `dispute.resolved`      | Dispute resolved with outcome                    |
| `dispute.cancelled`     | Dispute cancelled                                |

---

## Error Handling

The SDK throws two error types:

### `PaybetaApiError`

Thrown when the API returns a non-2xx response.

```typescript
import { PaybetaApiError } from '@paybeta/node';

try {
  const escrow = await paybeta.escrows.create({ ... });
} catch (err) {
  if (err instanceof PaybetaApiError) {
    console.error(err.message);   // Human-readable error message
    console.error(err.status);    // HTTP status code (e.g. 402, 403, 404)
    console.error(err.code);      // Machine-readable code (e.g. 'FEATURE_NOT_AVAILABLE')
    console.error(err.traceId);   // Paybeta trace ID for support
  }
}
```

**Common error codes:**

| Code                      | Status | Meaning                                                      |
|---------------------------|--------|--------------------------------------------------------------|
| `FEATURE_NOT_AVAILABLE`   | 403    | Feature not enabled on your plan (e.g. escrow on Starter)   |
| `VOLUME_LIMIT_EXCEEDED`   | 402    | Monthly volume limit reached — upgrade your plan             |
| `API_KEY_LIMIT_EXCEEDED`  | 402    | API key count limit reached for your plan                    |
| `NOT_FOUND`               | 404    | Resource not found                                           |
| `UNAUTHORIZED`            | 401    | Invalid or missing API key                                   |
| `TOO_MANY_REQUESTS`       | 429    | Rate limit exceeded                                          |
| `BAD_REQUEST`             | 400    | Validation error — check the error message for field details |

### `PaybetaError`

Thrown for client-side errors: request timeout, webhook signature failure, missing configuration.

```typescript
import { PaybetaError } from '@paybeta/node';

try {
  const event = paybeta.webhooks.constructEvent(rawBody, signature);
} catch (err) {
  if (err instanceof PaybetaError) {
    // signature mismatch, missing webhookSecret, etc.
    console.error(err.message);
  }
}
```

---

## TypeScript

The SDK is written in TypeScript and ships full type declarations. No `@types` package required.

All parameter and response types are exported from the package root:

```typescript
import type {
  // Client
  PaybetaClientConfig,

  // Common
  PaginatedList,
  RequestOptions,

  // Transactions
  Transaction,
  TransactionStatus,
  TransactionEvent,
  CreateTransactionParams,
  ListTransactionsParams,

  // Payments
  Payment,
  PaymentStatus,
  PaymentMethod,
  PSPType,
  InitiatePaymentParams,

  // Escrows
  Escrow,
  EscrowStatus,
  EscrowBalance,
  ReleasePolicy,
  ReleaseCondition,
  ConditionType,
  ConditionLogic,
  CreateEscrowParams,

  // Disputes
  Dispute,
  DisputeStatus,
  DisputeStage,
  DisputeType,
  OpenDisputeParams,
  ResolveDisputeParams,

  // Webhooks
  WebhookEvent,
  WebhookEventType,
  TransactionWebhookEvent,
  PaymentWebhookEvent,
  EscrowWebhookEvent,
  DisputeWebhookEvent,
} from '@paybeta/node';
```

---

## Building from Source

```bash
git clone https://github.com/paybeta/paybeta-sdks
cd paybeta-sdks/@paybeta-node-sdk

npm install
npm run build       # outputs to dist/
npm run typecheck   # type-check without emitting
npm run dev         # watch mode
```

The build uses [tsup](https://tsup.egoist.dev/) and produces:

| File                  | Format | Description                  |
|-----------------------|--------|------------------------------|
| `dist/index.js`       | CJS    | CommonJS (require)           |
| `dist/index.mjs`      | ESM    | ES Modules (import)          |
| `dist/index.d.ts`     | DTS    | TypeScript declarations      |
| `dist/index.d.mts`    | DTS    | ESM TypeScript declarations  |

---

## License

MIT © Paybeta
