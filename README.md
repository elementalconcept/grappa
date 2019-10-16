# Grappa

Decorator-powered REST client for Angular 5 and its HttpClient.

## Installation

With npm:

```Shell
$ npm i --save @elemental-concept/grappa
```

With Yarn:

```Shell
$ yarn add @elemental-concept/grappa
```

Add `GrappaModule` to your main `AppModule` to `imports` section.

## Introduction

Grappa minimises boiler-plate code required for REST clients and streamlines request and response
modifications with filters. Simply define a list of methods which reflect REST API:

```javascript
@Injectable()
@RestClient('http://example.com/api/')
export class UserService {
  @GET('/users')
  list: () => Observable<User[]>;

  @GET('/users/{0}')
  find: (id: number) => Observable<User>;

  @POST('/users')
  create: (user: User) => Observable<User>;

  @PUT('/users/{0}')
  update: (id: number, user: User) => Observable<User>;
}
```

Grappa will auto-generate required class methods which can be easily called from any component:

```javascript
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
JWT injection is a good example: 

```javascript
@Injectable()
@RestClient('http://example.com/api/')
export class UserService {
  // ...

  constructor(private authService: AuthService) {}

  @BeforeRequest()
  jwtFilter(request: RestRequest) {
    request.headers[ 'Authorization' ] = this.authService.getJWT();
  }
}
```

Use `@AfterRequest()` to transform responses and inject global error handlers:

```javascript
@Injectable()
@RestClient('http://example.com/api/')
export class UserService {
  // ...

  @AfterRequest()
  tranformResponse(response: Observable<HttpResponse<any>>) {
    return response.map(r => User.fromResponse(r.body));
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

## API

Decorators on a class and its properties define how a request will be handled.

### `@RestClient(baseUrl: string = '')`

Optional decorator which allows to define base URL for all REST methods in a class.
If decorator is not present or `baseUrl` argument is empty string, `null` or `undefined`,
then it is assumed that property decorators will contain full URLs.

Example with `@RestClient`:

```javascript
@Injectable()
@RestClient('http://example.com/api/')
export class UserService {
  @GET('/users')
  list: () => Observable<User[]>; // List method will call http://example.com/api/users
}
```

Example without `@RestClient`:

```javascript
@Injectable()
export class UserService {
  @GET('http://somedomain.org/users')
  list: () => Observable<User[]>; // List method will call http://somedomain.org/users
}
```

### `@GET(endpoint: string, options: RequestOptions = {})`

Makes HTTP GET request to the specified end-point. Arguments passed to the decorated function can be
inserted into end-point URL using index based templates. Indices start at 0. Example:

```javascript
@GET('/users/{0}/posts?page={1}')
getUserPosts: (userId: number, page: number) => Observable<Post[]>;
```

`{0}` will be replaced with `userId` value and `{1}` will be replaced with `page` value.

### `@POST(endpoint: string, options: RequestOptions = {})`

Makes HTTP POST request to the specified end-point. Arguments passed to the decorated function can be
inserted into end-point URL using index based templates. Indices start at 0. Last function argument will be used
as a POST body. 

```javascript
@POST('/users')
create: (user: User) => Observable<User>;
```

### `@PUT(endpoint: string, options: RequestOptions = {})`

Makes HTTP PUT request to the specified end-point. Arguments passed to the decorated function can be
inserted into end-point URL using index based templates. Indices start at 0. Last function argument will be used
as a PUT body. 

```javascript
@PUT('/users/{0}', options: RequestOptions = {})
update: (userId: number. user: User) => Observable<User>;
```

### `@DELETE(endpoint: string, options: RequestOptions = {})`

Makes HTTP DELETE request to the specified end-point. Arguments passed to the decorated function can be
inserted into end-point URL using index based templates. Indices start at 0. Example:

```javascript
@DELETE('/users/{0}')
remove: (userId: number) => Observable<User>;
```

### `@BeforeRequest(applyTo: OptionalList<string> = null)`

Runs decorated method before every request in a class.

```javascript
@BeforeRequest()
beforeFilter(request: RestRequest) {
  request.headers[ 'X-Dummy' ] = 'Abcde';
}
```

### `@AfterRequest(applyTo: OptionalList<string> = null)`

Runs decorated method after every request in a class.

```javascript
@AfterRequest()
afterFilter(response: Observable<HttpResponse<any>>) {
  return response.map(r => r.body.value);
}
```

### RequestOptions

Configuration for specific GET, POST, PUT and DELETE requests.

```javascript
export interface RequestOptions {
  observe?: ObserveOptions;
}

export enum ObserveOptions {
  Body = 'body',
  Response = 'response'
}
```

### OptionalList<string>

Allows to specify the names of request methods specific filter should apply.

```javascript
export type OptionalList<T> = T | T[] | null;
```

Usage:

```javascript
@GET('/users')
get: () => Observable<User[]>;

@POST('/users')
create: (user: User) => Observable<User>;

@BeforeRequest('create')
beforeFilter(request: RestRequest) {
  // This filter function will only apply to create() calls
}
```
