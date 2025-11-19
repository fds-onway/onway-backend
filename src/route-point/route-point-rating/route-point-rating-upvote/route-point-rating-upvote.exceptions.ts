export class VoteNotFoundError extends Error {
  constructor(message: string = '') {
    super(message);
    this.name = 'VoteNotFoundError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, VoteNotFoundError);
    }
  }
}
