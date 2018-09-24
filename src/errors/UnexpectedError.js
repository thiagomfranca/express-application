/**
 *
 */
export default class UnexpectedError extends Error {
  constructor(...args) {
    super(...args);

    this.name = 'UnexpectedError';
    this.errorCode = 500;
    this.message = args[0] || 'Unexpected error.';

    Error.captureStackTrace(this, AuthorizationHeaderNotFound);
  }
}
