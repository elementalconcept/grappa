import { UID } from '../uid/uid';
import { instances } from '../instances/instances';

import {
  ClassDescriptor,
  FilterDescriptor, HttpRestClient,
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
    const metd = new MethodDescriptor(property);
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

  registerAlternativeHttpClient<T>(proto: any, client: HttpRestClient<T>) {
    this.getClassDescriptor(proto).restClient = client;
  }

  putCustomMetadata(proto: any, method: string, customKey: string, data: any) {
    const clsd = this.getClassDescriptor(proto);

    if (!clsd.customMetadata.hasOwnProperty(method)) {
      clsd.customMetadata[ method ] = {};
    }

    clsd.customMetadata[ method ][ customKey ] = data;
  }

  getCustomMetadata(proto: any, method: string, customKey: string) {
    const clsd = this.getClassDescriptor(proto);

    if (clsd.customMetadata.hasOwnProperty(method) && clsd.customMetadata[ method ].hasOwnProperty(customKey)) {
      return clsd.customMetadata[ method ][ customKey ];
    }

    return null;
  }

  getCustomMetadataForDescriptor(clsd: ClassDescriptor, method: MethodDescriptor, customKey: string) {
    if (clsd.customMetadata.hasOwnProperty(method.name) && clsd.customMetadata[ method.name ].hasOwnProperty(customKey)) {
      return clsd.customMetadata[ method.name ][ customKey ];
    }

    return null;
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

  get defaultClient() {
    return instances.restClientInstance;
  }
}

function prepareRequest(clsd: ClassDescriptor, property: string) {
  return function (...args: any[]) {
    if (!clsd.methods.hasOwnProperty(property)) {
      throw new ReferenceError(`REST function "${property}" is not defined for ${clsd.ctor.name}.`);
    }

    const method = clsd.methods[ property ];
    const request: RestRequest = {
      baseUrl: clsd.baseUrl,
      endpoint: method.endpoint,
      method: method.method,
      args: args,
      headers: {},
      classDescriptor: clsd,
      methodDescriptor: method
    };

    if (method.options.hasOwnProperty('query')) {
      const idx = typeof method.options.query === 'number' ? method.options.query : args.length - 1;

      if (idx >= 0 && idx < args.length) {
        request.params = args[ idx ];
      }
    }

    for (const filter of clsd.filtersBefore) {
      if (isAppliable(filter, property)) {
        filter.filterFunction.call(this, request);
      }
    }

    const restClient = clsd.restClient instanceof Object ? clsd.restClient : instances.restClientInstance;
    let response = restClient.request(request, method.options.observe);

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
