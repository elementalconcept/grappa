# Angular Compatibility — @elemental-concept/grappa library

Scope: `projects/lib` only (the code packaged and published as the `@elemental-concept/grappa` npm package). The demo app under `src/app` is excluded — it is not shipped.

Current baseline: Angular 17.0.8 (`package.json`), library declares peer support for Angular `>= 13 < 18` (`projects/lib/package.json:20-23`).

## Summary

**Confirmed in production use on Angular 21 with no reported problems.** This matches expectations from the code review: nothing in the library touches an API that is actually deprecated-and-removed as of Angular 17-21. `NgModule`, `HttpClientModule`, constructor DI, and `experimentalDecorators`-based custom decorators all still work end-to-end on Angular 21 — Angular has not removed any of them, and TypeScript still supports `experimentalDecorators` alongside the newer standard-decorators mode.

The `@angular/core`/`@angular/common` peer range (`>= 13 < 18`, `projects/lib/package.json:20-23`) is therefore stricter than reality: it is a stale declaration, not a real compatibility ceiling. It should be widened to reflect that Angular 18-21 are confirmed working, otherwise consumers on those versions must override peer-dependency resolution (`--legacy-peer-deps`/`--force`) to install the package at all.

The remaining items below are about future-proofing, not present-day breakage — specifically the two changes below (TC39 standard decorators, `provideHttpClient()`) are the ones worth doing proactively before a future Angular/TypeScript release removes the legacy paths outright.

## Findings

### 1. `@NgModule`-based module, no standalone API
`grappa.module.ts:9` declares `GrappaModule` via `@NgModule({ declarations: [], imports: [CommonModule, HttpClientModule], exports: [] })`. There is no standalone equivalent (no exported providers function such as `provideGrappa()`).

- File: `projects/lib/src/lib/grappa.module.ts:9`
- Risk: NgModules remain supported in Angular 17, but consumers who have moved to a fully standalone bootstrap still need an `NgModule` import to use this library. Not deprecated, but not aligned with where new Angular apps are heading.

### 2. `HttpClientModule` instead of `provideHttpClient()`
- File: `projects/lib/src/lib/grappa.module.ts:3,11`
- `HttpClientModule` is still valid in Angular 17 but is being superseded by the functional `provideHttpClient()` provider API. A library that imports `HttpClientModule` internally forces that module into any consuming app's injector graph even if the app itself has already migrated to `provideHttpClient()`.

### 3. Constructor-based dependency injection only
- `projects/lib/src/lib/grappa.module.ts:15` — `constructor(restClient: RestClientService<any>)`
- `projects/lib/src/lib/internal/rest-client/rest-client.service.ts:10` — `constructor(private readonly http: HttpClient)`
- No use of the `inject()` function anywhere in the library. Constructor DI is not deprecated, but the library's DI approach is fully decorator/reflection-based (see next point), which is the part most exposed to future Angular/TypeScript decorator changes.

### 4. `@Injectable({ providedIn: 'root' })`
- `projects/lib/src/lib/internal/rest-client/rest-client.service.ts:8`
- This is current, non-deprecated style — no concern here.

### 5. Library's own custom decorators rely on legacy (`experimentalDecorators`) TypeScript semantics
This is the most relevant risk for the "decorators deprecated" concern, and it is **not** an Angular framework API — it's the library's core feature. `grappa` implements its own class and method decorators to describe REST clients:

- `projects/lib/src/lib/public/decorators/rest-client.ts:4-8` — `RestClient()` is a class decorator: `(constructor: Initialisable) => { Registry.registerClass(...) }`
- `projects/lib/src/lib/public/decorators/get.ts:4-8`, `post.ts`, `put.ts`, `patch.ts`, `delete.ts` — each is a method decorator using the legacy two-argument signature `(target: any, property: string) => {...}`
- `projects/lib/src/lib/public/decorators/before-request.ts`, `after-request.ts` — same pattern

