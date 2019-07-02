export interface RequestOptions {
  observe?: ObserveOptions;
  query?: number | boolean;
}

export enum ObserveOptions {
  Body = 'body',
  Response = 'response'
}
