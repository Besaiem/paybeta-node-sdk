import { createHmac, timingSafeEqual } from 'crypto';
import { PaybetaError } from '../errors.js';
import type { WebhookEvent } from '../types/webhooks.js';

export class WebhooksResource {
  constructor(private readonly secret: string) {}

  /**
   * Verifies the HMAC-SHA512 signature on an incoming webhook and parses the payload.
   *
   * Pass the raw request body (before JSON parsing) and the value of the
   * `x-paybeta-signature` header. Throws `PaybetaError` if the signature is
   * invalid or the secret was not configured.
   */
  constructEvent<T = unknown>(rawBody: string | Buffer, signature: string): WebhookEvent<T> {
    if (!this.secret) {
      throw new PaybetaError(
        'webhookSecret must be set on PaybetaClient to verify webhook signatures',
      );
    }

    const expected = createHmac('sha512', this.secret)
      .update(rawBody)
      .digest('hex');

    let actual: Buffer;
    try {
      actual = Buffer.from(signature, 'hex');
    } catch {
      throw new PaybetaError('Invalid signature format');
    }

    const expectedBuf = Buffer.from(expected, 'hex');
    if (expectedBuf.length !== actual.length || !timingSafeEqual(expectedBuf, actual)) {
      throw new PaybetaError('Webhook signature verification failed');
    }

    const body = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
    return JSON.parse(body) as WebhookEvent<T>;
  }
}
