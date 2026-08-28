import { Registry } from '../../internal/registry/registry';
import { RequestOptions } from '../models';

export function POST<T extends (...args: any[]) => any>(endpoint: string, options: RequestOptions = {}) {
  return (value: undefined, context: ClassFieldDecoratorContext<unknown, T>): () => T => {
    const request = Registry.registerRequest('POST', endpoint, context.metadata, context.name, options) as T;

    return () => request;
  };
}
