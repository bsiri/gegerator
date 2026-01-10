# Version 1.1.1

- Added timeline marker in the main view, to give better visual cue on the passing of time.
- Cosmetics and bugfixes
- Security fixes mostly by upgrading to Angular 21.
- When running with `--spring.profiles.active=dev`, exposes the H2 console at `http://localhost:8082`. Note meant for
    production of course.

# Version 1.1.0

- Added Wednesday as a full day (since Gerardmer edition 2026)
- Updated the travel time constraints between theaters
- Create Dialogs: the "OK" button has been renamed to "Next", and will automatically reopen (unless closed with "Cancel")
- Create/Update Dialogs: pressing Enter will now submit the form if it is valid
- Bugfixes in the GUI