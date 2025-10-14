export class UserExistsException extends Error {
  constructor(message: string = '') {
    super(message);
    this.name = 'UserExistsException';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UserExistsException);
    }
  }
}
