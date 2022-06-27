# Grappa

Decorator-powered REST client for **Angular 9+** and its HttpClient, plus **RxJs 6+**.

| Last version | Angular Versions       | Node |
|--------------|------------------------|------|
| `0.8.5`      | 9+ up to 14 (included) | 12   |

## 🛠 Installation

- With **npm**: `npm i --save @elemental-concept/grappa`
- With **Yarn**: `yarn add @elemental-concept/grappa`

Add `GrappaModule` to your main `AppModule` to imports section.

```typescript
@NgModule({
  declarations: [ ... ],
  imports: [
    ...,
    GrappaModule
  ],
  providers: [ ],
  bootstrap: [ ... ]
})
export class AppModule {
}
```

## 📖 Introduction

**Grappa** minimises boilerplate code required for REST clients and streamlines request and response modifications with filters. 
Simply define a list of methods which reflect REST API:

```typescript
@Injectable()
@RestClient('http://example.com/api/')
export class UserService {
  @GET('/users')
  list: () => Observable<User[]>;

  @GET('/users/{0}')
  find: (id: number) => Observable<User>;

  @PATCH('/users/{0}')
  update: (id: number, user: User) => Observable<User>;

  @POST('/users')
  create: (user: User) => Observable<User>;

  @PUT('/users/{0}')
  update: (id: number, user: User) => Observable<User>;
}
```

**Grappa** will auto-generate required class methods which can be easily called from any component:

```typescript
@Component({
  // ...
})
export class AppComponent {
  constructor(private userService: UserService) {
    userService.find(42).subscribe(user => console.log(user));
  }
}
```

