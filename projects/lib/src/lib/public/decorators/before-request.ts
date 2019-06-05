import { Registry } from '../../internal/registry/registry';
import { OptionalList } from '../models';

export function BeforeRequest(applyTo: OptionalList<string> = null) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Registry.registerBeforeFilter(target, descriptor.value, applyTo);
  };
}
