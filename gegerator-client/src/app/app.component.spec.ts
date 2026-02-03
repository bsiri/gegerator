import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { HarnessLoader } from '@angular/cdk/testing'
import { MatMenuHarness } from '@angular/material/menu/testing'
import { MatSidenavHarness } from '@angular/material/sidenav/testing'
import { MatDialog } from '@angular/material/dialog'
import { provideMockStore } from '@ngrx/store/testing'
import { NO_ERRORS_SCHEMA, signal, Signal, WritableSignal } from '@angular/core'
import { describe, it, beforeEach, expect, vi } from 'vitest'
import { harnessHelper } from 'src/_testhelpers/harnesshelper'
import { MemoizedSelector, Store } from '@ngrx/store'
import { RoadmapStore } from './ngrx/stores/roadmap.store'
import { RoadmapService } from './services/roadmap.service'
import * as factories from 'src/_testhelpers/factories'
import { FestivalRoadmap, RoadmapAuthor } from 'src/app/models/roadmap.model'

import { AppComponent } from './app.component'
import { Mode } from './ngrx/appstate-models/mode.model'
import { TheaterRating, TheaterRatings, WizardConfiguration } from './ngrx/appstate-models/wizardconfiguration.model'
import { Movie } from './models/movie.model'
import { ConfigDialog } from './components/configuration/configdialog/configdialog.component'
import { UploadDialog } from './components/appstate/uploaddialog/uploaddialog.component'
import { AppStateActions } from './ngrx/actions/appstate.actions'
import { selectConfiguration } from './ngrx/selectors/configuration.selectors'

/*
  Implementation notes / helpful references for the test implementor:

  - use the test data factories in: src/_testhelpers/factories.ts
    This file provides `defaultMovie`, `defaultSession`, and other helpers
    to create realistic `FestivalRoadmap` / event instances.

  - use harness helpers in: src/_testhelpers/harnesshelper.ts
    This file contains testbed/harness setup utilities to simplify Material
    `MatMenu`/`MatSidenav`/`MatDialog` interactions in UI tests.

  Consult those two files when implementing the UI and unit tests below.
*/

