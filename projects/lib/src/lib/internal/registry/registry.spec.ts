import '../symbol-metadata/symbol-metadata-polyfill';

import { AfterRequest, BeforeRequest, DELETE, GET, PATCH, POST, PUT, RestClient } from '../../public/decorators';

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

@RestClient('http://grandparent/')
class GrandparentClient {
  @BeforeRequest()
  grandparentBefore() { /* noop */ }

  @AfterRequest()
  grandparentAfter() { /* noop */ }

  @GET('/ping')
  ping: () => any;
}

class ParentClient extends GrandparentClient {
  @BeforeRequest()
  parentBefore() { /* noop */ }

  @AfterRequest()
  parentAfter() { /* noop */ }

  @GET('/parent-ping')
  parentPing: () => any;
}

class ChildClient extends ParentClient {
  @BeforeRequest()
  childBefore() { /* noop */ }

  @AfterRequest()
  childAfter() { /* noop */ }

  @GET('/child-ping')
  childPing: () => any;
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

  it('should resolve baseUrl for a subclass that declares no @RestClient of its own', () => {
    // eslint-disable-next-line no-unused-expressions
    new DerivedClient();

    const derivedMetadata = (<any>DerivedClient)[ Symbol.metadata ];

    expect(Registry.resolveBaseUrl(derivedMetadata)).toBe('http://localhost/');
  });

  it('should run @BeforeRequest filters most-derived-first', () => {
    // eslint-disable-next-line no-unused-expressions
    new ChildClient();

    const childMetadata = (<any>ChildClient)[ Symbol.metadata ];
    const names = Registry.resolveFiltersBefore(childMetadata).map(f => f.filterFunction.name);

    expect(names).toEqual([ 'childBefore', 'parentBefore', 'grandparentBefore' ]);
  });

  it('should run @AfterRequest filters base-first', () => {
    // eslint-disable-next-line no-unused-expressions
    new ChildClient();

    const childMetadata = (<any>ChildClient)[ Symbol.metadata ];
    const names = Registry.resolveFiltersAfter(childMetadata).map(f => f.filterFunction.name);

    expect(names).toEqual([ 'grandparentAfter', 'parentAfter', 'childAfter' ]);
  });
});
