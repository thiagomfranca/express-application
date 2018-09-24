/**
 *
 */
export default class ResourceNotFound extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'ResourceNotFound';
    this.errorCode = args[1] || 404;
    this.message = args[0] || 'não encontrado.';
    Error.captureStackTrace(this, ResourceNotFound);
  }
}
