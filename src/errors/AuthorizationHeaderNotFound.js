/**
 *
 */
export default class AuthorizationHeaderNotFound extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'AuthorizationHeaderNotFound';
    this.errorCode = 400;
    this.message = args[0] || 'authorization header not found';
    Error.captureStackTrace(this, AuthorizationHeaderNotFound);
  }
}