describe('AppComponent — UI tests (harnesses)', () => {
  let fixture: ComponentFixture<AppComponent>
  let loader: HarnessLoader

  // signals for AppComponent
  let modeSignal: WritableSignal<Mode>
  let roadmapSignal: WritableSignal<FestivalRoadmap>
  let configSignal: WritableSignal<WizardConfiguration>
  let mockDialog: any


  beforeEach(async () => {
    modeSignal = signal(Mode.WIZARD)
    roadmapSignal = signal(sampleRoadmap())
    configSignal = signal(sampleConfiguration())


    mockDialog = { open: vi.fn(() => ({ afterClosed: () => ({ subscribe: () => {} }) })) }
    const mockConfigStore = {
      dispatch: vi.fn(),
      selectSignal: (selector: any) => {
        if (selector === selectConfiguration) return configSignal
        // default [] signal for other selectors
        return signal<any[]>([])
      }
    }
    // build a minimal, realistic roadmap using test factories
    const mockRoadmapStore = { 
        $mode: modeSignal, 
        $activeRoadmap: roadmapSignal, 
        toggleMode: () => {
            const newmode = (modeSignal() === Mode.MANUAL) ? Mode.WIZARD : Mode.MANUAL
            modeSignal.set(newmode)
        }
        
    }
    const mockRoadmapService = {}

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: MatDialog, useValue: mockDialog },
        { provide: Store, useValue: mockConfigStore },
        { provide: RoadmapStore, useValue: mockRoadmapStore },
        { provide: RoadmapService, useValue: mockRoadmapService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents()

    fixture = TestBed.createComponent(AppComponent)
    loader = TestbedHarnessEnvironment.loader(fixture)
    await fixture.whenStable()
  })

  it('should create the component and render header with Mode-dependent class', async () => {
    /*
      Goal of the test: ensure AppComponent is created and the title element
      receives the 'neon' class when `$wizardmode()` corresponds to `Mode.WIZARD`.

      Synopsis:
      - given: a TestBed with AppComponent and a mocked RoadmapStore/$wizardmode signal
      - when: component is instantiated with `$wizardmode()` === Mode.WIZARD
      - then: the element with id `app-title` contains the class `neon`

      Desired tests and assertions:
      1. the component fixture is created
      2. query the DOM for `#app-title` and assert it has `neon` class
      3. update the mocked `$wizardmode()` to Mode.MANUAL and assert class is removed

    */
    await fixture.whenStable()

    const titleEl: HTMLElement | null = fixture.nativeElement.querySelector('#app-title')
    expect(titleEl).not.toBeNull()
    expect(titleEl!.classList.contains('neon')).toBe(true)

    // simulate mode change to MANUAL and ensure the class is removed
    modeSignal.set(Mode.MANUAL) 
    await fixture.whenStable()
    expect(titleEl!.classList.contains('neon')).toBe(false)
  })

  it('should toggle the sidenavs when header buttons are clicked', async () => {
    /*
      Goal of the test: verify the template-driven sidenav toggles via the
      `appmovie.toggle()` and `appsummary.toggle()` template references.

      Synopsis:
      - given: rendered component with MatSidenav harnesses for the two sidenavs
      - when: click the "< Films" button and the "Résumé >" button
      - then: assert the corresponding sidenav open state changes

      Desired tests and assertions:
      1. locate the two buttons in the header and click them (use harness or DOM)
      2. use `MatSidenavHarness` to assert the matched sidenav `isOpen()` toggles

      Important: interact with the UI (click), do not call `toggle()` programmatically.
    */
    await fixture.whenStable()

    // locate the two header buttons by position inside the button bar
    const btns: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('#app-buttonbar button')
    const movieBtn = btns[0]
    const summaryBtn = btns[1]

    // harnesses for the two sidenavs
    const movieSidenav = await loader.getHarness(MatSidenavHarness.with({ selector: '#app-movie' }))
    const summarySidenav = await loader.getHarness(MatSidenavHarness.with({ selector: '#app-summary' }))

    // initially closed
    expect(await movieSidenav.isOpen()).toBe(false)
    expect(await summarySidenav.isOpen()).toBe(false)

    // open movie sidenav
    movieBtn.click()
    await fixture.whenStable()
    expect(await movieSidenav.isOpen()).toBe(true)

    // open summary sidenav
    summaryBtn.click()
    await fixture.whenStable()
    expect(await summarySidenav.isOpen()).toBe(true)

    // toggle movie sidenav closed again
    movieBtn.click()
    await fixture.whenStable()
    expect(await movieSidenav.isOpen()).toBe(false)
  })

  it('should display correct label in Mode menu depending on current mode', async () => {
    /*
      Goal: ensure the menu item text shows "Activer l'assistant" when in MANUAL
      and "Désactiver l'assistant" when in WIZARD.

      Synopsis:
      - given: component with `$wizardmode()` mocked to Mode.MANUAL and Mode.WIZARD
      - when: open the Mode menu (use `MatMenuHarness`)
      - then: assert menu item text matches expected localized strings

      Desired tests and assertions:
      1. open menu and read the first menu item's text for MANUAL
      2. change mocked signal to WIZARD, re-open menu and assert text changes
    */
    await fixture.whenStable()
    const helper = harnessHelper(loader)

    const menu = await loader.getHarness(MatMenuHarness.with({ triggerText: 'Mode' }))

    await menu.open()
    // const toggleBtn = await helper.menuitem('app-toggle-mode')
    const toggleBtn = (await menu.getItems())[0]

    // initial state: WIZARD -> label should be 'Désactiver l'assistant'
    expect(await toggleBtn.getText()).toBe("Désactiver l'assistant")

    // change to MANUAL by clicking the toggle menu item using harnessHelper
    await toggleBtn.click()
    await fixture.whenStable()

    // The label should now have changed
    expect(await toggleBtn.getText()).toBe("Activer l'assistant")
    await menu.close()
  })

  it('should open configuration dialog from menu and pass a copy of the wizconf', async () => {
    /*
      Goal: ensure clicking "Configurer l'assistant..." opens `ConfigDialog` with
      a copy of the current wizard configuration.

      Synopsis:
      - given: a mocked `MatDialog` spy and a known `$wizconf()` value
      - when: user opens the Mode menu and clicks the menu item
      - then: `MatDialog.open` is called with `ConfigDialog` and `data` equals a copy

      Desired tests and assertions:
      1. use the harness to open menu and click the menu item
      2. assert `MatDialog.open` was called once
      3. assert the `data` argument is deeply equal to `$wizconf().copy()` but not the same reference

      Note: this is a UI-level test — perform a real click on the menu item.
    */
    await fixture.whenStable()

    const menu = await loader.getHarness(MatMenuHarness.with({ triggerText: 'Mode' }))
    await menu.open()

    let cfgBtn = (await menu.getItems())[1]

    // click it
    await cfgBtn.click()
    await fixture.whenStable()

    // assert dialog was opened with ConfigDialog and a copied configuration
    expect(mockDialog.open).toHaveBeenCalled()
    const callArgs = mockDialog.open.mock.calls[0]
    expect(callArgs[0]).toBe(ConfigDialog)
    const options = callArgs[1]
    expect(options).toHaveProperty('data')
    const original = configSignal()
    const expectedCopy = original.copy()
    expect(options.data).toEqual(expectedCopy)
    expect(options.data).not.toBe(original)
    await menu.close()
  })

  it('should open upload dialog from Save/Load menu and dispatch upload when a file is returned', async () => {
    /*
      Goal: verify the Save/Load menu opens UploadDialog and that when the dialog
      closes with a `File` the component dispatches the upload action.

      Synopsis:
      - given: mocked `MatDialog.open` returning an afterClosed() observable
      - when: user opens the Save/Load menu and clicks "Charger"
      - then: dialog open occurs and (separately) the component dispatches the upload action

      Desired tests and assertions:
      1. click the save/load menu item using harness
      2. assert `MatDialog.open` was invoked with `UploadDialog`
      3. simulate `afterClosed()` emitting a `File` and assert `Store.dispatch` called with `upload_appstate`

      Note: prefer to mock `MatDialog` for the dispatch assertion but interact with the menu for the UI part.
    */
    await fixture.whenStable()
    const helper = harnessHelper(loader)

    // prepare a mock file that the dialog will return
    const mockFile = new File(['{}'], 'state.json', { type: 'application/json' })

    // make the dialog.open return a dialogRef whose afterClosed subscribes with the file
    mockDialog.open = vi.fn(() => ({ afterClosed: () => ({ subscribe: (cb: any) => cb(mockFile) }) }))

    // find the Save/Load menu by selector and open it
    // const saveLoadMenu = await loader.getHarness(MatMenuHarness.with({ selector: '.testid-app-save-load' }))
    const saveLoadMenu = await helper.menu('app-save-load')
    await saveLoadMenu.open()
    const loadBtn = (await saveLoadMenu.getItems())[1]

    await loadBtn.click()
    await fixture.whenStable()

    // assert dialog opened with UploadDialog
    expect(mockDialog.open).toHaveBeenCalled()
    const openArgs = mockDialog.open.mock.calls[0]
    expect(openArgs[0]).toBe(UploadDialog)

    // assert the store received the upload action
    const store = TestBed.inject(Store) as any
    expect(store.dispatch).toHaveBeenCalledWith(AppStateActions.upload_appstate({ file: mockFile }))
    await saveLoadMenu.close()
  })

  it('should trigger roadmap export and create a download anchor', async () => {
    /*
      Goal: check `exportRoadmap()` produces a download anchor with `download == roadmap.txt`

      Synopsis:
      - given: a mocked `$roadmap()` that returns a FestivalRoadmap with deterministic dailyPlanning()
      - when: user clicks the Export -> "Exporter la Roadmap" menu item
      - then: a created anchor element has `download` set to 'roadmap.txt' and `href` contains encoded content

      Desired tests and assertions:
      1. intercept `document.createElement` or spy on the created anchor
      2. assert anchor.download === 'roadmap.txt'
      3. assert anchor.href includes `encodeURIComponent` of constructed planning string

      Note: this is a UI-triggered action — click the menu item rather than directly calling the method.
    */
    await fixture.whenStable()

    // spy on document.createElement to capture the created anchor
    const originalCreate = document.createElement.bind(document)
    let capturedAnchor: HTMLAnchorElement | null = null
    const createSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = originalCreate(tagName)
      if (tagName === 'a') {
        capturedAnchor = el as HTMLAnchorElement
      }
      return el
    })

    // open Export menu and click the 'Exporter la Roadmap' item
    const menu = await loader.getHarness(MatMenuHarness.with({ triggerText: 'Exporter' }))
    await menu.open()
    const exportBtn = (await menu.getItems())[0]
    await exportBtn.click()
    await fixture.whenStable()

    // assert an anchor was created and clicked
    expect(createSpy).toHaveBeenCalled()
    expect(capturedAnchor).not.toBeNull()
    expect(capturedAnchor!.download).toBe('roadmap.txt')
    expect(capturedAnchor!.href).toContain('data:application/octet-stream,')

    // the exported content should contain the movie title from the sample roadmap
    const sampleTitle = roadmapSignal().sessions[0].movie.title
    expect(capturedAnchor!.href).toContain(encodeURIComponent(sampleTitle))

    // restore
    createSpy.mockRestore()
    await menu.close()
  })

})

