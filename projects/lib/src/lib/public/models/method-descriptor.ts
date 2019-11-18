import { RequestOptions } from '../index';

export class MethodDescriptor {
  method: string;
  endpoint: string;
  options: RequestOptions;

  constructor(public readonly name: string) {
  }
}
