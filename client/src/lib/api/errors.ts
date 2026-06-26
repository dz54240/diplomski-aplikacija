export class ApiError extends Error {
  status: number;
  fields?: Record<string, string[]>;
  list?: string[];

  constructor(
    status: number,
    message: string,
    fields?: Record<string, string[]>,
    list?: string[],
  ) {
    super(message);
    this.status = status;
    this.fields = fields;
    this.list = list;
  }
}

export function isUnauthorized(err: unknown): boolean {
  return err instanceof ApiError && err.status === 401;
}
