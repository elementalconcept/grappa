import { Registry } from '../core/registry/registry';
import { Options } from './options';

export function DELETE(endpoint: string, options: Options = {}) {
  return (target: any, property: string) => {
    Registry.registerRequest('DELETE', endpoint, target, property);
  };
}
