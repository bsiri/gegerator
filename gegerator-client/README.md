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

## Running unit tests

Run either:
`npm run test`: the tests are run through angular.json, that then delegates to vitest.
`npx vitest`: run vitest directly. Note that only this one will produce test reporters report, in 
    the (transient) folder 'test-results'.

See at the end of this file for more context about frameworks and configuration.

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

Curiously, some elements of the configuration of vitest are not honored, like the production of test reports. 

3. npx vitest

This is a direct invokation of vitest. In that setup, vitest is only aware of `vitest.config.json` and files included in it. If for instance the plugin tsconfigPath was not loaded, vitest would not know about how the tests are compiled and which files to exclude. Similarly, the angular compiler would not be available, and that is why the execution of `src/test-setup.ts` is required.

However the good thing is that `npx vitest` do actually produce the test reports.
