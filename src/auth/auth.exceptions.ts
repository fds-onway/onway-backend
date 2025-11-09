export class InvalidTokenError extends Error {
  constructor(message: string = '') {
    super(message);
    this.name = 'InvalidTokenError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidTokenError);
    }
  }
}

export class InvalidUserException extends Error {
  constructor(message: string = '') {
    super(message);
    this.name = 'InvalidUserException';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidUserException);
    }
  }
}
