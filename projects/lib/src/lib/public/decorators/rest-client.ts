import { Registry } from '../../internal/registry/registry';
import { Initialisable, UrlInput } from '../models';

export function RestClient(baseUrl: UrlInput = '') {
  return (constructor: Initialisable, context: ClassDecoratorContext) => {
    Registry.registerClass(baseUrl, constructor, context.metadata);
  };
}
