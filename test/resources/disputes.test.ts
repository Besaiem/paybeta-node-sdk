import { describe, expect, it } from 'vitest';
import { DisputesResource } from '../../src/resources/disputes.js';
import { createMockHttp } from '../support/mock-http.js';

describe('DisputesResource', () => {
  it('open() posts to /disputes', async () => {
    const http = createMockHttp();
    http.post.mockResolvedValue({ id: 'dis_1' });
    const resource = new DisputesResource(http as never);

    const result = await resource.open({ transactionId: 'tx_1', reason: 'NOT_RECEIVED' } as never);

    expect(http.post).toHaveBeenCalledWith('/disputes', { transactionId: 'tx_1', reason: 'NOT_RECEIVED' });
    expect(result).toEqual({ id: 'dis_1' });
  });

  it('list() without merchantId calls the platform-only /disputes endpoint', async () => {
    const http = createMockHttp();
    http.get.mockResolvedValue([]);
    const resource = new DisputesResource(http as never);

    await resource.list({ status: 'OPENED' } as never);

    expect(http.get).toHaveBeenCalledWith('/disputes', { status: 'OPENED' });
  });

  it('list() with merchantId routes to /disputes/merchant/:id', async () => {
    const http = createMockHttp();
    http.get.mockResolvedValue([]);
    const resource = new DisputesResource(http as never);

    await resource.list({ merchantId: 'mer_1' } as never);

    expect(http.get).toHaveBeenCalledWith('/disputes/merchant/mer_1', {});
  });

  it('list() with no params calls /disputes with an empty query', async () => {
    const http = createMockHttp();
    http.get.mockResolvedValue([]);
    const resource = new DisputesResource(http as never);

    await resource.list();

    expect(http.get).toHaveBeenCalledWith('/disputes', {});
  });

  it('retrieve() gets /disputes/:id', async () => {
    const http = createMockHttp();
    http.get.mockResolvedValue({ id: 'dis_1' });
    const resource = new DisputesResource(http as never);

    await resource.retrieve('dis_1');

    expect(http.get).toHaveBeenCalledWith('/disputes/dis_1');
  });

  it('listEvidence() gets /disputes/:id/evidence', async () => {
    const http = createMockHttp();
    http.get.mockResolvedValue([{ id: 'ev_1' }]);
    const resource = new DisputesResource(http as never);

    const result = await resource.listEvidence('dis_1');

    expect(http.get).toHaveBeenCalledWith('/disputes/dis_1/evidence');
    expect(result).toEqual([{ id: 'ev_1' }]);
  });

  it('uploadEvidence() posts to /disputes/:id/evidence', async () => {
    const http = createMockHttp();
    http.post.mockResolvedValue({ id: 'ev_1' });
    const resource = new DisputesResource(http as never);

    await resource.uploadEvidence('dis_1', { fileName: 'proof.pdf' } as never);

    expect(http.post).toHaveBeenCalledWith('/disputes/dis_1/evidence', { fileName: 'proof.pdf' });
  });

  it('resolve() posts to /disputes/:id/resolve', async () => {
    const http = createMockHttp();
    http.post.mockResolvedValue({ id: 'dis_1', status: 'RESOLVED' });
    const resource = new DisputesResource(http as never);

    await resource.resolve('dis_1', { outcome: 'BUYER_WINS' } as never);

    expect(http.post).toHaveBeenCalledWith('/disputes/dis_1/resolve', { outcome: 'BUYER_WINS' });
  });

  it('cancel() posts to /disputes/:id/cancel', async () => {
    const http = createMockHttp();
    http.post.mockResolvedValue({ id: 'dis_1', status: 'CANCELLED' });
    const resource = new DisputesResource(http as never);

    await resource.cancel('dis_1', { reason: 'resolved offline' } as never);

    expect(http.post).toHaveBeenCalledWith('/disputes/dis_1/cancel', { reason: 'resolved offline' });
  });
});
