# About triggering keyup enter events

I have identified four ways to do that, keeping notes here in case I need them in the future. Pick one depending on the situation and elements you have at hand.

## Using the host element TestElement.sendKeys

Here `sendKeys` is normally used to simulate a serie of keystrokes, like would an user when inputing a new value. Indirectly this will trigger all related keyboard events.

This method belongs to the interface `TestElement` of `@angular/cdk`, which can be retrieved from a Harness instance via the host element. We only need to specify which key must be typed.

Sample code:
```typescript
const inputHarness = loader.getHarness(MatInputHarness)
const harnessHost: TestElement = await inputHarness.host()
await harnessHost.sendKeys(TestKey.ENTER)
```

## Direct trigger of the Angular listener using DebugElement.triggerEventHandler

The method `triggerEventHandler` is less portable because it does not fire an event; rather it invoke the event handler directly. The said handler must also have been bound by the (event) syntax in the element template, not programmatically. In short it is very Angular-specific.

This method belongs to the interface `DebugElement` of `@angular/core`. Conveniently we can use the Angular idiom 'keyup.enter' as a shorthand for a KeyboardEvent that happens to be 'Enter'. Also note that this one is not async.

Sample code:
```typescript
const dbgElt: DebugElement = fixture.debugElement.query(By.css('your selector'))
dbgElt.triggerEventHandler('keyup.enter')
```

## Angular wrapper around native event using TestElement.dispatchEvent

Angular also exposes a convenience wrapper around native Javascript events.

This method belongs to `TestElement` of package `@angular/cdk`, which can be accessed from an instance of a TestHarness by its host. The parameter are the type of event, and complementary data supplied as a plain object.

Sample code:
```typescript
const inputHarness = loader.getHarness(MatInputHarness)
const harnessHost: TestElement = await inputHarness.host()
await harnessHost.dispatchEvent('keyup', {key: "Enter"})
```

## Native javascript event using EventTarget.dispatchEvent

The most rugged and portable approach is probably using native javascript `dispatchEvent`, albeit a bit more verbose. 

This method belongs to the interface `EventTarget` from the standard javascript jdk. Its parameter is a standard javascript event. 


```typescript
const dbgElt: DebugElement = fixture.debugElement.query(By.css('your selector'))
const event = new KeyboardEvent('keyup', {key: "Enter"})
dbgElt.nativeElement.dispatchEvent(event)
```