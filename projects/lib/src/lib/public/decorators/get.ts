import { Registry } from '../../internal/registry/registry';
import { RequestOptions } from '../models';

export function GET(endpoint: string, options: RequestOptions = {}) {
  return (target: any, property: string) => {
    Registry.registerRequest('GET', endpoint, target, property, options);
  };
}
