import { Registry } from '../../internal/registry/registry';
import { RequestOptions } from '../models';

export function PUT(endpoint: string, options: RequestOptions = {}) {
  return (target: any, property: string) => {
    Registry.registerRequest('PUT', endpoint, target, property, options);
  };
}
