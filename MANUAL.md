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
It is a score-maximization problem under constraints.

Events are assigned a score that depend on various parameters: movie rating, event rating, theater rating, weighted by a bias depending on whether Users put Movies first, or Theaters first (some are really comfy to take a nap !)

The constraints are:
- two Events are incompatible if their start and end time overlap,
- those time constraint include traveling time between Theaters,
- a Movie can be planned at most once.

Events with a score of zero or less are never planned.

In the literature this is known as the (weighted) Job Interval Selection Problem: each Movie is a job, each of its Sessions is an interval during which the job can be done, and at most one interval per job can be selected.

### Algorithm
The problem is NP-hard: the number of possible paths to evaluate for a typical Gerardmer grid is about 10^17, so they cannot be all examined. However, without the rule "a Movie can be planned at most once", it would be an easy problem: the events of a day are modeled as a graph, where events are (weighted by score) nodes, and an edge exists between two nodes if they are compatible timing-wise. The best roadmap is then the path having the maximum cumulative score, which is quick to compute.

The Wizard (class `BranchAndBoundPlanner`) leverages this with a branch-and-bound:
- the Movie rule is replaced by a toll to pay for each Movie planned. Whatever the tolls, the best path (tolls deduced) plus the sum of the tolls cannot be less than the score of the best valid roadmap: it is an upper bound. The tolls are adjusted until this bound is as low as possible (the technical name is "Lagrangian relaxation").
- each path computed along the way is turned into a valid roadmap by removing Movies planned twice and filling the holes. The best one is kept.
- when the bound equals the score of the best roadmap found, that roadmap is proven optimal. Otherwise the Wizard picks an event, and explores recursively both cases: the event is planned, or it is not.

In practice the bound is so close to the optimum that the answer is almost always proven optimal without exploring any case, within a millisecond for a typical grid.

See [PLANNER.md](PLANNER.md) for a detailed walkthrough: the maths, the refinements, how it maps to the code, and a Q/A.

### Discussion
The result is exact: no other roadmap has a better score (there may be several roadmaps with the same best score, though). There is no limit on the number of events.

Since the problem is NP-hard, a pathological grid could still take too long. For this reason the Wizard works with a time budget (1.5 second): when elapsed, it returns the best roadmap found so far. We could not trigger this with realistic grids, even ones much larger than the actual festival (300 sessions over 7 days).

Former attempts (exhaustive search, approximations) are still available in the package `planner.deprecated` (each one is labeled with its type, limits and speed), see `gegerator-jmh` for a comparison.
