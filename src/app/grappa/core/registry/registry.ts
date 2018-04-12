import { UID } from '../uid/uid';
import { RestClientInstance } from '../../grappa.module';
import { RestRequest } from '../../services/rest-client/rest-client.service';
import { ObserveOptions, RequestOptions } from '../../decorators/options';

class RegistryImpl {
  private static readonly defaultRequestOptions: RequestOptions = { observe: ObserveOptions.Body };

  private classes: { [ key: string ]: ClassDescriptor } = {};

  registerRequest(method: string, endpoint: string, proto: any, property: string, options: RequestOptions) {
    const clsd = this.getClassDescriptor(proto);
    const metd = new MethodDescriptor();
    metd.method = method;
    metd.endpoint = endpoint;
    metd.options = Object.assign({}, RegistryImpl.defaultRequestOptions, options);
    clsd.methods[ property ] = metd;

    proto[ property ] = prepareRequest(clsd, property);
  }

  registerClass(baseUrl: string, constructor: Initialisable) {
    const clsd = this.getClassDescriptor(constructor.prototype);
    clsd.ctor = constructor;
    clsd.baseUrl = baseUrl;
  }

  registerBeforeFilter(proto: any, method: Function) {
    this.getClassDescriptor(proto).filtersBefore.push(method);
  }

  registerAfterFilter(proto: any, method: Function) {
    this.getClassDescriptor(proto).filtersAfter.push(method);
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
  return function (...args: any[]) {
    if (!clsd.methods.hasOwnProperty(property)) {
      throw new ReferenceError(`REST function "${property}" is not defined for ${clsd.ctor.name}.`);
    }

    const metd = clsd.methods[ property ];
    const request: RestRequest = {
      baseUrl: clsd.baseUrl,
      endpoint: metd.endpoint,
      method: metd.method,
      args: args,
      headers: {}
    };

    for (const filter of clsd.filtersBefore) {
      filter.call(this, request);
    }

    let response = RestClientInstance.request(request, metd.options.observe);
    for (const filter of clsd.filtersAfter) {
      response = filter.call(this, response);
    }

    return response;
  };
}

class ClassDescriptor {
  baseUrl: string;
  ctor: Function;
  methods: { [ key: string ]: MethodDescriptor } = {};
  filtersBefore: Function[] = [];
  filtersAfter: Function[] = [];

  constructor(public uid: number, public proto: Object) {
  }
}

class MethodDescriptor {
  method: string;
  endpoint: string;
  options: RequestOptions;
}

export interface Initialisable {
  new(...args: any[]);
}

export const Registry = new RegistryImpl();
