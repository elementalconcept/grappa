import { UrlInput } from './url-input';
import { MethodDescriptor } from './method-descriptor';
import { FilterDescriptor } from './filter-descriptor';
import { HttpRestClient } from './http-rest-client';
import { CustomMetadata } from './custom-metadata';

export class ClassDescriptor {
  baseUrl: UrlInput;
  ctor: Function;
  methods: { [ key: string ]: MethodDescriptor } = {};
  customMetadata: { [ key: string ]: CustomMetadata } = {};
  filtersBefore: FilterDescriptor[] = [];
  filtersAfter: FilterDescriptor[] = [];

  restClient?: HttpRestClient<any>;

  constructor(public readonly uid: number,
              public readonly proto: Object) {
  }
}
