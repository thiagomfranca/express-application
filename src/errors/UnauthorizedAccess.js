/**
 *
 */
export default class UnauthorizedAccess extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'UnauthorizedAccess';
    this.errorCode = 401;
    this.message = args[0] || 'unauthorized access';
    Error.captureStackTrace(this, UnauthorizedAccess);
  }
}