These decorators are written against TypeScript's **legacy/experimental decorators** proposal, enabled via `experimentalDecorators: true` in `projects/lib/tsconfig.lib.json:11`. TypeScript 5.0+ and TC39 now ship **standard decorators** (stage-3 spec), which have a different runtime signature (context object instead of a bare property-name string) and are what Angular itself has been migrating toward internally. If a consuming application's TypeScript configuration ever drops `experimentalDecorators` (or a future Angular major requires standard decorators project-wide), grappa's decorators as currently written would not compile/run without a rewrite of their signatures.

- Risk: this is a real forward-compatibility exposure — more so than anything Angular-specific — since the whole library surface (`@RestClient`, `@GET`, `@POST`, etc.) is built on the older decorator model.

### 6. Peer dependency range hard-caps Angular support below v18
- `projects/lib/package.json:20-23`:
  ```
  "@angular/common": ">= 13 < 18",
  "@angular/core": ">= 13 < 18",
  "rxjs": ">= 6.0.0 < 8"
  ```
- Even though nothing in the code is known to break on Angular 18+, npm/yarn peer-dependency resolution will reject or warn on any consumer running Angular 18 or later unless they override with `--legacy-peer-deps`/`--force`. This range needs to be widened (and actually verified against 18/19/20) before consumers on newer Angular can adopt the package cleanly.

### 7. Build/tooling configuration
- `projects/lib/tsconfig.lib.json:11` — `experimentalDecorators: true` (required for both Angular's own decorators and the library's custom ones; still supported in TS 5.2 as used here, but is legacy going forward)
- `projects/lib/ng-package.json` — built with `ng-packagr`, standard for Angular libraries; no concerns found here specifically.

