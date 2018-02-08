import { UID } from './uid';
import { RestClientInstance } from '../grappa.module';

class RegistryImpl {
  private classes: { [key: string]: ClassDescriptor } = {};

  registerRequest(method: string, endpoint: string, proto: any, property: string) {
    const clsd = this.getClassDescriptor(proto);
    const metd = new MethodDescriptor();
    metd.method = method;
    metd.endpoint = endpoint;
    clsd.methods[ property ] = metd;

    proto[property] = prepareRequest(clsd, property);
  }

  registerClass(baseUrl: string, constructor: Initialisable) {
    const clsd = this.getClassDescriptor(constructor.prototype);
    clsd.ctor = constructor;
    clsd.baseUrl = baseUrl;

    console.log('registerClass', constructor instanceof Object);
    console.log('registerClass', constructor instanceof Function);
    console.log(this.classes);
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
    console.log(clsd);
    console.log(property);
    console.log(args);
    console.log(RestClientInstance);
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
