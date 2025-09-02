import {
  OkResponse,
  CreatedResponse,
  UpdateResponse,
  DeleteResponse,
} from './success.response.js';

import {
  NotFoundRequest,
  ConflictRequest,
  BadRequest,
  ForbiddenRequest,
  UnauthorizedRequest,
  InternalServerError,
  NotImplemented,
} from './error.response.js';

import {ResponseTypes} from './response.types.js';

const responseMap = {
    [ResponseTypes.SUCCESS]: OkResponse,
    [ResponseTypes.CREATED]: CreatedResponse,
    [ResponseTypes.UPDATED]: UpdateResponse,
    [ResponseTypes.DELETED]: DeleteResponse,
    [ResponseTypes.BAD_REQUEST]: BadRequest,
    [ResponseTypes.UNAUTHORIZED]: UnauthorizedRequest,
    [ResponseTypes.FORBIDDEN]: ForbiddenRequest,
    [ResponseTypes.NOT_FOUND]: NotFoundRequest,
    [ResponseTypes.CONFLICT]: ConflictRequest,
    [ResponseTypes.INTERNAL_ERROR]: InternalServerError,
    [ResponseTypes.NOT_IMPLEMENTED]: NotImplemented,
};

class ResponseFactory {
  static create(type, options) {
    const ResponseClass = responseMap[type];
    if (ResponseClass) {
      return new ResponseClass(options);
    }
    throw new Error(`Unknown response type: ${type}`);
  }
}

export default ResponseFactory;