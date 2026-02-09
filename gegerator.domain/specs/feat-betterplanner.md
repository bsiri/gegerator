# Feature: Better Planner

Hello, this time I have a challenge for you: I need you to implement a planning optimizer. This document will give you the context in which the optimizer is used, followed by the specifications and other useful information.

## Context

The goal of the application is to help a Use for planning his stay at a movie festival. The festival proposes many events throughout the week, from wednesday to sunday included. 

An event can be either of:
- a MovieSession: a time and place where a movie is shown,
- an OtherActivity: any activity that does not involve watching a movie (eg, a meal at a restaurant).

The trouble is that the User cannot attend to all of them, so she has to choose. 

In order to do that, the User have assigned a score to each events. The planning optimizer you are tasked to implement will pick the best possible set of events, that maximizes the total score of the events, under some constraints.

# Code description
This section introduces you to the main classes you will interact with.

## class: PlannerEvent
An event is represented by the class [PlannerEvent](../src/main/java/org/bsiri/gegerator/planner/PlannerEvent.java). It is a plain dataclass that groups together several information.

The primary and most important information are:

- `score`: the score assigned to the event,
- `movie`: the id of the movie shown during the event,
- `theater`: the theater where the movie is shown (can be null),
- `day`: the day of the event,
- `startTime`: the start time of the event, 
- `endTime`: the end time of the event.

The class also define several other fields, that you do not need to worry about:
- `representedEvent`: represents the source object from which the PlannerEvent instance has been created. Do not rely on them and consider them as null references.
- `name`: a String that helps identify an event in human-readable format, but otherwise has no use for the optimization problem.

## class: CopilotPlanner
This class is yours to implement: [CopilotPlanner](../src/main/java/org/bsiri/gegerator/planner/copilot/CopilotPlanner.java). You will find a unique method `findBestRoadmap()`, which is the main method of the class. 

The instance is passed in its constructor the list of all PlannerEvent available. 

You will implement `findBestRoadmap()`, which returns, among all those events, those that together have the highest cumulative score.


# Constraints
This is an optimization under constraints problem. While planning for your implementation, remember the following facts:

## Score
The score can be positive if the User favors it, or negative if it would rather avoid it. The higher score the better. However due to the possiblity of negative scores, these events should not be included.

The goal of the optimizer is to maximize the cumulative score.

## Time Constraints
Two events cannot be planned together if the timing do not match. At any time, the User can attend only one event. 

For example, two events are incompatible if the end time of the first for one is after the start time of the other.

## Travel Constraints
Also, the events take place in one of the Theaters. The class [TheaterDistanceTravel](../src/main/java/org/bsiri/gegerator/domain/TheaterDistanceTravel.java) gives a matrix that contains the travel time, in minutes, to walk from one theater to the other.

This has implication for the time constraint above: indeed, you must make sure to take the travel factor into account when calculating whether two events are time compatible.

Note: some events have no Theater specified (field `theater` is null). In that case, the Travel constraint does not apply, only the Time constraint should be considered.

## Movie Uniqueness Constraints
Two events are incompatible if their show the same movie. Specifically, a given value for `movie` must appear at most once in the final set of event returned by the optimizer.

This is a very important constraint: a movie can be seen at most once.


## Compute Resource Constraints
The algorithm must return a solution within 2 seconds on a typical consumer grade hardware. As a rule of thumb, expect resources along the lines of two cores at 2.5Ghz and 8Gb RAM dedicated for the whole jvm process. The hardware has no GPU and no CUDA support.

You can expect a list of about one hundred PlannerEvent to pick from. The number of solution scale pretty quickly, be mindful of that.


# Your task
This section is the description of your task.

## Summary of the task
You must implement the method `findBestRoadmap()` in the class `CopilotPlanner`:
- return the list of `PlannerEvent` having the highest cumulative score, 
- while respecting the Time, Travel, Movie Uniqueness and Compute Resource Constraints

 To do this you are allowed to create auxilliary classes in package `org.bsiri.gegerator.planner.copilot`, if it helps keeping the code cleaner.

## Compromises
A typical festival proposes about hundred events. 

Given that number, the space of the solutions that satisfy the Time, Travel and Movie Uniqueness Constraints is huge, larger than 10^17. It is unrealistic to find the absolute optimum in a reasonable time, especially given the Compute Resource Constraints.

For this reason, in order to make the computation quick enough, the optimizer is not required to find the absolute optimum solution. A "good enough" solution will be, err, good enough.

## Testing
A JUnit Test Suite has been created: [WizardPlannerAllImplTest](../src/test/java/org/bsiri/gegerator/planner/WizardPlannerAllImplTest.java). You can read it as it will give you a clue of the expected behavior of the optimizer you will implement.

Also, you can test your implementation by running `mvn test` from within the module `gegerator.domain`.


# Your plan
Considering the complexity of the problem at hand, you will be best advised to proceed by steps.

## Step 1: problem analysis
Review the problem description and the constraints and see if it resembles a class of problem you know. Evaluate different options: graph-based, operations research, linear programming, stochastic methods, or other you could think of. You know probably better than me so feel free to explore. 

## Step 2: draft a solution
Based on your ideas, draft a document in the [spec](../specs/) folder that outline what your code will do. The document names should start with `feat-betterplanner-`. If you are considered several options, you are allowed to create multiple such documents.

## Step 3: cutting corners
In order to make the code runnable on consumer grade hardware as per the Compute Resource Constraints, see in which way you could cut on cpu time and memory required while keeping acceptable solution - ie, with a high enough cumulative score.

For example: using bitmasks for better data-per-byte density, multithreading, or heuristics for discarding large chunks of the solution space.

## Step 4: Implement
Once you have settled on a final algorithm and optimizations, you can proceed with the implementation. 

Divide the code you plan to write in simple concerns, and implement them one by one.

For code clarity, remember you can create additional classes in the package `org.bsiri.gegerator.planner.copilot`. However the main entrypoint remains `findBestRoadmap()` in `CopilotPlanner`.

## Step 5: Run the tests
Run the tests using `mvn test` and inspect the output to see if your implementation have a problem. Then iterate from there.


That's it, good luck!