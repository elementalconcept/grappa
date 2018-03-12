import { Registry } from '../core/registry/registry';
import { RequestOptions } from './options';

export function POST(endpoint: string, options: RequestOptions = {}) {
  return (target: any, property: string) => {
    Registry.registerRequest('POST', endpoint, target, property);
  };
}
