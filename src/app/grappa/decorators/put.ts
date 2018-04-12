import { Registry } from '../core/registry/registry';
import { RequestOptions } from './options';

export function PUT(endpoint: string, options: RequestOptions = {}) {
  return (target: any, property: string) => {
    Registry.registerRequest('PUT', endpoint, target, property, options);
  };
}
