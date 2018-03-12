import { Registry } from '../core/registry/registry';
import { Options } from './options';

export function PUT(endpoint: string, options: Options = {}) {
  return (target: any, property: string) => {
    Registry.registerRequest('PUT', endpoint, target, property);
  };
}
