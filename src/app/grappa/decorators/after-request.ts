import { Registry } from '../core/registry/registry';

export function AfterRequest() {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Registry.registerAfterFilter(target, descriptor.value);
  };
}
