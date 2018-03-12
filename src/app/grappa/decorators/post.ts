import { Registry } from '../core/registry/registry';
import { Options } from './options';

export function POST(endpoint: string, options: Options = {}) {
  return (target: any, property: string) => {
    Registry.registerRequest('POST', endpoint, target, property);
  };
}
