import { Registry } from '../core/registry';

export function PUT(endpoint: string) {
  return (target: any, property: string) => {
    Registry.registerRequest('PUT', endpoint, target, property);
  };
}