describe('AppComponent — Unit tests (component methods)', () => {
  let component: AppComponent
  let mockStore: any
  let mockDialog: any
  let mockRoadmapStore: any
  let mockRoadmapService: any

  beforeEach(() => {
    // configure lightweight injector-less component instance using plain mocks
    mockStore = {
      dispatch: vi.fn(),
      selectSignal: () => signal<any>([]) // default
    }

    mockDialog = { open: vi.fn(() => ({ afterClosed: () => ({ subscribe: () => {} }) })) }

    mockRoadmapService = {}

    mockRoadmapStore = {
      $mode: signal(Mode.WIZARD),
      $activeRoadmap: signal(sampleRoadmap()),
      toggleMode: vi.fn()
    }

    // create a component object without running Angular's injection (avoid inject())
    component = Object.create(AppComponent.prototype) as AppComponent
    ;(component as any).store = mockStore
    ;(component as any).dialog = mockDialog
    ;(component as any).roadmapService = mockRoadmapService
    ;(component as any).roadmapStore = mockRoadmapStore

    // Signals normally set in constructor
    ;(component as any).$wizconf = signal(sampleConfiguration())
    ;(component as any).$wizardmode = mockRoadmapStore.$mode
    ;(component as any).$roadmap = mockRoadmapStore.$activeRoadmap
  })

  it('ngOnInit should dispatch AppStateActions.reload_appstate', async () => {
    /*
      Goal: ensure `ngOnInit()` dispatches the reload action.

      Synopsis:
      - given: a mocked `Store` with a spy on `dispatch`
      - when: component.ngOnInit() is called
      - then: `Store.dispatch` was called with `AppStateActions.reload_appstate()`

      Desired tests and assertions:
      1. spy on `store.dispatch`
      2. call `component.ngOnInit()`
      3. assert dispatch was called with the expected action creator result
    */
    component.ngOnInit()
    expect(mockStore.dispatch).toHaveBeenCalledWith(AppStateActions.reload_appstate())
  })

  it('uploadAppState should dispatch upload_appstate when dialog returns a File', async () => {
    /*
      Goal: verify `uploadAppState()` opens the UploadDialog and dispatches upload when afterClosed emits a File.

      Synopsis:
      - given: `MatDialog.open` mocked to return `afterClosed()` observable that emits a File
      - when: call `component.uploadAppState()`
      - then: `Store.dispatch(AppStateActions.upload_appstate({file}))` is called

      Desired tests and assertions:
      1. mock `MatDialog.open` to return an object with `afterClosed: () => of(file)`
      2. call method and assert `store.dispatch` called with correct action payload
    */
    const mockFile = new File(['{}'], 'state.json', { type: 'application/json' })
    mockDialog.open = vi.fn(() => ({ afterClosed: () => ({ subscribe: (cb: any) => cb(mockFile) }) }))

    component.uploadAppState()

    expect(mockStore.dispatch).toHaveBeenCalledWith(AppStateActions.upload_appstate({ file: mockFile }))
  })

  it('openWizardConfiguration should dispatch ConfigurationActions.update_wizconf when dialog returns new conf', async () => {
    /*
      Goal: ensure `openWizardConfiguration()` opens `ConfigDialog` with a copy of wizconf and dispatches update on close.

      Synopsis:
      - given: `MatDialog.open` mocked to return `afterClosed()` observable that emits a new config
      - when: call `component.openWizardConfiguration()`
      - then: `Store.dispatch(ConfigurationActions.update_wizconf({wizconf: newconf}))` is called

      Desired tests and assertions:
      1. spy on `MatDialog.open` and `store.dispatch`
      2. call method and simulate dialog close with `newconf`
      3. assert dispatch called with expected action
    */
    const newconf = sampleConfiguration()
    mockDialog.open = vi.fn(() => ({ afterClosed: () => ({ subscribe: (cb: any) => cb(newconf) }) }))

    component.openWizardConfiguration()

    // lazy-check that dispatch was called with the expected configuration action
    const { ConfigurationActions } = await import('./ngrx/actions/configuration.actions')
    expect(mockStore.dispatch).toHaveBeenCalledWith(ConfigurationActions.update_wizconf({ wizconf: newconf }))
  })


  it('formatEventStr should strip the day prefix from PlannableEvent.toString()', async () => {
    /*
      Goal: unit-check `formatEventStr()` formatting behaviour.

      Synopsis:
      - given: a `PlannableEvent` stub whose `toString()` returns 'Lundi, 10h00 - Movie Title'
      - when: call `component.formatEventStr(event)`
      - then: returned string should start with spaces and not contain the day + comma prefix

      Desired tests and assertions:
      1. prepare a minimal stub object with `toString()` method
      2. call method and assert returned value equals expected transformed string
    */
    const ev = { toString: () => 'Lundi, 10h00 - Movie Title' }
    const out = component.formatEventStr(ev as any)
    expect(out).toBe('    10h00 - Movie Title')
  })

  it('toggleMode should delegate to RoadmapStore.toggleMode()', async () => {
    /*
      Goal: ensure `toggleMode()` calls the `toggleMode()` method on `RoadmapStore`.

      Synopsis:
      - given: a mocked `RoadmapStore` with a spy on `toggleMode`
      - when: call `component.toggleMode()`
      - then: `roadmapStore.toggleMode()` was invoked once

      Desired tests and assertions:
      1. spy on the method
      2. call component method
      3. assert spy was called
    */
    component.toggleMode()
    expect(mockRoadmapStore.toggleMode).toHaveBeenCalled()
  })


})


function sampleRoadmap(): FestivalRoadmap {
    const session = factories.defaultSession()
    const activity = factories.defaultActivity()
    return new FestivalRoadmap(RoadmapAuthor.HUMAN, [session], [activity])
}

function sampleConfiguration(): WizardConfiguration {
    return new WizardConfiguration(
        TheaterRatings.DEFAULT,
        TheaterRatings.DEFAULT,
        TheaterRatings.DEFAULT,
        TheaterRatings.DEFAULT,
        0.5
    )
}