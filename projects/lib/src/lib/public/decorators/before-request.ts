import { Registry } from '../../internal/registry/registry';
import { OptionalList } from '../models';

export function BeforeRequest(applyTo: OptionalList<string> = null) {
  return (value: Function, context: ClassMethodDecoratorContext) => {
    Registry.registerBeforeFilter(context.metadata, value, applyTo);
  };
}
