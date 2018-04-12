import { OptionalList, Registry } from '../core/registry/registry';

export function BeforeRequest(applyTo: OptionalList<string> = null) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Registry.registerBeforeFilter(target, descriptor.value, applyTo);
  };
}
