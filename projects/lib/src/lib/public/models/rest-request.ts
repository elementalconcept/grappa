import { UrlInput } from './url-input';
import { ClassDescriptor } from './class-descriptor';
import { MethodDescriptor } from './method-descriptor';

export interface RestRequest {
  baseUrl: UrlInput;
  endpoint: string;
  method: string;
  headers: { [ header: string ]: string; };
  params?: { [ param: string ]: string; };
  args: any[];
  classDescriptor: ClassDescriptor;
  methodDescriptor: MethodDescriptor;
}
