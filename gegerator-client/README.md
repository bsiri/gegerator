# GegeratorClient

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.3.1.

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

### Notes about test configuration
Because I don't quite get the frontend dev ecosystem x_x This is quite a hell of configuration files, 
I need to keep written notes on how this thing work. 

#### How tests are first compiled
The file `tsconfig.spec.json` extends the general compiler configuration `tsconfig.json` for 
the specific purpose of testing. Here it mainly specifies what should be included or excluded 
from the test scope (for instance we don't want the test suites located in node_modules).
The file `tsconfig.spec.json` is referenced by both `angular.json` and `vitest.config.ts`.



## Running end-to-end tests

(TODO: I don't think I have e2e tests yet)
Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Run the proxy server 

`npm run startproxy`
(Note that gegerator.server should also be running in order to have data served as well)

## Cleanup

`npm run clean:dist`
