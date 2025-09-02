import httpCodes from "./httpCode.constants.js";

const { StatusCodes, ReasonPhrases } = httpCodes;

class SussesResponse {
  constructor({ message, statusCode = StatusCodes.OK, reasonStatusCode = ReasonPhrases.OK, metadata = {} }) {
    this.status = 'OK';
    this.message = message || reasonStatusCode;
    this.statusCode = statusCode;
    this.metadata = metadata;
  }

  send(res, headers = {}) {
    return res.status(this.statusCode).json(this)
  }
}

class CreatedResponse extends SussesResponse {
  constructor({ message, statusCode = StatusCodes.CREATED, reasonStatusCode = ReasonPhrases.CREATED, metadata = {}, options = {} }) {
    super({ message, statusCode, reasonStatusCode, metadata });
    this.options = options;
  }
}

class OkResponse extends SussesResponse {
  constructor({ message, statusCode = StatusCodes.OK, reasonStatusCode = ReasonPhrases.OK, metadata = {}, options = {} }) {
    super({ message, statusCode, reasonStatusCode, metadata });
  }
}

class UpdateResponse extends SussesResponse {
  constructor({ message, statusCode = StatusCodes.NO_CONTENT, reasonStatusCode = ReasonPhrases.NO_CONTENT, metadata = {} }) {
    super({ message, statusCode, reasonStatusCode, metadata });
  }
}

class DeleteResponse extends SussesResponse {
  constructor({ message, statusCode = StatusCodes.ACCEPTED, reasonStatusCode = ReasonPhrases.ACCEPTED, metadata = {} }) {
    super({ message, statusCode, reasonStatusCode, metadata });
  }
}

export{
  OkResponse,
  CreatedResponse,
  UpdateResponse,
  DeleteResponse
}