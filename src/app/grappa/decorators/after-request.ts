import { OptionalList, Registry } from '../core/registry/registry';

export function AfterRequest(applyTo: OptionalList<string> = null) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Registry.registerAfterFilter(target, descriptor.value, applyTo);
  };
}
