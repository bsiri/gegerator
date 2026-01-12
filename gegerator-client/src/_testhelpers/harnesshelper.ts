import { BaseHarnessFilters, ComponentHarness, HarnessLoader } from "@angular/cdk/testing"
import { MatOptionHarness, OptionHarnessFilters } from "@angular/material/core/testing"
import { FormFieldHarnessFilters, MatErrorHarness, MatFormFieldControlHarness, MatFormFieldHarness } from "@angular/material/form-field/testing"
import { MatSelectHarness, SelectHarnessFilters } from "@angular/material/select/testing"
import { MatInputHarness } from "@angular/material/input/testing"
import { ButtonHarnessFilters, MatButtonHarness } from "@angular/material/button/testing"
import { By } from "@angular/platform-browser"
import { DebugElement } from "@angular/core"

/**
 * Name of the testid for the input, that will be looked-up in the css.
 * The expected css classname is "testid-{your testid}".
 * Note: under the hood this type is actually a string.
 */
export type ClassTestId = string

export function harnessHelper(loader: HarnessLoader){
    function sel(testid: ClassTestId){
        return {selector: ".testid-"+testid}
    }
    return {
        select: async (testid: ClassTestId) => {
            return loader.getHarness(MatSelectHarness.with(sel(testid)))
        },
        option: async (testid: ClassTestId) => {
            return loader.getHarness(MatOptionHarness.with(sel(testid)))
        },
        text: async (testid: ClassTestId) => {
            return loader.getHarness(MatInputHarness.with(sel(testid)))
        },
        button: async (testid: ClassTestId) => {
            return loader.getHarness(MatButtonHarness.with(sel(testid)))
        },
        formfield: async (testid: ClassTestId) => {
            return loader.getHarness(MatFormFieldHarness.with(sel(testid)))
        },
        error: async (testid: ClassTestId) => {
            return loader.getHarness(MatErrorHarness.with(sel(testid)))
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