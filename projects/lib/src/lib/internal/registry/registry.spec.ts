import '../symbol-metadata/symbol-metadata-polyfill';

import { BeforeRequest, DELETE, GET, PATCH, POST, PUT, RestClient } from '../../public/decorators';

import { Registry } from './registry';

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

class DerivedClient extends TestClient {
  @BeforeRequest()
  addAuthHeader(request: any) {
    request.headers.Authorization = 'Bearer token';
  }
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
    const metadata = (<any>TestClient)[ Symbol.metadata ];
    const classDescriptor = Registry.getClassDescriptor(metadata);

    expect(classDescriptor).toBeDefined();
    expect(classDescriptor.baseUrl).toBe('http://localhost/');
  });

  it('should not leak a subclass\'s @BeforeRequest filters onto its base class', () => {
    // eslint-disable-next-line no-unused-expressions
    new DerivedClient();

    const baseMetadata = (<any>TestClient)[ Symbol.metadata ];
    const derivedMetadata = (<any>DerivedClient)[ Symbol.metadata ];

    expect(baseMetadata).not.toBe(derivedMetadata);
    expect(Registry.getClassDescriptor(baseMetadata).filtersBefore.length).toBe(0);
    expect(Registry.getClassDescriptor(derivedMetadata).filtersBefore.length).toBe(1);
  });
});
