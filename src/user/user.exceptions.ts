export class UserExistsException extends Error {
  constructor(message: string = '') {
    super(message);
    this.name = 'UserExistsException';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UserExistsException);
    }
  }
}

export class SendEmailException extends Error {
  constructor(message: string = '') {
    super(message);
    this.name = 'SendEmailException';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SendEmailException);
    }
  }
}
