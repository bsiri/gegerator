Hello, I need to consult you for a new feature, that will help the user to input new data faster (in particular, create sessions). 

The use-case shall now be named "Create a Session".

# Current state of the app regarding the use case "Create a Session"

## Purpose
The SessionDialog is a dialog that let the user add a new PlannedMovieSession. A PlannedMovieSession is a data that groups together:
* what Movie will be shown, 
* in which Theater,
* which Day, 
* which Time in that Day.

## User flow
The user flow is as follow:
1. The user opens the dialog
2. The user use the first control to select a Movie. Currently it is a text field with autocomplete that use the list of available Movie as datasource.
3. Then the user selects a Theater, using a dropdown menu.
3. Then the user selects a Day, using a dropdrown menu.
4. Then the user inputs a time.
5. Finally the user submits by clicking the Add button. The data are asembled in a PlannedMovieSession then sent to the server.
6. On success, the form is reset and ready for a new inputs.
7. Once the user is satisfied, she can close the dialog using the Close button.

## Implementation

The dialog is a Material Dialog that is controlled by SessionSectionComponent. What happens under the hood:
1. When the user clicks on the Add button, the dialog closes and returns the new PlannedMovieSession instance. 
2. SessionSectionComponent subscribe to the afterClose observable in order to get a handle on that instance.
3. SessionSectionComponent invokes a service to post the instance to the server.
4. On successful transaction with the sever, SessionSectionComponent opens a new SessionDialog (giving the illusion of a reset).

## References:
See:
* [SessionDialog](../src/app/components/sessions/sessiondialog/sessiondialog.component.ts)
* [SessionSectionComponent](../src/app/components/sessions/session-section/session-section.component.ts)

# Why this flow is a problem
The User has to take a lot of actions in order to complete the use case, even more so if she has to switch back and forth between the keyboard and mouse. However, there are lots of session to be created (typically between 60 and 100) and it quickly becomes tedious.

Also the implementation is not clean because it is technically closed then opened again. At the moment the dialog does its own data validation. However if the server rejects the new PlannedMovieSession for validation reason, the User will have no chance to correct the input data because the dialog has already closed (she is still notified by separate mechanisms).

# New feature : Turbo Session Create
To address those shortcomings, I need a new Dialog Component to streamline the creation of session en-masse.

## User flow
The User will type all informations in a Dialog with one single text field. The Dialog will then tokenize the inputs, and perform (partial, lowercase) matches on those token to see if they fit a Movie title, a Theater, a Day and a Time. If an non-ambiguous match is possible, a summary will appear below detailing what matched and the Add button will be enabled. On submit, the resulting PlanedMovieSession is sent to the server and the forms resets. Once the user is done, she can close the dialog with a Close button.

## Implementation
There are two parts to consider: the Dialog, and how it integrates with SessionDialogComponent.

The dialog should not return the created instances of PlannedMovieSession by returning it as an argument of its 'close()' method, but by some other decoupled mechanism: maybe by emitting events, or using a callback supplied as data. I would avoid direct injection of the service however as the Dialog must remain as agnostic as possible to how it is integrated.

The SessionSectionComponent that handles the Dialog is composed of one table per day. The header of each table is composed of one main header with the Day name, and 5 subheaders (4 theaters + 1 extra column for the OtherActivities). The SessionSectionComponent should display in the interface one button in each day header: this is convenient for the user because they are sticky, so she won't have to scroll back and forth to click the button.
Aside from this, the handling will be pretty much the same as for the existing SessionDialog.

## Notes
It is a *new* feature: it does not replace the existing dialog. Keep the existing code, just add the new code as required.