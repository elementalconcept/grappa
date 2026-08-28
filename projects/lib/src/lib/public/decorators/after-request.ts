import { Registry } from '../../internal/registry/registry';
import { OptionalList } from '../models';

export function AfterRequest(applyTo: OptionalList<string> = null) {
  return (value: Function, context: ClassMethodDecoratorContext) => {
    Registry.registerAfterFilter(context.metadata, value, applyTo);
  };
}
