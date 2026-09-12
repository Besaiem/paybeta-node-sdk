import { describe, expect, it } from 'vitest';
import { PaymentsResource } from '../../src/resources/payments.js';
import { createMockHttp } from '../support/mock-http.js';

describe('PaymentsResource', () => {
  it('initiate() posts to /payments, merging idempotencyKey into the body when set', async () => {
    const http = createMockHttp();
    http.post.mockResolvedValue({ id: 'pay_1' });
    const resource = new PaymentsResource(http as never);

    const result = await resource.initiate({ amount: 500, currency: 'NGN', idempotencyKey: 'idem-1' } as never);

    expect(http.post).toHaveBeenCalledWith('/payments', { amount: 500, currency: 'NGN', idempotencyKey: 'idem-1' });
    expect(result).toEqual({ id: 'pay_1' });
  });

  it('initiate() omits idempotencyKey from the body when not provided', async () => {
    const http = createMockHttp();
    http.post.mockResolvedValue({ id: 'pay_2' });
    const resource = new PaymentsResource(http as never);

    await resource.initiate({ amount: 500, currency: 'NGN' } as never);

    expect(http.post).toHaveBeenCalledWith('/payments', { amount: 500, currency: 'NGN' });
  });

  it('list() without merchantId calls the platform-only /payments endpoint', async () => {
    const http = createMockHttp();
    http.get.mockResolvedValue([]);
    const resource = new PaymentsResource(http as never);

    await resource.list({ status: 'PENDING' } as never);

    expect(http.get).toHaveBeenCalledWith('/payments', { status: 'PENDING' });
  });

  it('list() with merchantId routes to /payments/merchant/:id and strips it from the query', async () => {
    const http = createMockHttp();
    http.get.mockResolvedValue([]);
    const resource = new PaymentsResource(http as never);

    await resource.list({ merchantId: 'mer_1', status: 'PENDING' } as never);

    expect(http.get).toHaveBeenCalledWith('/payments/merchant/mer_1', { status: 'PENDING' });
  });

  it('list() with no params at all calls /payments with an empty query', async () => {
    const http = createMockHttp();
    http.get.mockResolvedValue([]);
    const resource = new PaymentsResource(http as never);

    await resource.list();

    expect(http.get).toHaveBeenCalledWith('/payments', {});
  });

  it('retrieve() gets /payments/:id', async () => {
    const http = createMockHttp();
    http.get.mockResolvedValue({ id: 'pay_1' });
    const resource = new PaymentsResource(http as never);

    const result = await resource.retrieve('pay_1');

    expect(http.get).toHaveBeenCalledWith('/payments/pay_1');
    expect(result).toEqual({ id: 'pay_1' });
  });

  it('verify() posts to /payments/:id/verify', async () => {
    const http = createMockHttp();
    http.post.mockResolvedValue({ id: 'pay_1', status: 'SUCCESS' });
    const resource = new PaymentsResource(http as never);

    const result = await resource.verify('pay_1');

    expect(http.post).toHaveBeenCalledWith('/payments/pay_1/verify');
    expect(result).toEqual({ id: 'pay_1', status: 'SUCCESS' });
  });

  it('retry() posts to /payments/:id/retry', async () => {
    const http = createMockHttp();
    http.post.mockResolvedValue({ id: 'pay_1' });
    const resource = new PaymentsResource(http as never);

    await resource.retry('pay_1');

    expect(http.post).toHaveBeenCalledWith('/payments/pay_1/retry');
  });

  it('listAttempts() gets /payments/:id/attempts', async () => {
    const http = createMockHttp();
    http.get.mockResolvedValue([{ id: 'att_1' }]);
    const resource = new PaymentsResource(http as never);

    const result = await resource.listAttempts('pay_1');

    expect(http.get).toHaveBeenCalledWith('/payments/pay_1/attempts');
    expect(result).toEqual([{ id: 'att_1' }]);
  });
});
