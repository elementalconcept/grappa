import { Initialisable, Registry } from '../core/registry/registry';

export function RestClient(baseUrl: string = '') {
  return (constructor: Initialisable) => {
    Registry.registerClass(baseUrl, constructor);
  };
}
