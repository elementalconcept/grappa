import { Registry } from '../core/registry/registry';

export function DELETE(endpoint: string) {
  return (target: any, property: string) => {
    Registry.registerRequest('DELETE', endpoint, target, property);
  };
}
