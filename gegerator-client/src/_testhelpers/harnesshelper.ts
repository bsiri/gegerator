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

export function loaderHelper(loader: HarnessLoader){
  return {
    // MatSelect helper
    async withSelect(spec: SelectHarnessFilters| ClassTestId): Promise<MatSelectHarnessHelper>{
      const _sel = _toHarnessFilter(spec)
      const selectInput = await loader.getHarness(MatSelectHarness.with(_sel))

      return {
        getHarness: async() => {
            return selectInput
        },
        selectOption: async (optSelector) => {
            const _optsel = _toHarnessFilter(optSelector)
            await selectInput.open()
            await selectInput.clickOptions(_optsel)
        },
        getSelectedOption: async () => {
            const selected = await selectInput.getOptions({isSelected: true})
            return selected[0]
        }
      }
    },
    // Text field helper
    async withTextField(spec: FormFieldHarnessFilters | ClassTestId): Promise<TextFieldHarnessHelper>{
        const _sel = _toHarnessFilter(spec)
        const textField = await loader.getHarness(MatFormFieldHarness.with(_sel))
        return {
            getHarness: async () => {
                return textField
            },
            setText: async (text) => {
                /*
                Keeping this aside, could be handy if my other method 
                does not work
                const cl = await loader.getChildLoader(_sel.selector!)
                const ctrl = await cl.getHarness(MatInputHarness)
                await ctrl.setValue(text)
                */
                const host = await textField.host();
                const ctrl = (host as any).element.querySelector('input') as HTMLInputElement
                ctrl.value = text
            }
        }
    },
    // Button helper
    async withButton(spec: ButtonHarnessFilters | ClassTestId): Promise<ButtonHarnessHelper> {
        const _sel = _toHarnessFilter(spec)
    }
  }
}

function  _toHarnessFilter<T extends BaseHarnessFilters>(spec: T | ClassTestId) : T{
    if (typeof(spec) == 'string'){
        return {selector: ".testid-"+spec} as T
    } else {
        return spec
    }
}


export interface MatSelectHarnessHelper {
    getHarness(): Promise<MatSelectHarness>
    selectOption(selector: OptionHarnessFilters | ClassTestId): Promise<void>
    getSelectedOption(): Promise<MatOptionHarness>
}

export interface TextFieldHarnessHelper {
    getHarness(): Promise<MatFormFieldHarness>
    setText(text: string): Promise<void>
}

export interface ButtonHarnessHelper {
    getHarness(): Promise<ButtonHarnessFilters>
    click(): Promise<void>
}