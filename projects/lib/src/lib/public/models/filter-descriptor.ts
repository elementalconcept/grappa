import { OptionalList } from './optional-list';

export interface FilterDescriptor {
  filterFunction: Function;
  applyTo: OptionalList<string>;
}
