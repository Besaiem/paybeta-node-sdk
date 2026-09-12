import { describe, expect, it } from 'vitest';
import * as sdk from '../src/index.js';

describe('package entry point exports', () => {
  it('exports PaybetaClient', () => {
    expect(sdk.PaybetaClient).toBeTypeOf('function');
  });

  it('exports PaybetaError and PaybetaApiError', () => {
    expect(sdk.PaybetaError).toBeTypeOf('function');
    expect(sdk.PaybetaApiError).toBeTypeOf('function');
  });
});
