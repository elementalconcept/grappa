import { RestClientService } from '../rest-client/rest-client.service';

export const instances: Instances = {
  restClientInstance: null
};

export interface Instances {
  restClientInstance: RestClientService<any> | null;
}
