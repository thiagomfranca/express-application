/**
 *
 */
export default class ResourceDuplicated extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'ResourceDuplicated';
    this.errorCode = args[1] || 400;
    this.message = args[0] || 'recurso já existe.';
    Error.captureStackTrace(this, ResourceDuplicated);
  }
}
