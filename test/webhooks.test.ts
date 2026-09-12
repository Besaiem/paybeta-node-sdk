import { createHmac } from 'crypto';
import { describe, expect, it } from 'vitest';
import { WebhooksResource } from '../src/resources/webhooks.js';
import { PaybetaError } from '../src/errors.js';

const SECRET = 'whsec_test_secret';

function sign(secret: string, timestamp: string, body: string): string {
  return createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');
}

describe('WebhooksResource.constructEvent', () => {
  it('throws when no secret was configured', () => {
    const webhooks = new WebhooksResource('');
    expect(() => webhooks.constructEvent('{}', 'sha256=abc', '123')).toThrow(PaybetaError);
    expect(() => webhooks.constructEvent('{}', 'sha256=abc', '123')).toThrow(/webhookSecret must be set/);
  });

  it('parses and returns the event for a valid signature (sha256= prefix, string body)', () => {
    const webhooks = new WebhooksResource(SECRET);
    const timestamp = '1700000000';
    const body = JSON.stringify({ type: 'payment.succeeded', data: { id: 'pay_1' } });
    const signature = `sha256=${sign(SECRET, timestamp, body)}`;

    const event = webhooks.constructEvent(body, signature, timestamp);
    expect(event).toEqual({ type: 'payment.succeeded', data: { id: 'pay_1' } });
  });

  it('accepts a bare hex signature with no sha256= prefix', () => {
    const webhooks = new WebhooksResource(SECRET);
    const timestamp = '1700000000';
    const body = JSON.stringify({ type: 'escrow.released' });
    const signature = sign(SECRET, timestamp, body);

    const event = webhooks.constructEvent(body, signature, timestamp);
    expect(event).toEqual({ type: 'escrow.released' });
  });

  it('accepts a Buffer raw body identically to the equivalent string', () => {
    const webhooks = new WebhooksResource(SECRET);
    const timestamp = '1700000000';
    const bodyStr = JSON.stringify({ type: 'dispute.opened' });
    const bodyBuf = Buffer.from(bodyStr, 'utf8');
    const signature = `sha256=${sign(SECRET, timestamp, bodyStr)}`;

    const event = webhooks.constructEvent(bodyBuf, signature, timestamp);
    expect(event).toEqual({ type: 'dispute.opened' });
  });

  it('rejects a tampered body', () => {
    const webhooks = new WebhooksResource(SECRET);
    const timestamp = '1700000000';
    const signedBody = JSON.stringify({ amount: 100 });
    const signature = `sha256=${sign(SECRET, timestamp, signedBody)}`;
    const tamperedBody = JSON.stringify({ amount: 100000 });

    expect(() => webhooks.constructEvent(tamperedBody, signature, timestamp)).toThrow(
      'Webhook signature verification failed',
    );
  });

  it('rejects a tampered timestamp', () => {
    const webhooks = new WebhooksResource(SECRET);
    const body = JSON.stringify({ amount: 100 });
    const signature = `sha256=${sign(SECRET, '1700000000', body)}`;

    expect(() => webhooks.constructEvent(body, signature, '1700000001')).toThrow(
      'Webhook signature verification failed',
    );
  });

  it('rejects a signature produced with the wrong secret', () => {
    const webhooks = new WebhooksResource(SECRET);
    const timestamp = '1700000000';
    const body = JSON.stringify({ amount: 100 });
    const signature = `sha256=${sign('wrong-secret', timestamp, body)}`;

    expect(() => webhooks.constructEvent(body, signature, timestamp)).toThrow(
      'Webhook signature verification failed',
    );
  });

  it('rejects a non-hex signature as an invalid format', () => {
    const webhooks = new WebhooksResource(SECRET);
    expect(() => webhooks.constructEvent('{}', 'sha256=not-hex-zz', '123')).toThrow('Invalid signature format');
  });

  it('rejects an odd-length hex signature as an invalid format', () => {
    const webhooks = new WebhooksResource(SECRET);
    expect(() => webhooks.constructEvent('{}', 'sha256=abc', '123')).toThrow('Invalid signature format');
  });

  it('rejects a signature of a different length than expected, before timing comparison', () => {
    const webhooks = new WebhooksResource(SECRET);
    const timestamp = '1700000000';
    const body = JSON.stringify({ amount: 100 });
    const fullSignature = sign(SECRET, timestamp, body);
    const shortSignature = fullSignature.slice(0, 10);

    expect(() => webhooks.constructEvent(body, shortSignature, timestamp)).toThrow(
      'Webhook signature verification failed',
    );
  });
});
