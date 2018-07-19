import { Initialisable, Registry, UrlInput } from '../core/registry/registry';

export function RestClient(baseUrl: UrlInput = '') {
  return (constructor: Initialisable) => {
    Registry.registerClass(baseUrl, constructor);
  };
}
