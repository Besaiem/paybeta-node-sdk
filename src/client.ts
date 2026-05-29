import { HttpClient } from './http.js';
import { TransactionsResource } from './resources/transactions.js';
import { PaymentsResource } from './resources/payments.js';
import { EscrowsResource } from './resources/escrows.js';
import { DisputesResource } from './resources/disputes.js';
import { WebhooksResource } from './resources/webhooks.js';

export interface PaybetaClientConfig {
  /** API key obtained from the Paybeta dashboard (pb_live_* or pb_test_*) */
  apiKey: string;
  /** Override the default API base URL. Defaults to https://api.paybeta.com */
  baseUrl?: string;
  /** Webhook signing secret used to verify incoming webhook payloads */
  webhookSecret?: string;
  /** Request timeout in milliseconds. Defaults to 30000 */
  timeout?: number;
}

export class PaybetaClient {
  readonly transactions: TransactionsResource;
  readonly payments: PaymentsResource;
  readonly escrows: EscrowsResource;
  readonly disputes: DisputesResource;
  readonly webhooks: WebhooksResource;

  constructor(config: PaybetaClientConfig) {
    if (!config.apiKey) {
      throw new Error('PaybetaClient: apiKey is required');
    }

    const http = new HttpClient({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl ?? 'https://api.paybeta.com',
      timeout: config.timeout ?? 30_000,
    });

    this.transactions = new TransactionsResource(http);
    this.payments = new PaymentsResource(http);
    this.escrows = new EscrowsResource(http);
    this.disputes = new DisputesResource(http);
    this.webhooks = new WebhooksResource(config.webhookSecret ?? '');
  }
}
