import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UploadDialog } from './uploaddialog.component'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { By } from '@angular/platform-browser'
import { HarnessLoader } from '@angular/cdk/testing'
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { MatButtonModule } from '@angular/material/button'
import { harnessHelper } from 'src/_testhelpers/harnesshelper'

describe('UploadDialog - Component', () => {
    let component: UploadDialog

    beforeEach(() => {
        // instantiate with a minimal mock MatDialogRef
        component = new UploadDialog({ close: () => { } } as any)
    })

    it('should create the component', async () => {
        /*
          Goal of the test: verify the component can be instantiated without errors.
    
          Synopsis:
          - given: nothing special
          - when: the component is constructed in beforeEach
          - then: the component instance exists and default state is correct
    
          Desired tests and assertions:
          1. `component` is truthy
          2. `component.file` is initially `null`
        */
        expect(component).toBeTruthy()
        expect(component.file).toBeNull()
    })

    it('should set file when changeFile is called with files', async () => {
        /*
          Goal of the test: ensure `changeFile` stores the selected File.
    
          Synopsis:
          - given: a mock File instance
          - when: `changeFile` is invoked with an event containing a files list
          - then: `component.file` references that File
    
          Desired tests and assertions:
          1. After call, `component.file` is the same File instance
          2. Calling with an empty list leaves `component.file` unchanged or null
        */
        const f = mockFile

        // simulate input event with files array-like
        component.changeFile({ target: { files: [f] } } as any)
        expect(component.file).toBe(f)

        // calling with empty files should set file to null
        component.file = null
        component.changeFile({ target: { files: [] } } as any)
        expect(component.file).toBeNull()
    })

    it('should close the dialog with the file on confirm()', async () => {
        /*
          Goal of the test: verify `confirm()` calls `dialogRef.close` with the selected file.
    
          Synopsis:
          - given: a mock dialogRef with a spy on `close`, and `component.file` set to a File
          - when: `confirm()` is invoked
          - then: `dialogRef.close` is called once with the file as argument
    
          Desired tests and assertions:
          1. `close` called exactly once
          2. `close` called with the `component.file` value
        */
        const mockClose = vi.fn()
        component = new UploadDialog({ close: mockClose } as any)
        component.file = mockFile

        component.confirm()

        expect(mockClose).toHaveBeenCalledTimes(1)
        expect(mockClose).toHaveBeenCalledWith(mockFile)
    })

    it('should close the dialog without args on cancel()', async () => {
        /*
          Goal of the test: verify `cancel()` calls `dialogRef.close` with no arguments.
    
          Synopsis:
          - given: a mock dialogRef with a spy on `close`
          - when: `cancel()` is invoked
          - then: `dialogRef.close` is called once with no arguments
    
          Desired tests and assertions:
          1. `close` called exactly once
          2. `close` called with undefined or no parameter
        */
        const mockClose = vi.fn()
        component = new UploadDialog({ close: mockClose } as any)

        component.cancel()

        expect(mockClose).toHaveBeenCalledTimes(1)
        expect(mockClose.mock.calls[0].length).toBe(0)
    })

    // UI integration tests: TestBed rendering to check template binding for buttons
    describe('UploadDialog - Template', () => {
        let fixture: ComponentFixture<UploadDialog>
        let dialogRef: MatDialogRef<UploadDialog>
        let loader: HarnessLoader

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [MatDialogModule, MatButtonModule],
                providers: [{ provide: MatDialogRef, useValue: { close: vi.fn() } }]
            })
            fixture = TestBed.createComponent(UploadDialog)
            loader = TestbedHarnessEnvironment.loader(fixture)
            dialogRef = TestBed.inject(MatDialogRef)
            component = fixture.componentInstance
            fixture.detectChanges()
        })

        it('OK button is disabled when no file selected', async () => {
            await fixture.whenStable()
            const helper = harnessHelper(loader)
            const okBtn = await helper.button('uad-ok')
            expect(await okBtn.isDisabled()).toBe(true)
        })

        it('Cancel button triggers dialogRef.close without args', async () => {
            await fixture.whenStable()
            const helper = harnessHelper(loader)
            const cancelBtn = await helper.button('uad-cancel')

            await cancelBtn.click()
            await fixture.whenStable()

            const viClose = dialogRef.close as any
            expect(viClose).toHaveBeenCalled()
            expect(viClose.mock.calls[0].length).toBe(0)
        })

        it('selecting a file enables OK and confirm closes with the file', async () => {
            await fixture.whenStable()
            const helper = harnessHelper(loader)
            const okBtn = await helper.button('uad-ok')
            expect(await okBtn.isDisabled()).toBe(true)

            // simulate selecting a file via harness helper
            const f = mockFile
            await helper.simulateFileInput('uad-file', [f])
            fixture.detectChanges()
            await fixture.whenStable()

            expect(await okBtn.isDisabled()).toBe(false)

            await helper.clickByTestId('uad-ok')
            await fixture.whenStable()

            const viClose = dialogRef.close as any
            expect(viClose).toHaveBeenCalled()
            expect(viClose).toHaveBeenCalledWith(f)
        })
    })

    // Test data / mocks
    const mockFile = new File(['{}'], 'state.json', { type: 'application/json' })
})
