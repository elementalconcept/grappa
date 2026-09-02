export interface RequestOptions {
  observe?: ObserveOptions;
  query?: number | boolean;
  emptyBody?: boolean;
  reportProgress?: boolean;
}

export enum ObserveOptions {
  Body = 'body',
  Response = 'response',
  Events = 'events'
}
