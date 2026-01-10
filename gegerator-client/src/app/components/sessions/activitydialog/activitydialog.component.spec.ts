import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Activitydialog } from './activitydialog.component';
import { Days } from 'src/app/models/referential.data';
import { Times } from 'src/app/models/time.utils';
import { OtherActivity } from 'src/app/models/activity.model';

describe('Activitydialog', () => {
  let dialogRefStub: any;

  beforeEach(() => {
    dialogRefStub = { close: vi.fn() };
  });

  function sampleActivity(id?: number): OtherActivity {
    return ({
      id,
      day: Days.WEDNESDAY,
      startTime: Times.fromString('9h00'),
      endTime: Times.fromString('10h00'),
      description: 'a test activity'
    } as unknown) as OtherActivity;
  }

  it('should instantiate and set create mode when id is undefined', () => {
    const comp = new Activitydialog(dialogRefStub as any, sampleActivity(undefined));
    expect(comp).toBeTruthy();
    expect(comp.mode).toBe('create');
  });

  it('confirm() should close dialog with an OtherActivity when form is valid', () => {
    const comp = new Activitydialog(dialogRefStub as any, sampleActivity(1));
    // form is initialized with valid values in constructor
    comp.confirm();
    expect(dialogRefStub.close).toHaveBeenCalled();
    const closedArg = dialogRefStub.close.mock.calls[0][0];
    expect(closedArg).toHaveProperty('id', 1);
    expect(closedArg).toHaveProperty('description', 'a test activity');
  });

  it('cancel() should close dialog without args', () => {
    const comp = new Activitydialog(dialogRefStub as any, sampleActivity(2));
    comp.cancel();
    expect(dialogRefStub.close).toHaveBeenCalled();
    const args = dialogRefStub.close.mock.calls[0];
    expect(args.length).toBe(0);
  });

  it('validateTime() returns error for invalid string', () => {
    const comp = new Activitydialog(dialogRefStub as any, sampleActivity(3));
    const fakeCtrl: any = { value: 'invalid-time' };
    const res = comp.validateTime(fakeCtrl as any);
    expect(res).not.toBeNull();
  });

});
