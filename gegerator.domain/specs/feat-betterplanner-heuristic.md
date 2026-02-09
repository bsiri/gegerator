# Better Planner: Heuristic Optimizer

## Goal
Select a high-score, feasible roadmap under time, travel, and movie-uniqueness constraints.
Return a chronologically ordered list and always exclude events with non-positive score.

## Core Ideas
- Pre-filter events with score <= 0.
- Precompute pairwise overlap using the existing time + travel logic.
- Maintain a selected set and a map of movie -> selected event.
- Use greedy insertion by descending score with local replacement when it improves total score.
- Iterate a few passes to allow improvements without exponential search.

## Feasibility
Two events conflict when `TimeAndSpaceLocation.overlap()` is true.
The travel time matrix is taken from `TheaterDistanceTravel` via the existing overlap logic.
Movie uniqueness is enforced by allowing at most one event per movie id.

## Algorithm (High Level)
1. Filter out events with score <= 0.
2. Sort remaining events by score descending, then by day/start time for determinism.
3. Precompute a boolean overlap matrix for fast conflict checks.
4. Initialize empty selection and total score.
5. Repeat for a small fixed number of passes (e.g., 3):
   - For each event in score order:
     - Compute conflicts among the currently selected events.
     - If the event's movie is already selected, include that event in the conflict set.
     - Replace the conflict set with the candidate only if total score strictly improves.
6. Return the selected events sorted chronologically (day, start time, end time, name).

## Complexity
- Overlap matrix: O(n^2)
- Selection passes: O(p * n * k), where k is average conflicts, p is small (<= 3)
- With n around 100, this stays well under the 2s constraint.

## Tradeoffs
This is a heuristic, not guaranteed optimal. It prioritizes fast, high-quality schedules.
The strict improvement rule prevents oscillation and keeps runtime predictable.
