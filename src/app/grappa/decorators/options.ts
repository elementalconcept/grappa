export interface Options {
  observe?: ObserveOptions;
}

export enum ObserveOptions {
  Body = 'body',
  Response = 'response'
}
