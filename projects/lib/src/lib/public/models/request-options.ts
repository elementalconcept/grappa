export interface RequestOptions {
  observe?: ObserveOptions;
  query?: number | boolean;
  noBody?: boolean;
}

export enum ObserveOptions {
  Body = 'body',
  Response = 'response'
}
