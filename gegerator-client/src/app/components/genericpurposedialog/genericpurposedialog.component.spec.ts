import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { GenericPurposeDialog, ConfirmOutput, ConfirmDialogData } from './genericpurposedialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { harnessHelper } from 'src/_testhelpers/harnesshelper';


describe('GenericPurposeDialog - Confirm Suite', () => {
  /*
    Goal: verify the confirm template is used when no message/html/type provided.

    Synopsis:
    - given: MAT_DIALOG_DATA = CONFIRM_DEFAULT (empty object)
    - when: component created
    - then: title "Confirmer" is present, content equals fallback "Confirmer ?",
      and both confirm + cancel buttons exist.

    Desired assertions:
    1. component.type equals 'confirm'
    2. component.content equals 'Confirmer ?'
    3. the template contains two action buttons (confirm + cancel)
    4. the dialog title text equals 'Confirmer'
  */
  it('should render default confirm UI when data is empty', async () => {
    const { fixture: f, component: c } = setupTestBed(CONFIRM_DEFAULT);

    expect(c.type).toBe('confirm');
    expect(c.content).toBe('Confirmer ?');

    // Assert the title
    const titleEl = f.nativeElement.querySelector('.testid-gpd-title');
    expect(titleEl.textContent.trim()).toBe('Confirmer');
    // Assert the content (display the default message)
    const contentEl = f.nativeElement.querySelector('.testid-gpd-content');
    expect(contentEl.textContent.trim()).toBe('Confirmer ?');
    // Assert both action buttons exist
    const buttons = f.nativeElement.querySelectorAll('.testid-gpd-confirm, .testid-gpd-cancel');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  /*
    Goal: ensure a plain text `message` is displayed. 

    Synopsis:
    - given: MAT_DIALOG_DATA has a `message` string
    - when: component created
    - then: rendered content equals the message and both action buttons exist

    Desired assertions:
    1. component.content equals the provided message
  */
  it('should render provided message in confirm template', async () => {
    const { fixture: f, component: c } = setupTestBed(CONFIRM_MESSAGE);

    expect(c.content).toBe(CONFIRM_MESSAGE.message);
    const contentEl = f.nativeElement.querySelector('.testid-gpd-content');
    expect(contentEl.textContent.trim()).toBe(CONFIRM_MESSAGE.message);
  });

  /*
    Goal: ensure `html` content is used when `message` is not provided.

    Synopsis:
    - given: MAT_DIALOG_DATA has `html` with markup, no `message`
    - when: component created
    - then: DOM contains the provided markup via innerHtml

    Desired assertions:
    1. component.content equals the html string
    2. the DOM contains expected markup from html
  */
  it('should render provided html when message is absent', async () => {
    const { fixture: f, component: c } = setupTestBed(CONFIRM_HTML);

    expect(c.content).toBe(CONFIRM_HTML.html);
    const contentEl = f.nativeElement.querySelector('.testid-gpd-content');
    expect(contentEl.innerHTML).toContain(CONFIRM_HTML.html);
  });

  /*
    Goal: message takes precedence over html when both are supplied.

    Synopsis:
    - given: MAT_DIALOG_DATA has both `message` and `html`
    - when: component created
    - then: rendered content equals `message`

    Desired assertions:
    1. component.content equals the message value
    2. the DOM does not render the html fallback
  */
  it('should prefer message over html when both provided', async () => {
    const { fixture: f, component: c } = setupTestBed(CONFIRM_BOTH);

    expect(c.content).toBe(CONFIRM_BOTH.message);
    const contentEl = f.nativeElement.querySelector('.testid-gpd-content');
    expect(contentEl.innerHTML).toContain(CONFIRM_BOTH.message);
  });

  /*
    Goal: verify `confirm()` calls `dialogRef.close(ConfirmOutput.CONFIRM)`.

    Synopsis:
    - given: a mock MatDialogRef with spy on `close`
    - when: component.confirm() is invoked
    - then: mockDialogRef.close called with ConfirmOutput.CONFIRM

    Desired assertions:
    1. mockDialogRef.close called once with ConfirmOutput.CONFIRM
  */
  it('confirm() should close dialog with ConfirmOutput.CONFIRM', async () => {
    const { fixture: f, component: c, mockRef, helper } = setupTestBed(CONFIRM_MESSAGE);

    await helper.clickByTestId('gpd-confirm');
    expect(mockRef.close).toHaveBeenCalledWith(ConfirmOutput.CONFIRM);
  });

  /*
    Goal: verify `cancel()` calls `dialogRef.close(ConfirmOutput.CANCEL)`.

    Synopsis:
    - given: a mock MatDialogRef with spy on `close`
    - when: component.cancel() is invoked
    - then: mockDialogRef.close called with ConfirmOutput.CANCEL

    Desired assertions:
    1. mockDialogRef.close called once with ConfirmOutput.CANCEL
  */
  it('cancel() should close dialog with ConfirmOutput.CANCEL', async () => {
    const { fixture: f, component: c, mockRef, helper } = setupTestBed(CONFIRM_MESSAGE);

    await helper.clickByTestId('gpd-cancel');
    expect(mockRef.close).toHaveBeenCalledWith(ConfirmOutput.CANCEL);
  });
});


describe('GenericPurposeDialog - Info Suite', () => {
  it('should render info UI with single action button', async () => {
    /*
      Goal: confirm the info template is used and only one action button is present.

      Synopsis:
      - given: MAT_DIALOG_DATA.type = 'info'
      - when: component created
      - then: title "Information", info icon present, one action button exists

      Desired assertions:
      1. component.type equals 'info'
      2. DOM contains exactly one action button
      3. the dialog title text equals 'Information'
      4. clicking the button invokes cancel() behaviour
    */

    const { fixture: f, component: c, mockRef, helper } = setupTestBed(INFO_DATA);

    expect(c.type).toBe('info');

    // Assert the title
    const titleEl = f.nativeElement.querySelector('.testid-gpd-title');
    expect(titleEl.textContent.trim()).toBe('Information');

    // find the single action button through the harness and click it
    await helper.clickByTestId('gpd-info-action');
    expect(mockRef.close).toHaveBeenCalledWith(ConfirmOutput.CANCEL);
  });

  it('info action should close with ConfirmOutput.CANCEL', async () => {
    /*
      Goal: ensure the single action button triggers `cancel()` which closes with CANCEL.

      Synopsis:
      - given: INFO_DATA
      - when: the action is invoked
      - then: mockDialogRef.close called with ConfirmOutput.CANCEL

      Desired assertions:
      1. mockDialogRef.close called with ConfirmOutput.CANCEL
    */
    const { fixture: f, component: c, mockRef, helper } = setupTestBed(INFO_DATA);
    await helper.clickByTestId('gpd-info-action');
    expect(mockRef.close).toHaveBeenCalledWith(ConfirmOutput.CANCEL);
  });
});


describe('GenericPurposeDialog - Error Suite', () => {
  it('should render error UI with single action button', async () => {
    /*
      Goal: ensure the error template is used and only one action button is present.

      Synopsis:
      - given: MAT_DIALOG_DATA.type = 'error'
      - when: component created
      - then: title "Erreur !", error icon present, one action button exists

      Desired assertions:
      1. component.type equals 'error'
      2. DOM contains exactly one action button
      3. the dialog title text equals 'Erreur !'
      4. do not assert on profanity text; only presence of the button
    */

    const { fixture: f, component: c } = setupTestBed(ERROR_DATA);

    expect(c.type).toBe('error');
    const titleEl = f.nativeElement.querySelector('.testid-gpd-title');
    expect(titleEl.textContent.trim()).toBe('Erreur !');

    const buttons = f.nativeElement.querySelectorAll('.testid-gpd-error-action');
    expect(buttons.length).toBe(1);
  });

  it('error action should close with ConfirmOutput.CANCEL', async () => {
    const { fixture: f, component: c, mockRef, helper } = setupTestBed(ERROR_DATA);
    await helper.clickByTestId('gpd-error-action');
    expect(mockRef.close).toHaveBeenCalledWith(ConfirmOutput.CANCEL);
  });
});


// Test datasets and mocks
function setupTestBed(data: ConfirmDialogData) {
  TestBed.resetTestingModule();
  const mockRef = { close: vi.fn() };
  TestBed.configureTestingModule({
    imports: [GenericPurposeDialog],
    providers: [
      { provide: MatDialogRef, useValue: mockRef },
      { provide: MAT_DIALOG_DATA, useValue: data }
    ],
    schemas: [NO_ERRORS_SCHEMA]
  });

  const fixture = TestBed.createComponent(GenericPurposeDialog);
  const component = fixture.componentInstance;
  fixture.detectChanges();
  const loader: HarnessLoader = TestbedHarnessEnvironment.loader(fixture);
  const helper = harnessHelper(loader);
  return { fixture, component, mockRef, loader, helper } as const;
}

const CONFIRM_DEFAULT: ConfirmDialogData = {
  message: undefined as unknown as string,
  html: undefined as unknown as string,
  type: undefined as unknown as any
};

const CONFIRM_MESSAGE: ConfirmDialogData = {
  message: 'Plain text confirmation message',
  html: undefined as unknown as string,
  type: 'confirm'
};

const CONFIRM_HTML: ConfirmDialogData = {
  message: undefined as unknown as string,
  html: '<strong>HTML message</strong>',
  type: 'confirm'
};

const CONFIRM_BOTH: ConfirmDialogData = {
  message: 'Should prefer this message',
  html: '<em>Should not be used</em>',
  type: 'confirm'
};

const INFO_DATA: ConfirmDialogData = {
  message: 'Informational note',
  html: undefined as unknown as string,
  type: 'info'
};

const ERROR_DATA: ConfirmDialogData = {
  message: 'Something went wrong',
  html: undefined as unknown as string,
  type: 'error'
};
