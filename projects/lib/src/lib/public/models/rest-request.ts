import { UrlInput } from './url-input';
import { ClassDescriptor } from './class-descriptor';
import { MethodDescriptor } from './method-descriptor';

export interface RestRequest {
  baseUrl: UrlInput;
  endpoint: string;
  method: string;
  headers: { [ header: string ]: string };
  args: any[];
  emptyBody: boolean;
  classDescriptor: ClassDescriptor;
  methodDescriptor: MethodDescriptor;
  reportProgress?: boolean;

  params?: { [ param: string ]: string };
}
