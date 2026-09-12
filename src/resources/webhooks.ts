import { createHmac, timingSafeEqual } from 'crypto';
import { PaybetaError } from '../errors.js';
import type { WebhookEvent } from '../types/webhooks.js';

export class WebhooksResource {
  constructor(private readonly secret: string) {}

  /**
   * Verifies the signature on an incoming webhook and parses the payload.
   *
   * PayBeta signs the concatenation of the delivery timestamp and the raw
   * request body — `HMAC-SHA256(secret, "${timestamp}.${rawBody}")` — and
   * sends the result hex-encoded, prefixed with `sha256=`, in the
   * `X-PayBeta-Signature` header (see OutboundWebhookService). The
   * timestamp itself arrives separately in `X-PayBeta-Timestamp`, so both
   * headers are required here, not just the signature.
   *
   * Pass the raw request body (before JSON parsing), the value of the
   * `X-PayBeta-Signature` header, and the value of the `X-PayBeta-Timestamp`
   * header. Throws `PaybetaError` if the signature is invalid or the
   * secret was not configured.
   */
  constructEvent<T = unknown>(
    rawBody: string | Buffer,
    signature: string,
    timestamp: string,
  ): WebhookEvent<T> {
    if (!this.secret) {
      throw new PaybetaError(
        'webhookSecret must be set on PaybetaClient to verify webhook signatures',
      );
    }

    const body = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');

    // Accept the header verbatim (`sha256=<hex>`) or a bare hex digest, so
    // callers who've already stripped the prefix don't get a confusing
    // "invalid signature format" error.
    const hexSignature = signature.startsWith('sha256=') ? signature.slice('sha256='.length) : signature;

    // Buffer.from(str, 'hex') never throws on bad input — it silently
    // truncates at the first invalid character — so malformed hex has to
    // be rejected explicitly here, before it can masquerade as a valid
    // (but coincidentally short) signature.
    if (hexSignature.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(hexSignature)) {
      throw new PaybetaError('Invalid signature format');
    }

    const expected = createHmac('sha256', this.secret)
      .update(`${timestamp}.${body}`)
      .digest('hex');

    const actual = Buffer.from(hexSignature, 'hex');
    const expectedBuf = Buffer.from(expected, 'hex');

    if (expectedBuf.length !== actual.length || !timingSafeEqual(expectedBuf, actual)) {
      throw new PaybetaError('Webhook signature verification failed');
    }

    return JSON.parse(body) as WebhookEvent<T>;
  }
}
