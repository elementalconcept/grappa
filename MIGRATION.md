# Migrating to `@elemental-concept/grappa` 21.0.0

This describes the changes you must make to client applications moving from `17.x` to `21.0.0`

## Summary

`21.0.0` rewrites Grappa's decorators (`@RestClient`, `@GET`/`@POST`/`@PUT`/`@PATCH`/`@DELETE`,
`@BeforeRequest`/`@AfterRequest`) from legacy (`experimentalDecorators`) TypeScript decorators to
TC39 **standard decorators**, and rewrites the internal `Registry` to key off each class's
`Symbol.metadata` object instead of a hand-rolled prototype `UID`. As a side effect, this also
fixes a bug where a subclass's `@BeforeRequest`/`@AfterRequest` filters leaked onto its base class, and meant you could not declare two methods with the same name in different subclasses.

It also adds a standalone `provideGrappa()` entry point alongside `GrappaModule`, and switches
`GrappaModule` from importing `HttpClientModule` to supplying `provideHttpClient()` internally.


## Required Changes

These are required — the package will not compile or will misbehave without them.

1. **Use TypeScript 5.2 or later.** Standard decorators require it.
2. **Set `"experimentalDecorators": false` (or remove the flag) everywhere your app compiles
   Grappa-decorated code** — e.g. `tsconfig.app.json` and `tsconfig.spec.json`, not just a shared
   root `tsconfig.json`. This is required project-wide: TypeScript cannot mix legacy and standard
   decorators in one compilation, and your own `@Component`/`@NgModule`/`@Injectable` classes are
   unaffected — Angular's `ngtsc` compiles those independently of this flag. Confirmed empirically
   against Angular 17: the demo app under `src/app` built and its Karma spec suite passed after
   flipping this flag in `src/tsconfig.app.json` and `src/tsconfig.spec.json`, with no source
   changes needed.
3. **No decorator call-site changes are needed.** `@RestClient('/api')`, `@GET('/things')`, etc.
   still take the same arguments as before. Only the *compiler mode* changed, not the public
   decorator API.
4. **Recompile and re-test any code that reaches into a decorated class's prototype directly**
   (undocumented but technically possible before). The new decorators use `context.metadata`
   (`Symbol.metadata`) instead of mutating `SomeClass.prototype`, so any such code will no longer
   find what it's looking for there.
5. **Bump the `@elemental-concept/grappa` version explicitly** in `package.json` — this is a
   major/breaking release.

6. If you use grappa-jwt, also bump it to
version `^21.0.0`

7. **Wrap any class decorator argument that references the class's own static members in an
   arrow function.** For example:

   ```ts
   // Before (legacy decorators) — worked fine:
   @Authenticate()
   @RestClient(SomeApiService.getApiUrl)
   export class SomeApiService { ... }

   // After (TC39 standard decorators) — must become:
   @Authenticate()
   @RestClient(() => SomeApiService.getApiUrl)
   export class SomeApiService { ... }
   ```

   Under TC39 semantics, the arguments to a class decorator are evaluated *before* the class
   binding itself is initialized, so referencing `SomeApiService` by name inside the decorator
   argument list now hits the temporal dead zone (`TS2449: Class 'SomeApiService' used before its
   declaration`). Deferring the reference behind a closure (`() => SomeApiService.getApiUrl`)
   defers evaluation until the decorator actually calls it, by which point the class binding is
   initialized. `@RestClient`'s `baseUrl` parameter already accepts a `UrlFactory`
   (`() => string`) alongside a plain string, so this requires no grappa changes — just wrap the
   self-reference at the call site. Any other decorator argument that self-references the class
   the same way needs the same treatment.

## Optional Improvements

Not required, but worth doing:

1. **Consider migrating `inject()`-based constructor DI** for consistency with current Angular
   idioms — purely stylistic, not a compatibility requirement.
   
2. **Add a regression test if you extend a Grappa-decorated class**, confirming a subclass's
   `@BeforeRequest`/`@AfterRequest` filters don't affect the base class (or siblings) — this is now
   correct behavior (see below), but worth locking in if your app relies on it.

3. **If you bootstrap via `bootstrapApplication` (standalone)**, use `provideGrappa()` in your
   `providers` array instead of importing `GrappaModule`. `GrappaModule` still works for
   NgModule-based apps.

4. **If you already call `provideHttpClient()` yourself**, that's fine to use alongside
   `provideGrappa()` / `GrappaModule` — both now supply `provideHttpClient()` internally. Angular
   resolves duplicate `HttpClient` provider registrations to whichever was registered last rather
   than throwing an error, so just double-check your own configuration (interceptors, fetch
   backend, etc.) still applies as expected.

## Troubleshooting

### `TS1240: Unable to resolve signature of property decorator when called as an expression`

If you forget step 2 above (`"experimentalDecorators": false`) in a tsconfig that compiles
Grappa-decorated code, TypeScript keeps interpreting `@GET`/`@POST`/etc. as legacy decorators and
fails to match their (now standard-decorator) signature. It looks like this:

```
Error: apps/example/src/app/api/services/example.service.ts:14:4 - error TS1240: Unable to resolve signature of property decorator when called as an expression.
  Argument of type 'ExampleService' is not assignable to parameter of type 'undefined'.

14   @POST('/some/endpoint')
      ~~~~~~~~~~~~~~~~~~~~
```

The type named in the second line will always be the enclosing class (here `ExampleService`) —
that's the tell that TypeScript is still in legacy decorator mode and passing the class
prototype/constructor where a standard decorator expects `undefined`.

**Fix:** set `"experimentalDecorators": false` (or remove the flag) in the tsconfig that reports
the error, and in any other tsconfig in the same project that compiles the same source (e.g. both
`tsconfig.app.json` and `tsconfig.spec.json`). Do not change the decorator call site — the fix is
compiler configuration only.