Define `@BeforeRequest()` filter methods to uniformly modify data being sent to the API. 
A good example could be JWT injection, but we are covering that with a separate library
[Grappa JWT](https://github.com/elementalconcept/grappa-jwt)

Custom header injection is a good example:

```typescript
@Injectable()
@RestClient('http://example.com/api/')
export class UserService {
  // ...

  constructor(private authService: AuthService) {
  }

  @BeforeRequest()
  private customHeaders(request: RestRequest) {
    request.headers = {
      ...request.headers,
      'X-Xid': id,
      'X-Client-Id': clientId,
      'X-User-Id': userId,
    };
  }
}
```

Use `@AfterRequest()` to transform responses and inject global error handlers:

```typescript
@Injectable()
@RestClient('http://example.com/api/')
export class UserService {
  // ...

  @AfterRequest()
  tranformResponse(response: Observable<HttpResponse<any>>) {
    return response.map(item => User.fromResponse(item.body));
  }

  @AfterRequest()
  handleErrors(response: Observable<HttpResponse<any>>) {
    return response.catch(error => {
      alert('Error!');
      return Observable.of(error);
    });
  }
}
```

---

## API

Decorators on a class and its properties define how a request will be handled.

### `@RestClient(baseUrl: string = '')`

Optional decorator which allows to define base URL for all REST methods in a class. If decorator is not present
or `baseUrl` argument is empty string, `null` or `undefined`, then it is assumed that property decorators will contain
full URLs.

Example with `@RestClient`:

```typescript
@Injectable()
@RestClient('http://example.com/api/')
export class UserService {
  @GET('/users')
  list: () => Observable<User[]>; // List method will call http://example.com/api/users
}
```

Example without `@RestClient`:

```typescript
@Injectable()
export class UserService {
  @GET('http://somedomain.org/users')
  list: () => Observable<User[]>; // List method will call http://somedomain.org/users
}
```

---

### `@GET(endpoint: string, options: RequestOptions = {})`

Makes HTTP GET request to the specified end-point. Arguments passed to the decorated function can be inserted into
end-point URL using index based templates. Indices start at 0. Example:

```typescript
@GET('/users/{0}/posts?page={1}')
getUserPosts: (userId: number, page: number) => Observable<Post[]>;
```

`{0}` will be replaced with `userId` value and `{1}` will be replaced with `page` value.

---

### `@PATCH(endpoint: string, options: RequestOptions = {})`

Makes HTTP PATCH request to the specified end-point. Arguments passed to the decorated function can be inserted into
end-point URL using index based templates. Indices start at 0. Last function argument will be used as a PATCH body.

```typescript
@PATCH('/users/{0}', options: RequestOptions = {})
update: (userId: number, user: User) => Observable<User>;
```

---

### `@POST(endpoint: string, options: RequestOptions = {})`

Makes HTTP POST request to the specified end-point. Arguments passed to the decorated function can be inserted into
end-point URL using index based templates. Indices start at 0. Last function argument will be used as a POST body.

```typescript
@POST('/users')
create: (user: User) => Observable<User>;
```

---

### `@PUT(endpoint: string, options: RequestOptions = {})`

Makes HTTP PUT request to the specified end-point. Arguments passed to the decorated function can be inserted into
end-point URL using index based templates. Indices start at 0. Last function argument will be used as a PUT body.

```typescript
@PUT('/users/{0}', options: RequestOptions = {})
update: (userId: number.user: User) => Observable<User>;
```

---

### `@DELETE(endpoint: string, options: RequestOptions = {})`

Makes HTTP DELETE request to the specified end-point. Arguments passed to the decorated function can be inserted into
end-point URL using index based templates. Indices start at 0. Example:

```typescript
@DELETE('/users/{0}')
remove: (userId: number) => Observable<User>;
```

---

### `@BeforeRequest(applyTo: OptionalList<string> = null)`

Runs decorated method before every request in a class.

```typescript
@BeforeRequest()
beforeFilter(request: RestRequest) {
  request.headers[ 'X-Dummy' ] = 'Abcde';
}
```

---

### `@AfterRequest(applyTo: OptionalList<string> = null)`

Runs decorated method after every request in a class.

```typescript
@AfterRequest()
afterFilter(response: Observable<HttpResponse<any>>) {
  return response.map(r => r.body.value);
}
```

---

### RequestOptions

Configuration for specific *GET*, *POST*, *PATCH*, *PUT* and *DELETE* requests.

```typescript
export interface RequestOptions {
  observe?: ObserveOptions;
  query?: number | boolean;
  emptyBody?: boolean;
}

export enum ObserveOptions {
  Body = 'body',
  Response = 'response'
}
```

Given

```typescript
@GET('/users/{0}/posts?page={1}')
getUserPosts: (userId: number, page: number) => Observable<Post[]>;
```

you'll have `{1}` as the `page` attribute, but if instead you have multiple query params, the best approach is to have a
single object and then use the `query` option:

```typescript
@GET('/users/{0}/posts', { query: true })
getUserPosts: (userId: number, { page: number, search: string, sort: string, hideOutOfStock: boolean }) => Observable<Post[]>;
```

This way **Grappa** will translate the object into a list of query params, like this:

```typescript
`/users/{0}/posts?page=${ page }&search=${ search }&sort=${ sort }&hideOutOfStock=${ hideOutOfStock }`
```

If for any reason you need to send a `PUT` or a `POST` without a body (which is not a good practise), we added a new
flag `emptyBody`, that allow that. So you could send something like this:

```typescript
@PUT('/users/{0}', { emptyBody: true })
getUserPosts: (userId) => Observable<Post[]>;
```

If for any reason you need to send a `PUT` or a `POST` url params as well as query params as well body object,
you need to specify which arg index is the query params

```typescript
@PUT('/users/{0}', { query: 1 })
getUserPosts: (userId, queryParams: { name: string }, body: User) => Observable<Post[]>;
```

---

### OptionalList<string>

Allows to specify the names of request methods specific filter should apply.

```typescript
export type OptionalList<T> = T | T[] | null;
```

Usage:

```typescript
@GET('/users')
get: () => Observable<User[]>;

@POST('/users')
create: (user: User) => Observable<User>;

@BeforeRequest('create')
beforeFilter(request: RestRequest) {
  // This filter function will only apply to create() calls
}
```
