export class PaybetaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaybetaError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class PaybetaApiError extends PaybetaError {
  readonly status: number;
  readonly code: string;
  readonly traceId: string;
  readonly timestamp: string;

  constructor(status: number, code: string, message: string, traceId: string, timestamp: string) {
    super(message);
    this.name = 'PaybetaApiError';
    this.status = status;
    this.code = code;
    this.traceId = traceId;
    this.timestamp = timestamp;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
