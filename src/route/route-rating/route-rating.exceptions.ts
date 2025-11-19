export class UserAlreadyRatedError extends Error {
  constructor(message: string = '') {
    super(message);
    this.name = 'UserAlreadyRatedError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UserAlreadyRatedError);
    }
  }
}

export class RatingNotFoundError extends Error {
  constructor(message: string = '') {
    super(message);
    this.name = 'RatingNotFoundError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RatingNotFoundError);
    }
  }
}
