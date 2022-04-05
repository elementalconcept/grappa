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
} from '../../public';
import { HttpRestClient } from 'lib';

export class RegistryImpl {
  private static readonly defaultRequestOptions: RequestOptions = { observe: ObserveOptions.Body };

  private classes: { [ key: string ]: ClassDescriptor } = {};

  get defaultClient() {
    return instances.restClientInstance;
  }

  registerRequest = (method: string, endpoint: string, proto: any, property: string, options: RequestOptions): void => {
    const classDescriptor = this.getClassDescriptor(proto);
    const methodDescriptor = new MethodDescriptor(property);

    methodDescriptor.method = method;
    methodDescriptor.endpoint = endpoint;
    methodDescriptor.options = Object.assign({}, RegistryImpl.defaultRequestOptions, options);
    classDescriptor.methods[ property ] = methodDescriptor;

    proto[ property ] = prepareRequest(classDescriptor, property);
  };

  registerClass = (baseUrl: UrlInput, constructor: Initialisable): void => {
    const classDescriptor = this.getClassDescriptor(constructor.prototype);

    classDescriptor.ctor = constructor;
    classDescriptor.baseUrl = baseUrl;
  };

  getCustomMetadata = (proto: any, method: string, customKey: string) => {
    const classDescriptor = this.getClassDescriptor(proto);

    return this.getCustomMetadataImpl(classDescriptor, method, customKey);
  };

  registerBeforeFilter = (proto: any, method: Function, applyTo: OptionalList<string>) =>
    this.getClassDescriptor(proto).filtersBefore.push({ filterFunction: method, applyTo });

  registerAfterFilter = (proto: any, method: Function, applyTo: OptionalList<string>) =>
    this.getClassDescriptor(proto).filtersAfter.push({ filterFunction: method, applyTo });

  getClassDescriptor = (proto: any): ClassDescriptor => {
    const uid = UID(proto);

    let classDescriptor = this.classes[ uid ];

    if (classDescriptor === undefined) {
      classDescriptor = new ClassDescriptor(uid, proto);
      this.classes[ uid ] = classDescriptor;
    }

    return classDescriptor;
  };

  // used for Grappa-Cache
  registerAlternativeHttpClient = <T>(proto: any, client: HttpRestClient<T>) =>
    this.getClassDescriptor(proto).restClient = client;

  // used for Grappa-Cache
  putCustomMetadata = (proto: any, method: string, customKey: string, data: any): void => {
    const classDescriptor = this.getClassDescriptor(proto);

    if (!classDescriptor.customMetadata.hasOwnProperty(method)) {
      classDescriptor.customMetadata[ method ] = {};
    }

    classDescriptor.customMetadata[ method ][ customKey ] = data;
  };

  // used for Grappa-Cache
  getCustomMetadataForDescriptor = (classDescriptor: ClassDescriptor, method: MethodDescriptor, customKey: string) =>
    this.getCustomMetadataImpl(classDescriptor, method.name, customKey);

  private getCustomMetadataImpl = (classDescriptor: ClassDescriptor, methodNAme: string, customKey: string) =>
    classDescriptor.customMetadata.hasOwnProperty(methodNAme)
    && classDescriptor.customMetadata[ methodNAme ].hasOwnProperty(customKey)
      ? classDescriptor.customMetadata[ methodNAme ][ customKey ]
      : null;
}

function prepareRequest(classDescriptor: ClassDescriptor, property: string) {
  // eslint-disable-next-line space-before-function-paren
  return function (...args: any[]) {
    if (!classDescriptor.methods.hasOwnProperty(property)) {
      throw new ReferenceError(`REST function "${ property }" is not defined for ${ classDescriptor.ctor.name }.`);
    }

    const method = classDescriptor.methods[ property ];
    const request: RestRequest = {
      baseUrl: classDescriptor.baseUrl,
      endpoint: method.endpoint,
      method: method.method,
      args,
      headers: {},
      emptyBody: false,
      classDescriptor,
      methodDescriptor: method
    };

    if (method.options.hasOwnProperty('query')) {
      const idx = typeof method.options.query === 'number' ? method.options.query : args.length - 1;

      if (idx >= 0 && idx < args.length) {
        request.params = args[ idx ];
      }
    }

    if (method.options.hasOwnProperty('emptyBody')) {
      request.emptyBody = true;
    }

    for (const filter of classDescriptor.filtersBefore) {
      if (isApplicable(filter, property)) {
        filter.filterFunction.call(this, request);
      }
    }

    const restClient = classDescriptor.restClient instanceof Object
      ? classDescriptor.restClient
      : instances.restClientInstance;

    let response = restClient.request(request, method.options.observe);

    for (const filter of classDescriptor.filtersAfter) {
      if (isApplicable(filter, property)) {
        response = filter.filterFunction.call(this, response);
      }
    }

    return response;
  };
}

function isApplicable(filter: FilterDescriptor, property: string) {
  if (filter.applyTo === null) {
    return true;
  }

  const nameList = typeof filter.applyTo === 'string' ? [ filter.applyTo ] : filter.applyTo;

  return nameList.indexOf(property) >= 0;
}

export const Registry = new RegistryImpl();
