import { BaseHarnessFilters, ComponentHarness, HarnessLoader, HarnessPredicate } from "@angular/cdk/testing"
import { MatOptionHarness } from "@angular/material/core/testing"
import { MatErrorHarness, MatFormFieldHarness } from "@angular/material/form-field/testing"
import { MatSelectHarness } from "@angular/material/select/testing"
import { MatInputHarness } from "@angular/material/input/testing"
import { MatButtonHarness } from "@angular/material/button/testing"
import { MatAutocompleteHarness } from "@angular/material/autocomplete/testing"
import { MatSliderHarness, MatSliderThumbHarness } from "@angular/material/slider/testing"
import { By } from "@angular/platform-browser"
import { DebugElement } from "@angular/core"
import { MatRadioGroupHarness } from "@angular/material/radio/testing"

/**
 * Name of the testid for the input, that will be looked-up in the css.
 * The expected css classname is "testid-{your testid}".
 * Note: under the hood this type is actually a string.
 */
export type ClassTestId = string

export function harnessHelper(loader: HarnessLoader){
    function selid(testid: ClassTestId){
        return {selector: ".testid-"+testid}
    }
    return {
        // ******** harness getters ********
        select: async (testid?: ClassTestId) => {
            if (testid === undefined){
                return loader.getHarness(MatSelectHarness)
            }
            return loader.getHarness(MatSelectHarness.with(selid(testid)))
        },
        option: async (testid?: ClassTestId) => {
            if (testid === undefined){
                return loader.getHarness(MatOptionHarness)
            }
            return loader.getHarness(MatOptionHarness.with(selid(testid)))
        },
        text: async (testid?: ClassTestId) => {
            if (testid === undefined){
                return loader.getHarness(MatInputHarness)
            }
            return loader.getHarness(MatInputHarness.with(selid(testid)))
        },
        autocomplete: async(testid?: ClassTestId) => {
            if (testid === undefined){
                return loader.getHarness(MatAutocompleteHarness)
            }
            return loader.getHarness(MatAutocompleteHarness.with(selid(testid)))
        },
        button: async (testid?: ClassTestId) => {
            if (testid === undefined){
                return loader.getHarness(MatButtonHarness)
            }       
            return loader.getHarness(MatButtonHarness.with(selid(testid)))
        },
        radiogroup: async (testid?: ClassTestId) => {
            if (testid === undefined){
                return loader.getHarness(MatRadioGroupHarness)
            }       
            return loader.getHarness(MatRadioGroupHarness.with(selid(testid)))
        },
        formfield: async (testid?: ClassTestId) => {
            if (testid === undefined){
                return loader.getHarness(MatFormFieldHarness)
            }
            return loader.getHarness(MatFormFieldHarness.with(selid(testid)))
        },
        slider: async (testid?: ClassTestId) => {
            if (testid === undefined){
                return loader.getHarness(MatSliderHarness)
            }
            return loader.getHarness(MatSliderHarness.with(selid(testid)))
        },
        sliderThumb: async (testid?: ClassTestId) => {
            if (testid === undefined) {
                return loader.getHarness(MatSliderThumbHarness)
            }
            return loader.getHarness(MatSliderThumbHarness.with(selid(testid)))
        },
        error: async (testid?: ClassTestId) => {
            if (testid === undefined){
                return loader.getHarness(MatErrorHarness)
            }
            return loader.getHarness(MatErrorHarness.with(selid(testid)))
        },

        // ******** other utilities ********
        /**
         * Simulate selecting files on a native <input type="file"> element.
         * - `inputOrTestId` may be a testid (string) matching the `.testid-...` class
         *   or a native `HTMLInputElement`.
         * - `files` is an array of `File` objects to set on the input.
         */
        simulateFileInput: async (inputOrTestId: ClassTestId | HTMLInputElement, files: File[]) => {
            let inputEl: HTMLInputElement
            if (typeof inputOrTestId === 'string'){
                const dbg = (loader as any)._fixture.debugElement.query(By.css('.testid-'+inputOrTestId))
                if (!dbg) throw new Error('element not found for testid: '+inputOrTestId)
                inputEl = dbg.nativeElement as HTMLInputElement
            } else {
                inputEl = inputOrTestId
            }

            // Minimal FileList-like shape for test environments (built without object spread
            // to avoid duplicate-property diagnostics in some editors/linters)
            const fileListObj: any = {}
            for (let i = 0; i < files.length; i++) {
                fileListObj[i] = files[i]
            }
            fileListObj.length = files.length
            fileListObj.item = (i: number) => fileListObj[i]
            const fileList = fileListObj as unknown as FileList
            Object.defineProperty(inputEl, 'files', { value: fileList })
            inputEl.dispatchEvent(new Event('change', { bubbles: true }))
            // allow the fixture to process the change if available
            if ((loader as any)._fixture && (loader as any)._fixture.whenStable) {
                await (loader as any)._fixture.whenStable()
            }
            return inputEl
        },
        /**
         * Click a Material button identified by testid (convenience wrapper).
         */
        clickByTestId: async (testid: ClassTestId) => {
            const btn = await loader.getHarness(MatButtonHarness.with(selid(testid)))
            return btn.click()
        },
    }
}