## What was checked and found clean
- No `@angular/http` (pre-`HttpClient`, fully removed pre-v13) — not present.
- No `ViewEngine`-only APIs, `entryComponents`, `ANALYZE_FOR_ENTRY_COMPONENTS`, or `Renderer` (v1) — not present.
- No deprecated RxJS call patterns (`.toPromise()`, positional multi-arg `.subscribe()`) — not present.
- No `*ngIf`/`*ngFor`/template control-flow in the library (it ships no components — it's a service/decorator library with no templates).

## Recommendations, in priority order
1. Widen and publish the `@angular/core`/`@angular/common` peer range to include 18-21 now that it's confirmed working (e.g. `>= 13 < 22`), so consumers don't need `--legacy-peer-deps` to install.
2. Migrate `provideHttpClient()` (see migration steps below) — low effort, removes a legacy module dependency from the library's DI graph.
3. Migrate the custom decorators (`RestClient`, `GET`/`POST`/`PUT`/`PATCH`/`DELETE`, `BeforeRequest`/`AfterRequest`) to the TC39 standard decorators signature (see migration steps below). Highest effort, since it touches the library's entire public API surface and its internal `Registry`, but it's the item most likely to eventually stop working if a consumer's tooling drops `experimentalDecorators` support.
4. Optionally migrate internal constructor DI to `inject()` for consistency with current Angular idioms — lower priority, purely stylistic, not a compatibility risk today.

## Migration steps: `HttpClientModule` → `provideHttpClient()`

Goal: stop forcing `HttpClientModule` into every consumer's injector graph, so apps that have already migrated to the standalone `provideHttpClient()` API aren't carrying a redundant legacy module.

1. In `projects/lib/src/lib/grappa.module.ts`, drop the `HttpClientModule` import and add a `providers` array to the `@NgModule` decorator instead:
   ```ts
   import { NgModule } from '@angular/core';
   import { CommonModule } from '@angular/common';
   import { provideHttpClient } from '@angular/common/http';

   @NgModule({
     declarations: [],
     imports: [CommonModule],
     providers: [provideHttpClient()],
     exports: []
   })
   export class GrappaModule {
     constructor(restClient: RestClientService<any>) {
       instances.restClientInstance = restClient;
     }
   }
   ```
   This keeps `GrappaModule` working for `imports: [GrappaModule]`-style consumers without pulling in `HttpClientModule`.
2. **Watch for duplicate `HttpClient` providers.** If a consuming app also calls `provideHttpClient()` itself (standalone bootstrap) *and* imports `GrappaModule`, Angular's DI will just use the last-registered provider — not an error, but confirm interceptors configured via one call site aren't silently shadowed by the other. Document this in the library's README.
3. Add a standalone-friendly entry point alongside the module, e.g. a `provideGrappa()` function in a new `projects/lib/src/lib/provide-grappa.ts`:
   ```ts
   import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
   import { provideHttpClient } from '@angular/common/http';
   import { RestClientService } from './internal/rest-client/rest-client.service';
   import { instances } from './internal/instances/instances';

   export function provideGrappa(): EnvironmentProviders {
     return makeEnvironmentProviders([
       provideHttpClient(),
       {
         provide: RestClientService,
         useFactory: (client: RestClientService<any>) => {
           instances.restClientInstance = client;
           return client;
         },
         deps: [RestClientService]
       }
     ]);
   }
   ```
   Export it from `projects/lib/src/public_api.ts` so standalone consumers can call `providers: [provideGrappa()]` in `bootstrapApplication` instead of importing `GrappaModule`. Keep `GrappaModule` for NgModule-based consumers — deprecate it with a JSDoc `@deprecated` pointing at `provideGrappa()` rather than removing it, since removing it would be a breaking change.
4. Update `README.md` / `projects/lib/README.md` usage examples to show both the standalone (`provideGrappa()`) and NgModule (`GrappaModule`) setup paths.
5. Re-run the library's test suite (`ng test`) and manually verify a request round-trip in a standalone-bootstrap sample app, since `instances.restClientInstance` assignment currently happens in `GrappaModule`'s constructor — confirm the `provideGrappa()` factory path sets it just as reliably before any `@RestClient`-decorated class issues a request.

## Known bug to fix during the Registry rewrite: subclasses share their base class's `filtersBefore`/`filtersAfter` arrays

A concern was raised that `@BeforeRequest`/`@AfterRequest` need to deep-clone their filter arrays when a class is extended, otherwise a derived class applying `@BeforeRequest` mutates the base class's filter list too. This checks out — it's a real, currently-unfixed bug — but the root cause is one level deeper than "the arrays need cloning," which matters for how it should be fixed.

**Root cause**: `internal/uid/uid.ts:4-14` assigns a class identity by checking `o[uidKey] === undefined` — a bracket-notation read, which walks the prototype chain, not just the object's own properties. When `class Derived extends Base` and `Base.prototype` already has its own `__GRAPPA_UID` (because `Base` was decorated with `@RestClient`, `@GET`, `@BeforeRequest`, etc. at some point), then `UID(Derived.prototype)` finds the *inherited* value from `Base.prototype` and returns it as-is, instead of assigning `Derived.prototype` a UID of its own. `Registry.getClassDescriptor` (`internal/registry/registry.ts:58-69`) then looks up `this.classes[uid]` using that shared id and hands back the exact same `ClassDescriptor` instance for both `Base` and `Derived`.

From there, `registerBeforeFilter`/`registerAfterFilter` (`registry.ts:52-56`) call `.push()` directly on `classDescriptor.filtersBefore`/`filtersAfter` — so `@BeforeRequest` on `Derived` pushes into the identical array object `Base` (and any other sibling subclass) also reads from. The same sharing affects `classDescriptor.methods` and `classDescriptor.customMetadata` too, since they all live on the one shared `ClassDescriptor` — filters are simply the most visibly broken because `.push()` is an in-place mutation, whereas `methods`/`customMetadata` being shared is comparatively harmless as long as subclasses don't redeclare a method name the base already used.

**Repro sketch**:
```ts
@RestClient('http://localhost/')
class Base {
  @GET('/things') getThings: () => any;
}

class Derived extends Base {
  @BeforeRequest()
  addAuthHeader(request: RestRequest) { /* ... */ }
}

new Derived();          // registers addAuthHeader as a before-filter
new Base().getThings(); // now ALSO runs addAuthHeader — Base never opted into it
```

**Why "deep clone the arrays" is close but not quite the fix**: `FilterDescriptor` (`public/models/filter-descriptor.ts`) is a plain `{ filterFunction, applyTo }` record that's never mutated in place once created — only the *array* holding them is mutated (via `.push`). So a full deep clone of each `FilterDescriptor` isn't necessary; what's needed is that each class gets its **own array reference** (a shallow copy is sufficient: `[...parentDescriptor.filtersBefore]`), and — since the underlying identity bug affects `methods`/`customMetadata` too — really each class should get its **own `ClassDescriptor`** rather than only patching the two filter arrays.

**Recommended fix** (best done alongside the Registry rewrite below, since both touch the same code):
1. Fix `UID`/`getClassDescriptor` to distinguish "this prototype has never been seen" from "an ancestor prototype has been seen" — e.g. use `Object.prototype.hasOwnProperty.call(o, uidKey)` instead of `o[uidKey] === undefined`, so each prototype in a chain gets its own id even when a base class already has one.
2. When a subclass's `ClassDescriptor` is created for the first time, initialize it from its base class's descriptor if one exists (walk `Object.getPrototypeOf(proto)` and copy `baseUrl`, and **shallow-copy** `filtersBefore`/`filtersAfter` into new arrays, and copy `methods`/`customMetadata` into new objects) so the derived class starts with everything the base class defined, but any subsequent `.push()`/assignment on the derived class's descriptor no longer reaches back into the base class's descriptor.
3. Add a regression test extending the existing `registry.spec.ts` `TestClient` fixture with a subclass that adds its own `@BeforeRequest`, and assert the base class's filter list is unaffected.
4. This is independent of the Angular/TC39 work above and worth fixing regardless of decorator migration timing, but since the TC39 rewrite already changes how `Registry` keys its descriptors (moving off `UID`/prototype-keying to `context.metadata`-keying), the inheritance-copying behavior above should be built into the *new* keying scheme from the start rather than retrofitted onto the old `UID` approach and then migrated a second time.

## Migration steps: legacy `experimentalDecorators` → TC39 standard decorators

Goal: make `RestClient`, `GET`/`POST`/`PUT`/`PATCH`/`DELETE`, and `BeforeRequest`/`AfterRequest` work under TypeScript's standard (stage-3) decorators, which use a different call signature and no longer hand the decorator a reference to the class prototype.

Key signature differences to design around:
- Class decorators go from `(constructor) => void | Function` to `(value: Function, context: ClassDecoratorContext) => void | Function`.
- Method decorators go from `(target: any, propertyKey: string) => void` to `(value: Function, context: ClassMethodDecoratorContext) => void | Function`. There is **no `target`/prototype argument** — you get the method itself (`value`) and a `context` object (`context.name` replaces `propertyKey`, `context.kind === 'method'`).
- All decorators applied to members of one class (plus the class decorator itself) can share state via `context.metadata`, a single object attached to the class's `Symbol.metadata`. This can replace the library's current `Registry`/`UID` scheme, which exists specifically to associate metadata with a class instance when there's no `target` to key off of.

Steps:
1. **Toolchain**: confirm the TypeScript version in use (`typescript@5.2.2` per `devDependencies` already supports standard decorators). Set `"experimentalDecorators": false` (or delete the flag entirely) in `projects/lib/tsconfig.lib.json` and any consuming app's `tsconfig.json` once the rewrite lands — the two modes are not interoperable for a given compilation, so this is a breaking change for consumers who still compile with `experimentalDecorators: true` and expect the old decorator behavior. Ship it as a major version bump.
2. **Rewrite `RestClient` (class decorator)** in `projects/lib/src/lib/public/decorators/rest-client.ts`:
   ```ts
   export function RestClient(baseUrl: UrlInput = '') {
     return (constructor: Initialisable, context: ClassDecoratorContext) => {
       Registry.registerClass(baseUrl, constructor, context.metadata);
     };
   }
   ```
3. **Rewrite the method decorators** (`get.ts`, `post.ts`, `put.ts`, `patch.ts`, `delete.ts`) to use `context.name` instead of the removed `property` argument, and to *return* a replacement function (standard decorators support returning a new method implementation, same effect as today's `proto[property] = prepareRequest(...)` mutation in `Registry.registerRequest`):
   ```ts
   export function GET(endpoint: string, options: RequestOptions = {}) {
     return (value: Function, context: ClassMethodDecoratorContext) => {
       return Registry.registerRequest('GET', endpoint, context, options);
     };
   }
   ```
   `Registry.registerRequest` needs to change from mutating `proto[property]` to returning the replacement function for the decorator to hand back, and from keying its `ClassDescriptor` map by `UID(proto)` to keying it by `context.metadata` (or `context.name` + `context.metadata` together).
4. **Rewrite `BeforeRequest`/`AfterRequest`** the same way — they currently take `(proto, method, applyTo)`; move to `(value, context)` and register through `context.metadata` instead of `proto`.
5. **Update `internal/registry/registry.ts`**: change every `proto: any` parameter to accept the `context.metadata` object (or a `ClassMethodDecoratorContext`/`ClassDecoratorContext`) instead. Once this is done, `internal/uid/uid.ts` (used today purely to derive a stable key from a prototype object) becomes unnecessary and can be deleted, since `context.metadata` already gives a stable, class-scoped identity.
6. **Update tests**: `internal/registry/registry.spec.ts`, `internal/uid/uid.spec.ts` (removable), and `internal/rest-client/rest-client.service.spec.ts` will need updating to construct test fixtures using real class declarations with the new decorators rather than manually calling the old `(target, property)` signature.
7. **Verify decorator evaluation order** carries over correctly: standard decorators evaluate member decorators bottom-up and run the class decorator last, same relative order as legacy decorators, but initialization timing differs slightly (e.g. `context.addInitializer` callbacks run at instance-construction time, not decoration time) — needed if any decorator logic implicitly assumed synchronous-with-class-definition timing.
8. Bump the library's major version and call out the `experimentalDecorators` requirement change prominently in the changelog/README, since any consumer still compiling with `experimentalDecorators: true` against the new decorator implementations would break.

## Consumer upgrade guide (for the version that includes the above migrations)

### a) Must do

These are breaking changes — the package will not compile or will misbehave without them.

1. **Remove `experimentalDecorators` from your app's `tsconfig.json`** (or explicitly set it to `false`). The new `@RestClient`/`@GET`/`@POST`/`@PUT`/`@PATCH`/`@DELETE`/`@BeforeRequest`/`@AfterRequest` decorators are written against the TC39 standard decorators signature, which is not interoperable with legacy `experimentalDecorators: true` compilation. Leaving the flag on will produce type errors or, worse, calls with the wrong arguments at runtime.
2. **Use TypeScript 5.2 or later.** Standard decorators require it; anything older cannot compile the new decorator syntax at all.
3. **Recompile and re-test any code that decorates REST client classes/methods.** The decorator call signatures haven't changed from the consumer's point of view (`@RestClient('/api')`, `@GET('/things')`, etc. still take the same arguments) — but because the underlying mechanism changed from prototype mutation to `context.metadata`, any consumer code that reached into `SomeClass.prototype` directly to inspect grappa-generated methods (undocumented but technically possible today) will no longer find them there and must be updated.
4. **Bump the `@elemental-concept/grappa` major version explicitly** in `package.json` — this is a major/breaking release, not a patch or minor.

### b) Should do

These are not required for the package to keep working, but are recommended to stay aligned with where the library and Angular are heading.

1. **Widen or drop any pinned peer-dependency assumptions** your app's tooling enforces — the library's new peer range covers Angular 13-21+, so if you had worked around the old `< 18` cap (e.g. with `--legacy-peer-deps` or a `package.json` `overrides`/`resolutions` entry), that workaround can now be removed.
2. **If your app bootstraps via `bootstrapApplication` (standalone),** switch from `imports: [GrappaModule]` to `providers: [provideGrappa()]`. `GrappaModule` still works but is deprecated and will eventually be removed; `provideGrappa()` also avoids pulling in `HttpClientModule` if you're already using `provideHttpClient()` yourself.
3. **If you call `provideHttpClient()` yourself and also import `GrappaModule`,** check your `HttpClient` configuration (interceptors, fetch backend, etc.) still applies as expected — the library now supplies its own `provideHttpClient()` internally, and duplicate provider registrations resolve to whichever was registered last rather than throwing an error.
4. **Consider migrating your own decorated classes' constructors to `inject()`** for consistency, if you've already adopted that style elsewhere in your app — purely stylistic, no functional benefit tied to this library specifically.

## Impact on `@elemental-concept/grappa-jwt` (C:\Src\Ec\grappa-jwt)

`grappa-jwt` is not just a consumer that decorates classes with grappa's public decorators — it reaches directly into grappa's internals, which makes it the piece most exposed to the migrations above.

### Direct coupling found
- `projects/lib/src/lib/public/decorators/authenticate.ts:1,6-8` (in grappa-jwt) imports `Registry` straight from `@elemental-concept/grappa` and calls it directly:
  ```ts
  import { Initialisable, Registry } from '@elemental-concept/grappa';
  export function Authenticate() {
    return (constructor: Initialisable) => {
      Registry.registerBeforeFilter(constructor.prototype, beforeFilter, null);
    };
  }
  ```
  This is only possible because grappa's `public_api.ts:2` does `export * from './lib/internal'`, which re-exports `Registry` (`internal/index.ts:1`) despite it living under an `internal/` folder — it is a de facto public API today, not just an implementation detail.
- `Authenticate()` itself is written as a **legacy-style class decorator** — `(constructor: Initialisable) => {...}`, no `context` parameter — and it passes `constructor.prototype` straight into `Registry.registerBeforeFilter`.
- `grappa-jwt`'s own peer dependency is pinned with a caret: `"@elemental-concept/grappa": "^17.0.0"` (`projects/lib/package.json:23` in grappa-jwt) — i.e. `>=17.0.0 <18.0.0`. This is *stricter* than grappa's own `< 18` cap discussed above, and would need to be bumped in lockstep with any grappa major release regardless of the other changes.

### a) Must change in grappa-jwt if grappa ships the decorator/Registry migration
1. **Rewrite `Authenticate()` as a standard class decorator**: add the `context: ClassDecoratorContext` parameter, and stop passing `constructor.prototype` to `Registry.registerBeforeFilter` — pass whatever key the migrated `Registry` expects instead (per the plan above, `context.metadata`, or the class's own `context` if `Registry.registerBeforeFilter`'s signature changes to accept it). This function does not compile/behave correctly against the new `Registry` API without this change — it is not optional.
2. **Bump grappa-jwt's `tsconfig.json`** the same way as grappa itself: remove/`false` `experimentalDecorators` (`tsconfig.json:11` in grappa-jwt currently sets it `true`), since a single compilation cannot mix legacy and standard decorators, and `Authenticate()` must move to the standard form to keep working with the new `Registry`.
3. **Bump the `@elemental-concept/grappa` peer range** in grappa-jwt's `package.json` to `^21.0.0` (the version that ships this migration) — the existing `^17.0.0` caret will otherwise block installation entirely once grappa releases a new major.
4. **Release grappa-jwt as a new major version itself**, since none of the above are backward compatible with apps still on the old grappa major / legacy decorators.

### b) Should change in grappa-jwt
1. **Stop depending on `Registry` as a public import.** Since `Registry` is only reachable today because of the blanket `export * from './lib/internal'` in grappa's `public_api.ts`, this is a fragile contract — grappa could tighten that export list at any point (arguably it should, since `internal/` suggests it isn't meant to be consumed externally) and silently break grappa-jwt. If grappa's migration is a good opportunity to formalize a `registerBeforeFilter`/`registerAfterFilter`-equivalent as an explicitly documented, stable extension point (e.g. re-exported from `public/` instead of `internal/`), grappa-jwt should move to that instead of importing from `internal`.
2. **Switch `GrappaJwtModule` to also offer a standalone `provideGrappaJwt()`** function, mirroring the `provideGrappa()` addition recommended for grappa itself, so standalone-bootstrap consumers of grappa-jwt aren't forced through an `NgModule`.
3. **Widen grappa-jwt's own `@angular/core`/`@angular/common` peer range** past `< 18` at the same time, since it's presumably equally untested-but-probably-fine on 18-21 as grappa was found to be.
4. **Add a compatibility test** (or at minimum a manual smoke test) exercising `@Authenticate()` end-to-end against the migrated grappa `Registry`, since this integration point is exactly the kind of cross-package coupling that unit tests within a single repo won't catch.
