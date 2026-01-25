# Goal

Gegerator is web application for helping the user design a planning for the Gerardmer movie festival, so they can watch as many movie they want to see as possible during their stay.

# Concepts

Over the course of the festival, each Movie is shown in at least one, and generally several Sessions. A Session says in which Theater (a place) and at which time (a start time) a given Movie will be shown. 

Users express preferences for Movies and Sessions by rating them. Ratings range from extremely positive to outright ban. A MovieRating applies to the Movie in general while an EventRating applies to only a specific Session. Combining both allows for expressing things like "I really want to see that Movie, just not in that particular Session", or "I don't really care about that Movie, but Thursday afternoon I have nothing better to do". 

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
An algorithm will propose a FestivalRoadmap, accounting for:
- Movie and Event ratings,
- time constraints, including time for traveling from one Theater to the next,
- a Movie can be scheduled at most once,
- other general tuning options (Theater rating, movie/theater bias, all optional)

The Users and the Wizard iterate over the solution, respectively by adjusting ratings (eg manually pinning or banning Events) and recomputing solution according to these adjustments. The Wizard automatically reproposes a solution when a parameter changes. The process ends when the Users are satisfied with the end result.


# Interface

Gerardmer having an almost exclusively french audience, the interface is in french only. I  typed this documentation in Globish just because of habits.

## Event rendering and color codes

Movie and Session ratings visually affects how Events are rendered in the interface, to emphasize how important (or unimportant) they are. The rendering depends on the operating mode: it is not the same in Manual or Wizard mode. 

In Manual mode, the rendering depends on the Movie Rating and Event Rating. Content color depend on the Movie Rating and boder color on the Event Rating.

In Wizard mode, the rendering depends on whether a particular event has been selected by the algorithm or not. Sessions selected for a particular Movie are prominently highlighted, and all other Sessions for the same movies are disabled. Other Events (Sessions or OtherActivities) are not affected and use the Manual mode rendering.

# Implementation details
## About the Wizard algorithm
### Description
It is essentially a graph-based score-maximization algorithm under constraints. 

Events are assigned a score that depend on various parameters: movie rating, event rating, theater rating, weighted by a bias depending on whether Users put Movies first, or Theaters first (some are really comfy to take a nap !) 

The constraints are:
- two Events are incompatible if their start and end time overlap,
- those time constraint include traveiling time between Theaters,
- a Movie can be planned at most once.

The events are then modeled as a graph, where events are (weighted by score) nodes, and an edge exists between two nodes if they are compatible timing-wise. The algorithm then looks for the path having the maximum cumulative score, discarding paths with Movies planned twice or more.

### Discussion
Due to the huge solution space, it cannot find the absolute optimum in a reasonable time. For a typical Gerardmer grid over a four day, the combinatorial is about 10^17 (as of year 2026 the festival now goes for five days). Speed has been favored over accuracy so the Users have an immediate feedback when they adjust their ratings. 

The tradeoffs are the following:
- only the 64 top scores Events (depending on Ratings) are considered,
- events earlier in the week tend to be favored due to its internal working ("greediness").

In the litterature, the best approximation I could come with would be: "longest path in a tropical graph with at most one color for each". However there is no such algorithm so I had to roll out my own. I have considered other ways to model the problem but I don't have the skills to apply them. Still, if someone has a better idea I will welcome it !
