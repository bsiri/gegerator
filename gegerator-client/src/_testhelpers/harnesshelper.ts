import { BaseHarnessFilters, ComponentHarness, HarnessLoader, HarnessPredicate } from "@angular/cdk/testing"
import { MatOptionHarness } from "@angular/material/core/testing"
import { MatErrorHarness, MatFormFieldHarness } from "@angular/material/form-field/testing"
import { MatSelectHarness } from "@angular/material/select/testing"
import { MatInputHarness } from "@angular/material/input/testing"
import { MatButtonHarness } from "@angular/material/button/testing"
import { MatAutocompleteHarness } from "@angular/material/autocomplete/testing"
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
        error: async (testid?: ClassTestId) => {
            if (testid === undefined){
                return loader.getHarness(MatErrorHarness)
            }
            return loader.getHarness(MatErrorHarness.with(selid(testid)))
        },
        getDbgElement: async(arg: ClassTestId | ComponentHarness): Promise<DebugElement> => {
            if (typeof(arg) === 'string'){
                // taping in the hidden api but hmm sometimes you have to
                return (loader as any)._fixture.debugElement.query(
                    By.css('.testid-'+arg)
                ) 
            }
            else {
                const asHarness: ComponentHarness = arg 
                const elt = await asHarness.host()
                const eltclasses = await elt.getAttribute('class') || ''
                return (loader as any)._fixture.debugElement.query(
                    By.css(eltclasses)
                ) 
            }
        }
    }
}