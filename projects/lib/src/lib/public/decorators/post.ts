import { Registry } from '../../internal/registry/registry';
import { RequestOptions } from '../models';

export function POST(endpoint: string, options: RequestOptions = {}) {
  return (target: any, property: string) => {
    Registry.registerRequest('POST', endpoint, target, property, options);
  };
}
