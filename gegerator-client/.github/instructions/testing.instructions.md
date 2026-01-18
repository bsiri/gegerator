---
applyTo: '**/*.spec.ts'
---
# Test writing guidelines

## Overview
This is a Typescript Angular application, using the Material Design framework for the UI, and Vitest for the test technology.

## Guidelines

### For creating a new test file
Test files should be located in the same folder as the code being tested. The filename follows the template `<objectname>.spec.ts`. Example: if the code under test is in file `sessiondialog.component.ts`, the test file should be named `sessiondialog.component.spec.ts`.

If such file already exist in the same folder, do nothing instead.

### Vitest constructs in use
1. Testsuites use the `describe` function,
2. Test methods use the `it` function,
3. Assertions use the `expect()` function,
4. Mock functions use the `vi.fn()` function.

### Test structure
1. Imports come first,
2. Then, the test suites,
3. Then, the utility methods if any,
4. Then, the mocks, stubs, and other datasets if any.

### Naming conventions
Components having a UI (an associated html template) are tested with two test suites: one for the template and one for the component code (the logic). They are named `<component-name>-Template` and `<component-name>-Component` respectively. They appear in the test file in that order.

For other classes such as Angular services, one test suite name `<component-name>` is enough.

Test methods names should start with ('should <do this or that>).

### Testing the Template vs testing the Component
For components having a UI:
* testing the Template means actually using the component as the User would, and that error feedback are actually rendered when appropriate.
* testing the component focus on the internal logic and side effects that the User cannot see (eg, triggering a service or an ngrx action).


### Write unit tests
For a given component, the input and outputs should be mocked. For example if a component has a button that invoke a dialog, that dialog should not be also tested. It should not even be rendered: use `vi.fn()` to mock them instead.

### Test the UI
If the Component has a UI, and an element of that UI proposes a specific ergonomics, these ergonomics should be tested. For example, when testing a menu select, the test should actually unroll the menu select and click on the option, as opposed to merely setting the select value programatically.

Example:
```typescript
// [META NOTE]: see the usage for the helper further in this document
const daySelector = await helper.select('sd-day mat-select')
await daySelector.open()
const optFriday = (await daySelector.getOptions({text: Days.FRIDAY.name}))[0]
await optFriday.click()
```

### Writing assertions
If possible, instead of writing the expected values as litteral, and the expected value is held by a known object, reference the property of that known object instead.

Example: don't do this
```typescript
expect(result.title).toBe('the title')
```

Example: do this instead
```typescript
// example where the expected object belongs to a mock collection
const expectedObject = mocks[1]
[...]
expect(result.title).toBe(expectedObject.title)
```


### Use Material Harnesses when possible
Material Design publish harnesses. Tests that cover the UI should use the harnesses whenever possible.

Example of loading a harness:
```typescript
[...]
fixture = TestBed.createComponent(ExampleComponentHarness)
loader = TesbedHarnessEnvironment.loader(fixture)
[...]
const harness = await loader.getHarness(ExampleComponentHarness)
```

### Add testids if necessary
A general concept used throughout the tests are testids as explained in this section.

#### what are testids
To help locate a particular element in an Angular template, you may add a testid to it. The testids are actually css classes that follow the following convention: `testid-<mnemonic-component>-<mnemonic-element>[-<discriminator>]`.

Example of testid:
```html
<!-- inside mycomponent.template.html -->
[...]
<mat-form-field [...] class="testid-mc-title">
  <input formControlName="title" />
</mat-form-field>
```
In this example, the mnemonic for the component has been chosen as `mc`, the initials for `MyComponent`. The mnemonic for the element is simply `title` as it is short enough; if it the element name exceeds 10 characters it can be shortened at your will.

In case the element you need to mark with a testid is part of a `@for` or `*ngFor` loop, you will also add the `-discriminator`. The discriminator is usually the `track` key of the object being rendered.

Example of testid in a for loop:
```html
[...]
@for (sday of Days.enumerate(); track sday.key) {
  <mat-option (keyup.enter)="confirm()" [value]="sday"
    class="testid-oad-opt-{{sday.key}}" >
    {{sday.name}}
  </mat-option>
}
[...]
```

#### where are applied testids
If the element of interest a Material element that is NOT a `<mat-error>`, eg `<mat-form-field>`, the Material element should be tagged.

Else it should be applied directly on it. 

### Use the harness helper where applicable
The harness helper is located in file `src/_testhelpers/harnesshelper.ts`. It proposes shorthands for leveraging the testids with the harness loader. If one of the components is supported by the harness helper, you should use it. Else, loading a Material Harness with the loader directly is fine.

The helper proposes several methods named after the component for which we want a reference, 
and the argument is the part of the testid that comes after the prefix `testid-`.

Example: locating a text input within a `<mat-form-field>`
```html
<!-- in mycomponent.component.html -->
<mat-form-field [...] class="testid-mc-title">
  <input formControlName="title" />
</mat-form-field>
```
```typescript
// in mycomponent.component.spec.ts
const helper = harnessHelper(loader)
const titleInput = helper.text('mc-title input')
```

### Testing validation errors
Errors are displayed usually at the Material form field level.

Example:
```typescript
const titleField = await helper.formfield('mc-title')
expec(await titleField.isControlValid()).toBe(false)
```

If in the template, a `<mat-error>` has been added and be displayed in case of validation error, 
their presence should also be tested.

Example:
```typescript
const titleField = await helper.formfield('mc-title')
const titleErrors = await titleField.getErrors()
expect(titleErrors.length).toBeGreaterThan(0)
```

### How to stringify a Time or Duration
`Time` and `Duration` concepts are represented by classes that do not properly implement `toString()`. Thus if they must be rendered as strings, the static utility functions `Times.toString()` and `Duration.toString()` should be used instead. You can search for them in codebase in file [src/app/models/time.utils.ts](/src/app/models/time.utils.ts)

Example:
```typescript
expect(await starttimeInput.getValue()).toBe(Times.toString(expectedObject.startTime))
```

## Examples of test files

Example of implementations can be found in the following links. An inspection of the code of the components being tested, and the associated html templates, will be helpful as well.

* [moviedialog.component.spec.ts](/src/app/components/movies/moviedialog/moviedialog.component.spec.ts)
* [sessiondialog.component.spec.ts](/src/app/components/sessions/sessiondialog/sessiondialog.component.spec.ts)
* [activitydialog.component.spec.ts](/src/app/components/sessions/activitydialog/activitydialog.component.spec.ts)
