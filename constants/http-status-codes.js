/**
 * For a complete list and description of HTTP status codes:
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 */
const httpStatusCodes = {
  /**
   * 200
   *
   * Indicates that the request has succeeded.
   */
  ok: 200,

  /**
   * 201
   *
   * Indicates that the request has succeeded and has led to the creation of a resource.
   */
  created: 201,

  /**
   * 204
   *
   * Indicates that the request has succeeded,
   * but that the client doesn't need to go away from its current page.
   */
  noContent: 204,

  /**
   * 400
   *
   * Indicates that the server cannot or will not process the request
   * due to something that is perceived to be a client error
   * (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).
   */
  badRequest: 400,

  /**
   * 401
   *
   * Indicates that the request has not been applied because
   * it lacks valid authentication credentials for the target resource.
   */
  unauthorized: 401,

  /**
   * 403
   *
   * Indicates that the server understood the request but refuses to authorize it.
   */
  forbidden: 403,

  /**
   * 404
   * 
   * Indicates that the server can't find the requested resource.
   */
  notFound: 404,

  /**
   * 413
   * 
   * Indicates that the request entity is larger than limits defined by server;
   * the server might close the connection or return a `Retry-After` header field.
   */
  payloadTooLarge: 413,

  /**
   * 422
   *
   * Indicates that the server understands the content type of the request entity,
   * and the syntax of the request entity is correct,
   * but it was unable to process the contained instructions.
   */
  unprocessableEntity: 422,

  /**
   * 500
   *
   * Indicates that the server encountered an unexpected condition
   * that prevented it from fulfilling the request.
   */
  internalServerError: 500
}

// ============================================================================

module.exports = httpStatusCodes
