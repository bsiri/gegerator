Hello, I need to consult you for a new feature, that will export the MovieSession planned in the current FestivalRoadmap in a specific order. It is similar to another existing feature, that export the Roadmap (more on this later).

That new feature is named "Export the Booking plan", or in french : "Exporter le plan de réservation".

# New feature : "Export the Booking plan"

The new feature allows the User to download a human-readable document that lists the Movie Sessions in the recommended order for booking the seats as efficiently as possible.

## Context

At a general level, the goal of the application is to help the User to design a Roadmap for a movie festival. The Roadmap consists of the list of movie sessions, and other activities beside movies, that the User plans to attend to. The application already have a feature to export (ie, allows the User to download) the Roadmap, in which the different events are listed in chronological order.

However, planning is not enough. Before the Festival begins, the User also have to book her seat for each of the Movie Sessions. Booking the seats is challenging, because as soon as the booking web portal opens at the specified day and time, many other festival goers everywhere in the country are also competing for the same seats at the very same moment. Available seats for popular sessions are typically exhausted within minutes. It is a very stressful step, and the User might make costly mistakes if she comes unprepared to the portal.

Thus, in order to be as efficient as possible while booking the seats, these must be processed in a specific order; from the most contended first to the least contended later. Thanks to many years of experience with going through this ordeal, our experts have identified a simple yet reliable enough order in which the portal should be visited. 

Your task is to implement an export function that enumerate the movie sessions in that order. The details are explained below.

## User flow
In the main toolbal, the User unrolls the menu "Exporter > Exporter le plan de réservation". On click, this triggers automatically the download of a file name "gegerator-reservation.txt".

The menu button is a new menu entry in the "Exporter" menu button, that comes after "Exporter la roadmap".

## Format of the file "gegerator-reservation"
It is pretty similar to the file created by the regular export of the Roadmap. Example layout below:

```
=== Plan de réservation ===

SAMEDI

    Espace Lac  10h00   CADET
    Espace Lac  14h30   COLD STORAGE

    Casino      18h30   SILENCE
    Casino      11h00	WELCOME HOME BABY

    MCL         09h30   HOLD THE FORT
    MCL         14h00	JUNK WORLDMCL         

    Casino  	11h00	MOTHER'S BABY
    Casino	    14h30	THE WEED EATERS
    Casino		20h00	DON'T LEAVE THE KIDS ALONE

VENDREDI
[...]

DIMANCHE
[...]

JEUDI
[...]

MERCREDI
[...]

```

You will notice the following structure:
- sessions are grouped by days
- however, *days are enumerated in non-standard order*. The most efficient order is : samedi, vendredi, dimanche, jeudi, mercredi.
- within a day, sessions are enumerated grouped by theater. 
- The theaters *are also enumerated in non-standard order*. The most efficient order is : Espace Lac, Casino, MCL, Paradiso.

You can infer the format from the example above. Examples of desired format features:
- sessions are indented with one level of tabulation
- theaters session lists are separated with one blank line.
- days are capitalized
- movies are capitalized

## Code guidelines

First, it is absolutely critical that you respect these specified days and theater ordering. As such, ban the usage of `Days.enumerate()` and `Theaters.enumerate()`.

Second, only `PlannedMovieSession` should be mentionned in the result file. `OtherActivities` do not require booking and as such needs not to be included.

The following resources will be useful to you:
* [The top-level component App](../src/app/app.component.ts), and its companion html template : the menu where the new item should be created is defined there. It is also where you will find the code for `exportRoadmap()`, which is similar in the way it works.
* [FestivalRoadmap](../src/app/models/roadmap.model.ts) : This is the model for the roadmap, in which you can find the list of `PlannedMovieSession` you have to format. You should also inspect the definition of this class.


Well, that is all. This is a simple enough feature, I am sure you will manage. Good luck !