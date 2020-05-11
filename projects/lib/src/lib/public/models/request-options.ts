export interface RequestOptions {
  observe?: ObserveOptions;
  query?: number | boolean;
  emptyBody?: boolean;
}

export enum ObserveOptions {
  Body = 'body',
  Response = 'response'
}
