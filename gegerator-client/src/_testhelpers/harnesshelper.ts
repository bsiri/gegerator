import { BaseHarnessFilters, HarnessLoader } from "@angular/cdk/testing"
import { MatOptionHarness, OptionHarnessFilters } from "@angular/material/core/testing"
import { FormFieldHarnessFilters, MatFormFieldControlHarness, MatFormFieldHarness } from "@angular/material/form-field/testing"
import { MatSelectHarness, SelectHarnessFilters } from "@angular/material/select/testing"
import { MatInputHarness } from "@angular/material/input/testing"
import { ButtonHarnessFilters, MatButtonHarness } from "@angular/material/button/testing"

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
        }
    }
}