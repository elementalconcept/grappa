import { Registry } from '../core/registry/registry';

export function BeforeRequest() {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Registry.registerBeforeFilter(target, descriptor.value);
  };
}
