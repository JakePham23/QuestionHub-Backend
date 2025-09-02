// response.types.js
export const ResponseTypes = {
  SUCCESS: 'success',
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
  BAD_REQUEST: 'bad_request',
  // token or not sign in
  UNAUTHORIZED: 'unauthorized',
  // not allowed or banned
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not_found',
  CONFLICT: 'conflict',
  // server error
  INTERNAL_ERROR: 'internal_error',
  NOT_IMPLEMENTED: 'not_implemented',
};
