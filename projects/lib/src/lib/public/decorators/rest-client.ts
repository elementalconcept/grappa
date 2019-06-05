import { Registry } from '../../internal/registry/registry';
import { Initialisable, UrlInput } from '../models';

export function RestClient(baseUrl: UrlInput = '') {
  return (constructor: Initialisable) => {
    Registry.registerClass(baseUrl, constructor);
  };
}
