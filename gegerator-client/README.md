# GegeratorClient

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 21.0.6.

## Upgrade Angular version

Great resource for a clean upgrade path: https://angular.dev/update-guide?v=13.0-21.0&l=1
(do not forget to also upgrade ngrx at the same pace, one version at a time)


## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

# Developping tests

Need the following docs:

- https://angular.dev/guide/testing
- https://material.angular.dev/guide/using-component-harnesses
- https://vitest.fr/

## Running unit tests

    **NOTE** At the moment it appears that `npx vitest` would not work for Component testing, unless I install and configure @analogjs/platform + angular plugin, which I don't want because it is just overkill. Try again at the next major version of vitest maybe.

Run either:

`npm run test`: the tests are run through angular.json, that then delegates to vitest.

`npx vitest`: run vitest directly. Note that only this one will produce test reporters report, in the (transient) folder 'test-results'.


Note: with these the commands would run in watch mode (abort with Ctrl-C). If you need the test process to terminate instead, use `npm run test:once` or `npx vitest --run` instead.

See at the end of this file for more context about frameworks and configuration.

### Debug test

Run `npm run test:debug`. This will start the test suite but immediately wait for a Node inspector to attach. The console will output the debug URL, that you have to give to your debugger so that it can attach.

Note: on VsCode it's even simpler: 1. Open the debug menu and select "Javascript Debug Terminal", then 2. run `npm run test:debug`. The debugger will attach automatically. 

## Running end-to-end tests

(TODO: none at the moment, maybe some day)
Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Run the proxy server 

`npm run startproxy`
(Note that gegerator.server should also be running in order to have data served as well)

## Cleanup

`npm run clean:dist`

--------------------------------

# Notes

## Tests

### Configuration
Because I don't quite get the frontend dev ecosystem x_x This is quite a hell of configuration files, I need to keep written notes on how this thing work. 

#### How tests are first compiled

1. tsconfig.spec.json

The file `tsconfig.spec.json` extends the general typescript compiler configuration `tsconfig.json`, for the specific purpose of testing. Here it mainly specifies what should be included or excluded from the test scope (for instance we don't want the test suites located in node_modules). The file `tsconfig.spec.json` is referenced by both `angular.json` and `vitest.config.ts`.

#### The plumbing from package.json to vitest

1. package.json

`package.json` defines the dependencies set, but also commands for npm to run, including the command `test`. It delegates in turn to `angular.json`. These commands can also be invoked directly using `ng`.

2. angular.json

`angular.json` configures the behavior of the commands like build or serve. For the command "test", it will delegate to vitest as its main runner. It includes `tsconfig.json` for compiler configuration (see above) and `vitest.config.json` for configuring vitest. Vitest itself is run because the build target for "test" is `@angular/build:unit-test`. 

3. vitest.config.json

`vitest.config.json` is the actual testrunnner configuration (vitest). In this file are defined the desired features like the reporters (for outputing the test results in various formats), and the required configuration to run. It *also* depends on `tsconfig.spec.json`, because when running outside of an angular command (ng) it would have no way to know where the assets are (hence the plugin 'tsconfigPaths'). It also includes `src/test-setup.ts`, see below.

4. src/test-setup.ts

`src/test-setup.ts` is a typescript script that will run before each test suite, and allow for configuration of the test execution context. Here it is necessary when running vitest directly because otherwise the angular compiler would not be loaded.

#### Running the tests
Tests can be run either using `npm run test`, `ng test` or `npx vitest`. Here is what happens in those three scenarios:

1. npm run test

npm will read the command "test" in `package.json`, and per the definition of the command will delegate to `ng test`.

2. ng test

Angular will set up the test by applying the configuration defined in the build target "test" (see above). It configures the test compiler and the test runner (vitest), then runs vitest directly.

3. npx vitest

This is a direct invokation of vitest. In that setup, vitest is only aware of `vitest.config.json` and files included in it. If for instance the plugin tsconfigPath was not loaded, vitest would not know about how the tests are compiled and which files to exclude. Similarly, the angular compiler would not be available, and that is why the execution of `src/test-setup.ts` is required.

---
(This section was generated by Copilot - GPT 5 mini)

### Vitest: `ng test` vs `npx vitest` (clarifications)

- **Local dev (`ng test`)**: the Angular CLI builder `@angular/build:unit-test` prepares the Angular testing environment (compiles with the Angular test compiler, configures TestBed, etc.) and then invokes the test runner. Because the builder sets up parts of the environment, some options in your `vitest.config.ts` may not be honored when running tests through `ng test`. Use `ng test` for iterative local development when you want Angular's test setup and CLI conveniences.

- **Direct runner (`npx vitest`)**: invoking Vitest directly uses `vitest.config.ts` as-is and will respect reporters and `outputFile` settings (useful for CI and for producing XML/JSON reports). If you rely on reporters / test-output files in CI, prefer calling Vitest directly in CI pipelines.

Commands:
```bash
# local (uses Angular builder)
npm run test
# direct Vitest (recommended for CI / reporters)
npx vitest
```


- **`tsconfig` paths**: the `vite-tsconfig-paths` plugin reads the tsconfig that Vite/Vitest uses (commonly your root `tsconfig.json`). If you have path aliases or special settings in `tsconfig.spec.json`, ensure those aliases are available in the tsconfig that Vitest loads (or configure the plugin appropriately) so imports/resolution behave the same when running `npx vitest`.

- **`src/test-setup.ts`**: keeping `src/test-setup.ts` and listing it in `vitest.config.ts` `setupFiles` is correct. For Angular JIT / TestBed tests you may also need `zone.js/testing` and standard TestBed initialization inside `test-setup.ts` if you hit runtime/zone-related errors.

- **Minor fixes**: update README references from `vitest.config.json` to `vitest.config.ts` to match the repo.

---
