export interface RequestOptions {
  observe?: ObserveOptions;
  query?: number | boolean;
  skipBody?: boolean;
}

export enum ObserveOptions {
  Body = 'body',
  Response = 'response'
}
