import { afterEach, describe, expect, it, vi } from 'vitest';
import { PaybetaClient } from '../src/client.js';
import { TransactionsResource } from '../src/resources/transactions.js';
import { PaymentsResource } from '../src/resources/payments.js';
import { EscrowsResource } from '../src/resources/escrows.js';
import { DisputesResource } from '../src/resources/disputes.js';
import { WebhooksResource } from '../src/resources/webhooks.js';
import { buildMockResponse, stubFetch } from './support/mock-fetch.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PaybetaClient construction', () => {
  it('throws when apiKey is missing', () => {
    expect(() => new PaybetaClient({} as never)).toThrow(/apiKey is required/);
  });

  it('throws when apiKey is an empty string', () => {
    expect(() => new PaybetaClient({ apiKey: '' })).toThrow(/apiKey is required/);
  });

  it('wires up all five resources with the right classes', () => {
    const client = new PaybetaClient({ apiKey: 'pb_test_key' });

    expect(client.transactions).toBeInstanceOf(TransactionsResource);
    expect(client.payments).toBeInstanceOf(PaymentsResource);
    expect(client.escrows).toBeInstanceOf(EscrowsResource);
    expect(client.disputes).toBeInstanceOf(DisputesResource);
    expect(client.webhooks).toBeInstanceOf(WebhooksResource);
  });

  it('defaults baseUrl to https://api.usepaybeta.com and sends the configured apiKey', async () => {
    const fetchMock = stubFetch(buildMockResponse({ json: { id: 'tx_1' } }));
    const client = new PaybetaClient({ apiKey: 'pb_live_xyz' });

    await client.transactions.retrieve('tx_1');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.usepaybeta.com/v1/transactions/tx_1',
      expect.objectContaining({ headers: expect.objectContaining({ 'X-API-Key': 'pb_live_xyz' }) }),
    );
  });

  it('honors a custom baseUrl', async () => {
    const fetchMock = stubFetch(buildMockResponse({ json: { id: 'tx_1' } }));
    const client = new PaybetaClient({ apiKey: 'pb_live_xyz', baseUrl: 'https://sandbox.usepaybeta.com' });

    await client.transactions.retrieve('tx_1');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://sandbox.usepaybeta.com/v1/transactions/tx_1',
      expect.anything(),
    );
  });

  it('wires webhooks with an empty secret when webhookSecret is not provided', () => {
    const client = new PaybetaClient({ apiKey: 'pb_test_key' });
    expect(() => client.webhooks.constructEvent('{}', 'sha256=abc', '123')).toThrow(
      /webhookSecret must be set/,
    );
  });

  it('wires webhooks with the provided secret', () => {
    const client = new PaybetaClient({ apiKey: 'pb_test_key', webhookSecret: 'whsec_abc' });
    // A wrong signature now fails verification (reachable past the "secret configured" guard)
    // rather than failing on the "secret not configured" guard — proving the secret was wired through.
    expect(() => client.webhooks.constructEvent('{}', 'sha256=' + 'a'.repeat(64), '123')).toThrow(
      /Webhook signature verification failed/,
    );
  });
});
