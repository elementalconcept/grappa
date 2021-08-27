import { Registry } from '../../internal/registry/registry';
import { RequestOptions } from '../models';

export function PATCH(endpoint: string, options: RequestOptions = {}) {
  return (target: any, property: string) => {
    Registry.registerRequest('PATCH', endpoint, target, property, options);
  };
}
