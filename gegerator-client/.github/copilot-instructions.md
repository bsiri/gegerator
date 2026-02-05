# Technical context
This is an Angular project (21 at the time of writing), using Typescript and Angular Material. The testing framework is Vitest, with Angular Testing Library and Angular Material Harnesses.

# General guidelines
- use french notation for time: use "10h00", avoid "10:00"
- run single test suite with : `npx ng test --watch=false --include "<test-file-path>" --ui=false --progress=false`
- run all tests with `npm run test:once`