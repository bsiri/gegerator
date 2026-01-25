# Goal

Gegerator is web application for helping the user design a planning for the Gerardmer movie festival, so they can watch as many movie they want to see as possible during their stay.

# Concepts

Over the course of the festival, each Movie is planned in several Sessions (at least once). A Movie has a title and a duration. A Session says in which Theater (a place) and at which time (a start time) a given Movie will be shown. 

Users express preferences for Movies and Sessions by rating them. Ratings range from extremely positive to outright ban. A MovieRating applies to the Movie in general while an EventRating applies to only a specific Session. It allows for expressing things like "I really want to see that Movie, just not in that particular Session". 

Aside from Sessions, the Users can also plan zero to several OtherActivity (lunch break, bar). OtherActivity have a start and end time. These can also be rated. 

Sessions and OtherActivites are collectively known as Events. 

The end goal of Gegerator is to create a FestivalRoadmap, which is the summary of all the Events that the Users have eventually decided to attend.

# Usage
The first phase is to input the raw data using the interface: create all the Movies, Sessions, and OtherActivities if any.

The second phase is the rating phase, where Users discuss among themselves and apply rates to Movies, Sessions and OtherActivites.

In a third phase they build their Roadmap. It can be done in two ways: manual or wizard mode, see below.

In a fourth phase, the Users export the Roadmap. Done !

## Manual mode
The Users manually pin an Event (ie, Session or OtherActivity) as their final choice by assigning them a rating "Mandatory". In manual mode, only Mandatory-rated Events will be included in the FestivalRoadmap.

## Wizard mode
An Wizard algorithm will propose a FestivalRoadmap, accounting for:
- Movie and Event ratings,
- time constraints, including time for traveling from one Theater to the next,
- a Movie can be scheduled at most once,
- other general tuning options (Theater rating, movie/theater bias, all optional)

The User and the Wizard iterate over the solution by adjusting ratings (eg manually pinning or banning Events) and recomputing solution according to these adjustments. The Wizard automatically reproposes a solution when a parameter changes. The process ends when the Users are satisfied with the end result.


# Interface

## Event rendering and color codes

Movie and Session ratings visually affects how Events are rendered in the interface, to emphasize how important (or unimportant) they are. The rendering depends on the operating mode: it is not the same in Manual or Wizard mode. 

In Manual mode, the rendering depends on the Movie Rating and Event Rating. Content color depend on the Movie Rating and boder color on the Event Rating.

In Wizard mode, the rendering depends on whether a particular event has been selected by the algorithm or not. Sessions selected for a particular Movie are prominently highlighted, and all other Sessions for the same movies are disabled. Other Events (Sessions or OtherActivities) are not affected and use the Manual mode rendering.

## About the Wizard algorithm
Due to the huge solution space, it cannot find the absolute optimum in a reasonable time. Speed has been favored over accuracy so the Users has an immediate feedback when they adjust their ratings. The tradeoffs are the following:
- only the 64 top scores Events (depending on Ratings) are considered,
- sessions earlier in the week tend to be favored due to its internal working ("greediness").