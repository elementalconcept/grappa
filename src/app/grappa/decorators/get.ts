import { Registry } from '../core/registry/registry';
import { Options } from './options';

export function GET(endpoint: string, options: Options = {}) {
  return (target: any, property: string) => {
    Registry.registerRequest('GET', endpoint, target, property);
  };
}
