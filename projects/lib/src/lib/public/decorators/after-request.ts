import { Registry } from '../../internal/registry/registry';
import { OptionalList } from '../models';

export function AfterRequest(applyTo: OptionalList<string> = null) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Registry.registerAfterFilter(target, descriptor.value, applyTo);
  };
}
