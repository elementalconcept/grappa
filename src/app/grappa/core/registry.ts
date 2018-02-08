import { uid } from './uid';

class RegistryImpl {
  registerRequest(method: string, endpoint: string, target: any, property: string) {
    console.log('UID: ' + uid(target));
  }
}

export const Registry = new RegistryImpl();
