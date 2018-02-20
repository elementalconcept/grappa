# Grappa

Decorator-powered REST client for Angular 5 and its HttpClient.

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

















This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.6.4.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
