import { Registry } from '../../internal/registry/registry';
import { RequestOptions } from '../models';

export function DELETE(endpoint: string, options: RequestOptions = {}) {
  return (target: any, property: string) => {
    Registry.registerRequest('DELETE', endpoint, target, property, options);
  };
}
