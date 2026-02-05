---
description: prompt the test-implementor to implement a spec file with a reminder of what it should look for.
agent: test-implementor
argument-hint: remember to include the spec file in the context
---
There is a new test suite (a `.spec.ts` file) ready for implementation ! Can you take care of it ? 

A few reminders:
- read the code under test and the spec file before proceeding;
- apply testids where relevant;
- use the [entity factories](../../src/_testhelpers/factories.ts) to create simple entities;
- remember to preserve the original comments that describe each test: do not erase them! Your code should begin right below them however, in the body of the same method.

Well, your turn now! Good luck!