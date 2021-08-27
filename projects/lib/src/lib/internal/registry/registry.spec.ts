import { DELETE, GET, PATCH, POST, PUT, RestClient } from '../../public/decorators';
import { Registry } from './registry';
import { UID } from '../uid/uid';

@RestClient('http://localhost/')
class TestClient {
  @GET('/users/{0}')
  findUser: (id: number) => any;

  @PATCH('/users/{0}')
  patchUser: (id: number, user: any) => any;

  @POST('/users')
  createUser: (user: any) => any;

  @PUT('/users/{0}')
  updateUser: (id: number, user: any) => any;

  @DELETE('/users/{0}')
  deleteUser: (id: number) => any;
}

describe('Registry', () => {
  it('should inject REST functions', () => {
    const testClient = new TestClient();

    expect(typeof testClient.findUser).toBe('function');
    expect(typeof testClient.createUser).toBe('function');
    expect(typeof testClient.updateUser).toBe('function');
    expect(typeof testClient.deleteUser).toBe('function');
  });

  it('should define base URL through @RestClient', () => {
    const uid = UID(TestClient.prototype);
    expect((<any>Registry).classes[ uid ]).toBeDefined();
    expect((<any>Registry).classes[ uid ].baseUrl).toBe('http://localhost/');
  });
});
