import { UrlInput } from '../registry/registry';

export interface RestRequest {
  baseUrl: UrlInput;
  endpoint: string;
  method: string;
  headers: { [ header: string ]: string; };
  params?: { [ param: string ]: string; };
  args: any[];
}
