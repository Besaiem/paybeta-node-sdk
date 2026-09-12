import { describe, expect, it } from 'vitest';
import { EscrowsResource } from '../../src/resources/escrows.js';
import { createMockHttp } from '../support/mock-http.js';

describe('EscrowsResource', () => {
  it('create() posts to /escrows, merging opts.idempotencyKey into the body when set', async () => {
    const http = createMockHttp();
    http.post.mockResolvedValue({ id: 'esc_1' });
    const resource = new EscrowsResource(http as never);

    await resource.create({ amount: 500 } as never, { idempotencyKey: 'idem-1' });

    expect(http.post).toHaveBeenCalledWith('/escrows', { amount: 500, idempotencyKey: 'idem-1' });
  });

  it('create() omits idempotencyKey when opts is not provided', async () => {
    const http = createMockHttp();
    http.post.mockResolvedValue({ id: 'esc_1' });
    const resource = new EscrowsResource(http as never);

    await resource.create({ amount: 500 } as never);

    expect(http.post).toHaveBeenCalledWith('/escrows', { amount: 500 });
  });

  it('list() without merchantId calls the platform-only /escrows endpoint and returns the list envelope', async () => {
    const http = createMockHttp();
    const envelope = { escrows: [], total: 0, limit: 20, offset: 0 };
    http.get.mockResolvedValue(envelope);
    const resource = new EscrowsResource(http as never);

    const result = await resource.list({ status: 'HELD' } as never);

    expect(http.get).toHaveBeenCalledWith('/escrows', { status: 'HELD' });
    expect(result).toEqual(envelope);
  });

  it('list() with merchantId routes to /escrows/merchant/:id', async () => {
    const http = createMockHttp();
    http.get.mockResolvedValue({ escrows: [], total: 0, limit: 20, offset: 0 });
    const resource = new EscrowsResource(http as never);

    await resource.list({ merchantId: 'mer_1' } as never);

    expect(http.get).toHaveBeenCalledWith('/escrows/merchant/mer_1', {});
  });

  it('list() with no params calls /escrows with an empty query', async () => {
    const http = createMockHttp();
    http.get.mockResolvedValue({ escrows: [], total: 0, limit: 20, offset: 0 });
    const resource = new EscrowsResource(http as never);

    await resource.list();

    expect(http.get).toHaveBeenCalledWith('/escrows', {});
  });

  it('retrieve() gets /escrows/:id', async () => {
    const http = createMockHttp();
    http.get.mockResolvedValue({ id: 'esc_1' });
    const resource = new EscrowsResource(http as never);

    await resource.retrieve('esc_1');

    expect(http.get).toHaveBeenCalledWith('/escrows/esc_1');
  });

  it('retrieveBalance() gets /escrows/:id/balance', async () => {
    const http = createMockHttp();
    http.get.mockResolvedValue({ available: 0, held: 500 });
    const resource = new EscrowsResource(http as never);

    await resource.retrieveBalance('esc_1');

    expect(http.get).toHaveBeenCalledWith('/escrows/esc_1/balance');
  });

  it('retrieveConditions() gets /escrows/:id/conditions', async () => {
    const http = createMockHttp();
    http.get.mockResolvedValue({ conditions: [] });
    const resource = new EscrowsResource(http as never);

    await resource.retrieveConditions('esc_1');

    expect(http.get).toHaveBeenCalledWith('/escrows/esc_1/conditions');
  });

  it('release() posts to /escrows/:id/release with optional params', async () => {
    const http = createMockHttp();
    http.post.mockResolvedValue({ id: 'esc_1' });
    const resource = new EscrowsResource(http as never);

    await resource.release('esc_1', { note: 'delivered' } as never);

    expect(http.post).toHaveBeenCalledWith('/escrows/esc_1/release', { note: 'delivered' });
  });

  it('release() with no params still posts undefined body', async () => {
    const http = createMockHttp();
    http.post.mockResolvedValue({ id: 'esc_1' });
    const resource = new EscrowsResource(http as never);

    await resource.release('esc_1');

    expect(http.post).toHaveBeenCalledWith('/escrows/esc_1/release', undefined);
  });

  it('refund() posts to /escrows/:id/refund', async () => {
    const http = createMockHttp();
    http.post.mockResolvedValue({ id: 'esc_1' });
    const resource = new EscrowsResource(http as never);

    await resource.refund('esc_1');

    expect(http.post).toHaveBeenCalledWith('/escrows/esc_1/refund');
  });

  it('dispute() posts to /escrows/:id/dispute', async () => {
    const http = createMockHttp();
    http.post.mockResolvedValue({ id: 'esc_1' });
    const resource = new EscrowsResource(http as never);

    await resource.dispute('esc_1');

    expect(http.post).toHaveBeenCalledWith('/escrows/esc_1/dispute');
  });

  it('cancel() posts to /escrows/:id/cancel', async () => {
    const http = createMockHttp();
    http.post.mockResolvedValue({ id: 'esc_1' });
    const resource = new EscrowsResource(http as never);

    await resource.cancel('esc_1');

    expect(http.post).toHaveBeenCalledWith('/escrows/esc_1/cancel');
  });

  it('confirmDelivery() posts to /escrows/:id/confirm-delivery with optional params', async () => {
    const http = createMockHttp();
    http.post.mockResolvedValue({ id: 'esc_1' });
    const resource = new EscrowsResource(http as never);

    await resource.confirmDelivery('esc_1', { note: 'arrived' } as never);

    expect(http.post).toHaveBeenCalledWith('/escrows/esc_1/confirm-delivery', { note: 'arrived' });
  });

  it('confirmBuyer() posts to /escrows/:id/confirm-buyer with optional params', async () => {
    const http = createMockHttp();
    http.post.mockResolvedValue({ id: 'esc_1' });
    const resource = new EscrowsResource(http as never);

    await resource.confirmBuyer('esc_1', { note: 'confirmed' } as never);

    expect(http.post).toHaveBeenCalledWith('/escrows/esc_1/confirm-buyer', { note: 'confirmed' });
  });
});
