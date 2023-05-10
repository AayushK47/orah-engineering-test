export class NotFoundError extends Error {
    statusCode: number;
    constructor(message) {
      super(message);
      this.statusCode = 422;
      this.name = 'ValidationError';
    }
}