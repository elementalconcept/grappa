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

