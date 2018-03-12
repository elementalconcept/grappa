import { Registry } from '../core/registry/registry';
import { RequestOptions } from './options';

export function GET(endpoint: string, options: RequestOptions = {}) {
  return (target: any, property: string) => {
    Registry.registerRequest('GET', endpoint, target, property);
  };
}
