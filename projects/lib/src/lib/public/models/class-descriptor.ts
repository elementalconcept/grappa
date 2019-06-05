import { UrlInput } from './url-input';
import { MethodDescriptor } from './method-descriptor';
import { FilterDescriptor } from './filter-descriptor';

export class ClassDescriptor {
  baseUrl: UrlInput;
  ctor: Function;
  methods: { [ key: string ]: MethodDescriptor } = {};
  filtersBefore: FilterDescriptor[] = [];
  filtersAfter: FilterDescriptor[] = [];

  constructor(public uid: number, public proto: Object) {
  }
}
