export class LiftError extends Error {
  constructor(
    message: string,
    public code: number,
    public key?: string
  ) {
    super(message);
    this.name = "LiftError";
  }
}
