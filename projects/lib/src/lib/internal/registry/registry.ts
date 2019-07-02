import { UID } from '../uid/uid';
import { instances } from '../instances/instances';

import {
  ClassDescriptor,
  FilterDescriptor,
  Initialisable,
  MethodDescriptor,
  ObserveOptions,
  OptionalList,
  RequestOptions,
  RestRequest,
  UrlInput
} from '../../public/models';

export class RegistryImpl {
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

  registerClass(baseUrl: UrlInput, constructor: Initialisable) {
    const clsd = this.getClassDescriptor(constructor.prototype);
    clsd.ctor = constructor;
    clsd.baseUrl = baseUrl;
  }

  registerBeforeFilter(proto: any, method: Function, applyTo: OptionalList<string>) {
    this.getClassDescriptor(proto).filtersBefore.push({ filterFunction: method, applyTo: applyTo });
  }

  registerAfterFilter(proto: any, method: Function, applyTo: OptionalList<string>) {
    this.getClassDescriptor(proto).filtersAfter.push({ filterFunction: method, applyTo: applyTo });
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

    if (metd.options.hasOwnProperty('query')) {
      const idx = typeof metd.options.query === 'number' ? metd.options.query : args.length - 1;

      if (idx >= 0 && idx < args.length) {
        request.params = args[ idx ];
      }
    }

    for (const filter of clsd.filtersBefore) {
      if (isAppliable(filter, property)) {
        filter.filterFunction.call(this, request);
      }
    }

    let response = instances.restClientInstance.request(request, metd.options.observe);
    for (const filter of clsd.filtersAfter) {
      if (isAppliable(filter, property)) {
        response = filter.filterFunction.call(this, response);
      }
    }

    return response;
  };
}

function isAppliable(filter: FilterDescriptor, property: string) {
  if (filter.applyTo === null) {
    return true;
  }

  const nameList = typeof filter.applyTo === 'string' ? [ filter.applyTo ] : filter.applyTo;
  return nameList.indexOf(property) >= 0;
}

export const Registry = new RegistryImpl();
