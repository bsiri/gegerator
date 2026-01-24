import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfigDialog } from './configdialog.component';
import { WizardConfiguration, TheaterRatings, TheaterRating } from 'src/app/ngrx/appstate-models/wizardconfiguration.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { harnessHelper } from 'src/_testhelpers/harnesshelper';
import { MatSelectHarness } from '@angular/material/select/testing';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';

describe('ConfigDialog', () => {
  let fixture: ComponentFixture<ConfigDialog>;
  let component: ConfigDialog;
  let dialogRef: MatDialogRef<ConfigDialog>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    let dialogMock = { close: vi.fn() as any }

      await TestBed.configureTestingModule({
        imports: [
          ReactiveFormsModule,
          MatSelectModule,
          MatFormFieldModule,
          MatSliderModule,
          MatButtonModule,
          ConfigDialog
        ],
      providers: [
        { provide: MatDialogRef, useValue: dialogMock },
        { provide: MAT_DIALOG_DATA, useValue: TEST_WIZARD_CONFIGURATION }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfigDialog);
    component = fixture.componentInstance;
    dialogRef = TestBed.inject(MatDialogRef);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should create the component and initialize form controls from provided WizardConfiguration', async () => {
    /*
      Goal of the test: ensure the component is created and the formGroup controls
      are initialized with the values coming from the injected `WizardConfiguration`.

      Synopsis:
      - given: a TestBed-provided `WizardConfiguration` (see TEST_WIZARD_CONFIGURATION)
      - when: component is constructed (beforeEach)
      - then: each form control value equals the corresponding field from the fixture

      Desired assertions (in order):
      1. `component.formGroup.get('espaceLacRating').value` equals TEST_WIZARD_CONFIGURATION.espaceLacRating
      2. same for `casinoRating`, `paradisoRating`, `mclRating`
      3. `component.movieVsTheaterBias` equals TEST_WIZARD_CONFIGURATION.movieVsTheaterBias
    */
    await fixture.whenStable();
    const helper = harnessHelper(loader);

    const espace = await helper.select('cd-espace');
    expect(await espace.getValueText()).toBe(TEST_WIZARD_CONFIGURATION.espaceLacRating.name);

    const casino = await helper.select('cd-casino');
    expect(await casino.getValueText()).toBe(TEST_WIZARD_CONFIGURATION.casinoRating.name);

    const paradiso = await helper.select('cd-paradiso');
    expect(await paradiso.getValueText()).toBe(TEST_WIZARD_CONFIGURATION.paradisoRating.name);

    const mcl = await helper.select('cd-mcl');
    expect(await mcl.getValueText()).toBe(TEST_WIZARD_CONFIGURATION.mclRating.name);

    // Prefer the slider thumb harness when available: assert its percentage.
    const thumb = await helper.sliderThumb('cd-bias');
    const pct = await thumb.getPercentage();
    expect(pct).toBeCloseTo(TEST_WIZARD_CONFIGURATION.movieVsTheaterBias, 5);
  });

  it('should render four mat-select controls (one per theater)', async () => {
    /*
      Goal: verify the template renders exactly 4 select controls for theaters.

      Synopsis:
      - given: the component template
      - when: view is initialized
      - then: query for mat-select elements and assert length === 4 (the number of theaters)

      Desired assertions:
      1. number of rendered `mat-select` in the template equals the expected count
    */
    const selects = await loader.getAllHarnesses(MatSelectHarness);
    // There are four theater selectors in the template (espaceLac, casino, paradiso, mcl)
    expect(selects.length).toBe(4);
  });

  it('should populate each mat-select with options from TheaterRatings.enumerate()', async () => {
    /*
      Goal: ensure each select control contains the same number of options
      as returned by `TheaterRatings.enumerate()` and that option identities match.

      Synopsis:
      - given: real `TheaterRatings.enumerate()`
      - when: template renders
      - then: each select has `TheaterRatings.enumerate().length` options

      Desired assertions:
      1. options count equals `TheaterRatings.enumerate().length` for each select
      2. optionally: the first option's key/name matches `TheaterRatings.enumerate()[0]`
    */
    const selects = await loader.getAllHarnesses(MatSelectHarness);
    const expected = TheaterRatings.enumerate();
    for (const s of selects) {
      await s.open();
      const options = await s.getOptions();
      expect(options.length).toBe(expected.length);
      const firstText = await options[0].getText();
      expect(firstText).toBe(expected[0].name);
      await s.close();
    }
  });

  it('should change at least two ratings and the bias, submit and receive updated WizardConfiguration', async () => {
    /*
      Goal: exercise UI interaction path where user changes two theater ratings and the slider bias,
      then clicks OK and the dialog is closed with an updated `WizardConfiguration` reflecting changes.

      Synopsis:
      - given: the component with initial TEST_WIZARD_CONFIGURATION
      - when: modify two controls (e.g., espaceLacRating, paradisoRating) to different TheaterRating instances
        and change `component.movieVsTheaterBias`, then call `component.confirm()`
      - then: `dialogRef.close()` is called with a `WizardConfiguration` whose fields reflect the updates

      Desired assertions (in order):
      1. `dialogRef.close` was called once
      2. the argument is a `WizardConfiguration`
      3. the deux modified ratings equal the new chosen values
      4. `movieVsTheaterBias` equals the modified bias value
    */
    await fixture.whenStable();
    const helper = harnessHelper(loader);

    // change espaceLac to NEVER
    const espace = await helper.select('cd-espace');
    await espace.open();
    const espaceOpts = await espace.getOptions({ text: TheaterRatings.NEVER.name });
    await (espaceOpts[0]).click();
    await espace.close();

    // change paradiso to HIGHEST
    const paradiso = await helper.select('cd-paradiso');
    await paradiso.open();
    const paradisoOpts = await paradiso.getOptions({ text: TheaterRatings.HIGHEST.name });
    await (paradisoOpts[0]).click();
    await paradiso.close();

    // set slider bias to 0.9 using the slider harness (no testid needed)
    const slider = await helper.sliderThumb();
    await slider.setValue(0.9);

    // submit via button
    const submit = await helper.button('cd-submit');
    await submit.click();

    await fixture.whenStable();

    // Assert that the modifications are reflected in the closed dialog argument
    const viClose = (dialogRef.close) as Mock
    expect(viClose).toHaveBeenCalled()
    const closedArg = viClose.mock.calls[0][0]

    expect(closedArg).toBeInstanceOf(WizardConfiguration)
    expect(closedArg.espaceLacRating).toBe(TheaterRatings.NEVER)
    expect(closedArg.paradisoRating).toBe(TheaterRatings.HIGHEST)
    expect(closedArg.movieVsTheaterBias).toBeCloseTo(0.9, 5)
  });

  it('toWizardConfiguration() returns a WizardConfiguration built from form values and bias', async () => {
    /*
      Goal: test the pure conversion method `toWizardConfiguration()`.

      Synopsis:
      - given: the component with known form control values and `movieVsTheaterBias`
      - when: call `component.toWizardConfiguration()`
      - then: returned object equals a new `WizardConfiguration` constructed from those values

      Desired assertions:
      1. returned object is instance of `WizardConfiguration`
      2. each rating property equals the value from the form
      3. movieVsTheaterBias equals `component.movieVsTheaterBias`
    */
    await fixture.whenStable();

    // change a couple of form values and bias
    component.formGroup.get('espaceLacRating')?.setValue(TheaterRatings.NEVER);
    component.formGroup.get('casinoRating')?.setValue(TheaterRatings.HIGHEST);
    component.movieVsTheaterBias = 0.42;

    const result = component.toWizardConfiguration();

    expect(result).toBeInstanceOf(WizardConfiguration);
    expect(result.espaceLacRating).toBe(TheaterRatings.NEVER);
    expect(result.casinoRating).toBe(TheaterRatings.HIGHEST);
    expect(result.paradisoRating).toBe(component.formGroup.get('paradisoRating')?.value);
    expect(result.mclRating).toBe(component.formGroup.get('mclRating')?.value);
    expect(result.movieVsTheaterBias).toBeCloseTo(0.42, 5);
  });

  it('_getFGValue() returns the proper value for each control', async () => {
    /*
      Goal: ensure the internal helper `_getFGValue()` retrieves the correct form control value.

      Synopsis:
      - given: component.formGroup populated from TEST_WIZARD_CONFIGURATION
      - when: call `_getFGValue('espaceLacRating')` (and others)
      - then: each call returns the exact control value

      Desired assertions:
      1. return equals the corresponding control value for each control name
    */
    await fixture.whenStable();

    const names = ['espaceLacRating', 'casinoRating', 'paradisoRating', 'mclRating'];
    for (const n of names) {
      const expected = component.formGroup.get(n)?.value;
      expect(component._getFGValue(n)).toBe(expected);
    }
  });

  it('confirm() calls dialogRef.close() with the WizardConfiguration', async () => {
    /*
      Goal: verify `confirm()` closes the dialog passing the `WizardConfiguration` produced by `toWizardConfiguration()`.

      Synopsis:
      - given: component with modified form values
      - when: call `component.confirm()`
      - then: `dialogRef.close` called once with a `WizardConfiguration`

      Desired assertions:
      1. `dialogRef.close` called once
      2. argument is a `WizardConfiguration` whose fields match `component.toWizardConfiguration()`
    */
    await fixture.whenStable();

    const viClose = (dialogRef.close) as Mock;
    viClose.mockClear();

    // mutate state
    component.formGroup.get('espaceLacRating')?.setValue(TheaterRatings.NEVER);
    component.movieVsTheaterBias = 0.77;

    component.confirm();
    await fixture.whenStable();

    expect(viClose).toHaveBeenCalledTimes(1);
    const arg = viClose.mock.calls[0][0];
    expect(arg).toBeInstanceOf(WizardConfiguration);
    expect(arg.espaceLacRating).toBe(TheaterRatings.NEVER);
    expect(arg.movieVsTheaterBias).toBeCloseTo(0.77, 5);
  });

  it('cancel() calls dialogRef.close() with no argument', async () => {
    /*
      Goal: ensure cancel simply closes the dialog without returning data.

      Synopsis:
      - given: a component instance
      - when: call `component.cancel()`
      - then: `dialogRef.close` called with no arguments

      Desired assertions:
      1. `dialogRef.close` called once
      2. the call argument list is empty / undefined
    */
    const viClose = (dialogRef.close) as Mock;
    viClose.mockClear();

    component.cancel();

    expect(viClose).toHaveBeenCalledTimes(1);
    // ensure it was called without an argument
    expect(viClose.mock.calls[0][0]).toBeUndefined();
  });

  it('constructor initializes fields correctly from injected WizardConfiguration', async () => {
    /*
      Goal: assert that when the component is constructed with a `WizardConfiguration` it sets
      the `formGroup` values and `movieVsTheaterBias` accordingly (redundant to first test but explicit)

      Synopsis:
      - given: TEST_WIZARD_CONFIGURATION
      - when: component constructed
      - then: internal fields mirror the provided configuration

      Desired assertions:
      1. form controls values equal fixture values
      2. `movieVsTheaterBias` equals fixture bias
    */
    await fixture.whenStable();

    expect(component.formGroup.get('espaceLacRating')?.value).toBe(TEST_WIZARD_CONFIGURATION.espaceLacRating);
    expect(component.formGroup.get('casinoRating')?.value).toBe(TEST_WIZARD_CONFIGURATION.casinoRating);
    expect(component.formGroup.get('paradisoRating')?.value).toBe(TEST_WIZARD_CONFIGURATION.paradisoRating);
    expect(component.formGroup.get('mclRating')?.value).toBe(TEST_WIZARD_CONFIGURATION.mclRating);
    expect(component.movieVsTheaterBias).toBeCloseTo(TEST_WIZARD_CONFIGURATION.movieVsTheaterBias, 5);
  });

  // Datasets and mocks
  // Keep test data at file bottom so it's easy to reuse across tests.
});

// Test fixtures
const TEST_WIZARD_CONFIGURATION = new WizardConfiguration(
  TheaterRatings.HIGH,
  TheaterRatings.DEFAULT,
  TheaterRatings.NEVER,
  TheaterRatings.HIGHEST,
  0.3
);
