import { DELETE, GET, POST, RestClient } from '../../decorators';

@RestClient('http://localhost/')
class TestClient {
  @GET('/users/{0}')
  findUser: (id: number) => any;

  @POST('/users')
  createUser: (user: any) => any;

  @POST('/users/{0}')
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
});
