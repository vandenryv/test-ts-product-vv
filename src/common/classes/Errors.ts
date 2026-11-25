export class ProductAlreadyExistError extends Error{
  constructor(message: string) {
    super(message);
  }
}