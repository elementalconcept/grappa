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

  // baseUrl and restClient are registered once, at the class that declares them, and are
  // meant to apply to the whole subtree below it — so a subclass without its own
  // @RestClient (and therefore its own empty ClassDescriptor) still needs to find them by
  // walking up the metadata prototype chain, which mirrors the actual class hierarchy.
  private resolveInherited = <T>(metadata: DecoratorMetadataObject, select: (descriptor: ClassDescriptor) => T | undefined): T | undefined => {
    for (let current: DecoratorMetadataObject | null = metadata; current; current = Object.getPrototypeOf(current)) {
      const descriptor = this.classes.get(current);
      const value = descriptor && select(descriptor);

      if (value !== undefined) {
        return value;
      }
    }

    return undefined;
  };

  resolveBaseUrl = (metadata: DecoratorMetadataObject): UrlInput | undefined =>
    this.resolveInherited(metadata, descriptor => descriptor.baseUrl);

  resolveRestClient = <T>(metadata: DecoratorMetadataObject): HttpRestClient<T> | undefined =>
    this.resolveInherited(metadata, descriptor => descriptor.restClient);

  // filtersBefore/filtersAfter are also registered per declaring class, but every ancestor's
  // filters must run — a subclass filter isn't a replacement for its base class's filters.
  // Ordering: a class's @RestClient is the only place it can install a filter that runs
  // outside the chain (by overriding restClient), and that escape hatch only lets a class
  // run *later* (closer to the actual dispatch), never earlier. So the default has to give
  // the most-derived class the "runs first" slot, since it has no other way to get it:
  // filtersBefore run child-to-base, filtersAfter run base-to-child.
  resolveFiltersBefore = (metadata: DecoratorMetadataObject): FilterDescriptor[] => {
    const result: FilterDescriptor[] = [];

    for (let current: DecoratorMetadataObject | null = metadata; current; current = Object.getPrototypeOf(current)) {
      const descriptor = this.classes.get(current);

      if (descriptor) {
        result.push(...descriptor.filtersBefore);
      }
    }

    return result;
  };

  resolveFiltersAfter = (metadata: DecoratorMetadataObject): FilterDescriptor[] => {
    const chain: DecoratorMetadataObject[] = [];

    for (let current: DecoratorMetadataObject | null = metadata; current; current = Object.getPrototypeOf(current)) {
      chain.push(current);
    }

    const result: FilterDescriptor[] = [];

    for (const entry of chain.reverse()) {
      const descriptor = this.classes.get(entry);

      if (descriptor) {
        result.push(...descriptor.filtersAfter);
      }
    }

    return result;
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
      throw new ReferenceError(`REST function "${ property }" is not defined for ${ this.constructor.name }.`);
    }

    const method = classDescriptor.methods[ property ];
    const request: RestRequest = {
      baseUrl: Registry.resolveBaseUrl(classDescriptor.metadata),
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

    for (const filter of Registry.resolveFiltersBefore(classDescriptor.metadata)) {
      if (isApplicable(filter, property)) {
        filter.filterFunction.call(this, request);
      }
    }

    const restClient = Registry.resolveRestClient(classDescriptor.metadata) ?? instances.restClientInstance;

    let response = restClient.request(request, method.options.observe);

    for (const filter of Registry.resolveFiltersAfter(classDescriptor.metadata)) {
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
