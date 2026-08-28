import { instances } from '../instances/instances';

import {
  ClassDescriptor,
  FilterDescriptor,
  HttpRestClient,
  Initialisable,
  MethodDescriptor,
  ObserveOptions,
  OptionalList,
  RequestOptions,
  RestRequest,
  UrlInput
} from '../../public';

export class RegistryImpl {
  private static readonly defaultRequestOptions: RequestOptions = { observe: ObserveOptions.Body };

  private classes = new WeakMap<DecoratorMetadataObject, ClassDescriptor>();

  get defaultClient() {
    return instances.restClientInstance;
  }

  registerRequest = (method: string, endpoint: string, metadata: DecoratorMetadataObject, property: string | symbol, options: RequestOptions): Function => {
    const classDescriptor = this.getClassDescriptor(metadata);
    const propertyName = String(property);
    const methodDescriptor = new MethodDescriptor(propertyName);

    methodDescriptor.method = method;
    methodDescriptor.endpoint = endpoint;
    methodDescriptor.options = Object.assign({}, RegistryImpl.defaultRequestOptions, options);
    classDescriptor.methods[ propertyName ] = methodDescriptor;

    return prepareRequest(classDescriptor, propertyName);
  };

  registerClass = (baseUrl: UrlInput, constructor: Initialisable, metadata: DecoratorMetadataObject): void => {
    const classDescriptor = this.getClassDescriptor(metadata);

    classDescriptor.ctor = constructor;
    classDescriptor.baseUrl = baseUrl;
  };

  getCustomMetadata = (metadata: DecoratorMetadataObject, method: string, customKey: string) => {
    const classDescriptor = this.getClassDescriptor(metadata);

    return this.getCustomMetadataImpl(classDescriptor, method, customKey);
  };

  registerBeforeFilter = (metadata: DecoratorMetadataObject, method: Function, applyTo: OptionalList<string>) =>
    this.getClassDescriptor(metadata).filtersBefore.push({ filterFunction: method, applyTo });

  registerAfterFilter = (metadata: DecoratorMetadataObject, method: Function, applyTo: OptionalList<string>) =>
    this.getClassDescriptor(metadata).filtersAfter.push({ filterFunction: method, applyTo });

  // Every class that has at least one Grappa decorator applied receives its own distinct
  // `metadata` object (see the Symbol.metadata polyfill), so keying the WeakMap by that
  // object identity gives each class its own ClassDescriptor — a subclass never shares
  // (and therefore never mutates) its base class's filtersBefore/filtersAfter/methods.
  getClassDescriptor = (metadata: DecoratorMetadataObject): ClassDescriptor => {
    let classDescriptor = this.classes.get(metadata);

    if (classDescriptor === undefined) {
      classDescriptor = new ClassDescriptor(metadata);
      this.classes.set(metadata, classDescriptor);
    }

    return classDescriptor;
  };

  // used for Grappa-Cache
  registerAlternativeHttpClient = <T>(metadata: DecoratorMetadataObject, client: HttpRestClient<T>) =>
    this.getClassDescriptor(metadata).restClient = client;

  // used for Grappa-Cache
  putCustomMetadata = (metadata: DecoratorMetadataObject, method: string, customKey: string, data: any): void => {
    const classDescriptor = this.getClassDescriptor(metadata);

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
      methodDescriptor: method,
      reportProgress: method.options.reportProgress
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
