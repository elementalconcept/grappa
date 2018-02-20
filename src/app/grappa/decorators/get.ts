import { Registry } from '../core/registry/registry';

export function GET(endpoint: string) {
  return (target: any, property: string) => {
    Registry.registerRequest('GET', endpoint, target, property);
  };
}
