export interface RequestOptions {
  observe?: ObserveOptions;
}

export enum ObserveOptions {
  Body = 'body',
  Response = 'response'
}
