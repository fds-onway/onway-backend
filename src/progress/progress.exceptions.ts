export class PointIsNotInTheSameRouteError extends Error {
  constructor(message: string = '') {
    super(message);
    this.name = 'PointIsNotInTheSameRouteError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PointIsNotInTheSameRouteError);
    }
  }
}
