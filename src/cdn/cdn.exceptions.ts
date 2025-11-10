export class FileExistsException extends Error {
  constructor(message: string = '') {
    super(message);
    this.name = 'FileExistsException';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FileExistsException);
    }
  }
}
