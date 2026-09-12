import { describe, expect, it } from 'vitest';
import { TransactionsResource } from '../../src/resources/transactions.js';
import { createMockHttp } from '../support/mock-http.js';

describe('TransactionsResource', () => {
  it('create() posts to /transactions, merging opts.idempotencyKey into the body when set', async () => {
    const http = createMockHttp();
    http.post.mockResolvedValue({ id: 'tx_1' });
    const resource = new TransactionsResource(http as never);

    await resource.create({ amount: 500 } as never, { idempotencyKey: 'idem-1' });

    expect(http.post).toHaveBeenCalledWith('/transactions', { amount: 500, idempotencyKey: 'idem-1' });
  });

  it('create() omits idempotencyKey when opts is not provided', async () => {
    const http = createMockHttp();
    http.post.mockResolvedValue({ id: 'tx_1' });
    const resource = new TransactionsResource(http as never);

    await resource.create({ amount: 500 } as never);

    expect(http.post).toHaveBeenCalledWith('/transactions', { amount: 500 });
  });

  it('list() without merchantId calls the platform-only /transactions endpoint', async () => {
    const http = createMockHttp();
    http.get.mockResolvedValue([]);
    const resource = new TransactionsResource(http as never);

    await resource.list({ status: 'PENDING' } as never);

    expect(http.get).toHaveBeenCalledWith('/transactions', { status: 'PENDING' });
  });

  it('list() with merchantId routes to /transactions/merchant/:id', async () => {
    const http = createMockHttp();
    http.get.mockResolvedValue([]);
    const resource = new TransactionsResource(http as never);

    await resource.list({ merchantId: 'mer_1' } as never);

    expect(http.get).toHaveBeenCalledWith('/transactions/merchant/mer_1', {});
  });

  it('list() with no params calls /transactions with an empty query', async () => {
    const http = createMockHttp();
    http.get.mockResolvedValue([]);
    const resource = new TransactionsResource(http as never);

    await resource.list();

    expect(http.get).toHaveBeenCalledWith('/transactions', {});
  });

  it('retrieve() gets /transactions/:id', async () => {
    const http = createMockHttp();
    http.get.mockResolvedValue({ id: 'tx_1' });
    const resource = new TransactionsResource(http as never);

    const result = await resource.retrieve('tx_1');

    expect(http.get).toHaveBeenCalledWith('/transactions/tx_1');
    expect(result).toEqual({ id: 'tx_1' });
  });

  it('listHistory() gets /transactions/:id/history', async () => {
    const http = createMockHttp();
    http.get.mockResolvedValue([{ event: 'CREATED' }]);
    const resource = new TransactionsResource(http as never);

    const result = await resource.listHistory('tx_1');

    expect(http.get).toHaveBeenCalledWith('/transactions/tx_1/history');
    expect(result).toEqual([{ event: 'CREATED' }]);
  });
});
