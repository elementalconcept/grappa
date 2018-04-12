import { Registry } from '../core/registry/registry';
import { RequestOptions } from './options';

export function DELETE(endpoint: string, options: RequestOptions = {}) {
  return (target: any, property: string) => {
    Registry.registerRequest('DELETE', endpoint, target, property, options);
  };
}
