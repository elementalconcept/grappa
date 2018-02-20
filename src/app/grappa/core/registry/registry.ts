import { UID } from '../uid/uid';
import { RestClientInstance } from '../../grappa.module';

class RegistryImpl {
  private classes: { [key: string]: ClassDescriptor } = {};

  registerRequest(method: string, endpoint: string, proto: any, property: string) {
    const clsd = this.getClassDescriptor(proto);
    const metd = new MethodDescriptor();
    metd.method = method;
    metd.endpoint = endpoint;
    clsd.methods[ property ] = metd;

    proto[ property ] = prepareRequest(clsd, property);
  }

  registerClass(baseUrl: string, constructor: Initialisable) {
    const clsd = this.getClassDescriptor(constructor.prototype);
    clsd.ctor = constructor;
    clsd.baseUrl = baseUrl;
  }

  getClassDescriptor(proto: any): ClassDescriptor {
    const uid = UID(proto);
    let clsd = this.classes[ uid ];

    if (clsd === undefined) {
      clsd = new ClassDescriptor(uid, proto);
      this.classes[ uid ] = clsd;
    }

    return clsd;
  }
}

function prepareRequest(clsd: ClassDescriptor, property: string) {
  return (...args: any[]) => {
    if (!clsd.methods.hasOwnProperty(property)) {
      throw new ReferenceError(`REST function "${property}" is not defined for ${clsd.ctor.name}.`);
    }

    const func = clsd.methods[ property ];

    return RestClientInstance.request({
      baseUrl: clsd.baseUrl,
      endpoint: func.endpoint,
      method: func.method,
      args: args,
      headers: {}
    });
  };
}

class ClassDescriptor {
  baseUrl: string;
  ctor: Function;
  methods: { [key: string]: MethodDescriptor } = {};

  constructor(public uid: number, public proto: Object) {
  }
}

class MethodDescriptor {
  method: string;
  endpoint: string;
}

export interface Initialisable {
  new(...args: any[]);
}

export const Registry = new RegistryImpl();
