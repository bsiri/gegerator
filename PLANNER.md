# The Wizard planner, explained

*Author: Claude (Anthropic's AI model, version Fable 5.2), November 2026. The planner was designed and implemented by Claude during a working session with bsiri, who framed the problem, provided the real festival grids, and asked the questions this document answers.*

This is a reminder of how `BranchAndBoundPlanner` works (module `gegerator.domain`, package `org.bsiri.gegerator.planner.exactplanners`). It goes from the core idea to the refinements, then the small optimizations, and ends with the questions that were the hardest to get right.

## The problem

Pick the set of events with the highest total score, such that:

- no two events overlap in time, travel between theaters included,
- no movie is planned twice.

In the literature this is the weighted Job Interval Selection Problem: a movie is a job, its sessions are the intervals during which the job can be done, and at most one interval per job can be selected. It is NP-hard.

Without the movie rule it would be easy. Sort the events of a day by start time, link each event to the later events it is compatible with, and the best roadmap of the day is the longest path in that graph. The whole planner is built on this observation.

## Vocabulary

| Word | Meaning |
|---|---|
| Path | A sequence of time-compatible events. It may contain the same movie twice. |
| Roadmap | A path that also respects the movie rule: a real, valid answer. |
| Toll | A penalty attached to a movie, noted `λ_m`. Planning any session of that movie costs the toll. |
| Ceiling | A score that no roadmap can exceed (upper bound). |
| Floor | The score of the best roadmap found so far (the incumbent). |
| Node | A sub-problem of the search tree: the original problem plus some decisions "this event is planned" or "this event is not planned". It is not a node of the event graph. |
| Active set | The events still open to choice at a node. |

## The core algorithm

### The idea

Two numbers are squeezed towards each other:

- the **ceiling** is lowered by tuning the tolls,
- the **floor** is raised each time a better roadmap is found.

When they meet, the roadmap that gave the floor is proven optimal.

### The Lagrangian

Notations: `x_e` is 1 if event `e` is planned and 0 otherwise, `s_e` is its score, `m(e)` is its movie.

The original problem:

```
maximise   Σ_e  s_e · x_e
subject to x is a path
           for each movie m:  Σ_{e in m} x_e  ≤ 1
```

The movie rule is removed from the constraints and moved into the objective, with one multiplier `λ_m ≥ 0` per movie:

```
L(x, λ) = Σ_e s_e · x_e  +  Σ_m λ_m · (1 − Σ_{e in m} x_e)
```

This is rewritten into the form the code uses:

```
Σ_m λ_m · (1 − Σ_{e in m} x_e)
    = Σ_m λ_m  −  Σ_m λ_m · Σ_{e in m} x_e          distribute λ_m
    = Σ_m λ_m  −  Σ_m Σ_{e in m} λ_m · x_e          λ_m does not depend on e
    = Σ_m λ_m  −  Σ_e λ_m(e) · x_e                  each event has exactly one movie

L(x, λ) = Σ_m λ_m  +  Σ_e (s_e − λ_m(e)) · x_e
```

`λ_m(e)` is the toll of the movie of event `e`. So, for given tolls:

- every event has its score lowered by the toll of its movie,
- the sum of all the tolls is added back as a constant (the "refund").

### The ceiling

For given tolls, the ceiling is the highest value `L` can take over all paths:

```
D(λ) = Σ_m λ_m  +  longest path with the lowered scores
```

It is a true upper bound whatever the tolls. For a valid roadmap, each `(1 − Σ x_e)` is 0 or 1, so `L` is at least the real score of that roadmap. The maximum of `L` over all paths, valid or not, is therefore at least the best real score.

### Tuning the tolls

`D(λ)` is to be made as low as possible. It is convex, so there is no local minimum to be trapped in, but it is not smooth, so there is no gradient. A "subgradient" plays that role. For movie `m`:

```
subgradient_m = 1 − (number of times m is planned in the current longest path)
λ_m ← max(0, λ_m − step · subgradient_m)
```

Which reads:

- movie planned twice: the toll goes up,
- movie planned once: the toll does not move,
- movie not planned but with a toll: the toll goes down.

### A tiny example

One movie, two sessions on different days, each scoring 10. The best roadmap scores 10.

| Toll | Each session is worth | The longest path takes | Ceiling = toll + path |
|---|---|---|---|
| 0 | 10 | both | 0 + 20 = 20 |
| 5 | 5 | both | 5 + 10 = 15 |
| 10 | 0 | either or none | 10 + 0 = 10 |
| 15 | −5 | none | 15 + 0 = 15 |

While the movie is planned twice, one more unit of toll costs 1 (the refund) and removes 2 from the path: the ceiling drops. Past 10 the path no longer contains the movie and the toll is pure cost: the ceiling rises. The lowest ceiling is at 10, which is the true optimum.

## The refinements

Lagrangian relaxation with the subgradient method only gives a ceiling. The following additions turn it into an exact solver.

### Repair: getting a floor

The longest path is usually not a valid roadmap. At each iteration it is repaired (`repairAndRecord`):

1. its events are kept by descending score, skipping any that conflicts with one already kept (in practice this removes the duplicated movies),
2. the gaps are filled: every other active event is tried by descending score, and added if it is compatible, in time and in movie, with everything kept so far.

The result is a valid roadmap. If it beats the floor, it becomes the new floor. Relaxation plus repair is known as a Lagrangian heuristic.

### Step length based on the floor

```
step = factor · (ceiling − floor) / ‖subgradient‖²
```

The moves are large while the ceiling and the floor are far apart, and small when they are close. `factor` starts at 2 and is halved each time the ceiling has not improved for 5 iterations, which damps the oscillations. This is known as the Polyak step size. Its main advantage is that it adapts by itself to the scale of the scores (from 10 to 999999 here).

### The stop test

After each iteration the code checks whether the ceiling has come down to the floor (`cannotImprove`). If so, nothing better exists in the current node, and it is closed. At the root, this ends the search with a proven optimum.

### Branching

If the iterations run out (300 at the root, 20 elsewhere) and the ceiling is still above the floor, the node is split in two on one event:

- **planned**: the event is a given. Its score is added to `baseScore`, and the event and all its conflicts leave the active set.
- **not planned**: the event alone leaves the active set.

Each half is the same problem with fewer events, and is handled the same way: tune the tolls, repair, test, and possibly branch again. The "planned" half is explored first, entirely, then the other one (depth-first).

The event is chosen by `pickBranchingEvent`:

1. the highest-scoring event among the movies planned twice in the last longest path, because that is where the relaxation still cheats,
2. otherwise the best session of the unplanned movie with the highest toll, because that toll is the largest contributor to the gap,
3. otherwise the best event of any movie that still has several sessions.

With branching, the whole thing is a branch-and-bound in which the Lagrangian relaxation provides the bound.

### Discarding hopeless events

Once per node, after the toll loop (`discardHopelessEvents`). For each active event, the code computes the ceiling of the problem in which the path is forced through that event:

```
baseScore + sum of the tolls + best paths of the other days
          + best path ending just before the event + best path starting at the event
```

If that figure cannot beat the floor, no roadmap containing the event can, and the event leaves the active set of the node and of everything below it. This is known as Lagrangian variable fixing. It often lowers the ceiling enough to close the node without branching.

## The slight optimizations

- **Day by day.** Events of different days never overlap, so the longest path is computed per day and the results are summed. The days only interact through the movie rule, that is, through the tolls.
- **Backward computation.** `longestPaths` goes from the last event of the day to the first. When it reaches an event, the best path starting at each later event is already known (`forward`).
- **Bitsets.** A set of events is an array of longs, one bit per event: event `i` is at word `i / 64`, bit `i % 64`. Removing all the conflicts of an event from a set takes one operation per word instead of one per event. There is no limit on the number of events.
- **Score step.** `scoreStep` is the greatest common divisor of all the scores. Every roadmap score is a multiple of it, so a ceiling less than one step above the floor is already a proof. On an unrated grid, where every score is 10, this matters a lot.
- **No toll for movies with fewer than two sessions left.** They cannot be planned twice.
- **Inherited tolls.** A child node starts from the tolls of its parent, which is why 20 iterations are enough for it.
- **Copies instead of undo.** A node never modifies the active set it received, it works on copies. Coming back up the tree therefore needs no undo.
- **Time budget.** The clock is read once every 8 nodes. When the budget (1.5 second) is elapsed, the best roadmap found so far is returned and `isOptimal()` returns false. The root node is never interrupted, so there is always a roadmap to return.

## Map of the code

| Method | Role |
|---|---|
| `initEvents`, `initMovies`, `initConflicts` | Drop the events of score ≤ 0, sort chronologically, build the conflict bitsets and the lists of compatible successors and predecessors |
| `findBestRoadmap` | Creates the root node and starts the search |
| `explore` | Handles one node: toll loop, discarding, branching |
| `longestPaths` | The ceiling for given tolls |
| `extractPath` | Lists the events of the longest path and counts each movie |
| `repairAndRecord` | Turns the path into a roadmap, updates the floor |
| `cannotImprove` | The stop test |
| `discardHopelessEvents` | Variable fixing |
| `pickBranchingEvent` | Chooses the event to branch on |
| `isSet`, `add`, `remove` | Bitset handling |

## Questions and answers

### The Lagrangian term gets smaller with duplicates. Is planning duplicates not the best way to lower the ceiling?

No, because the one who lowers the ceiling does not choose the events. There are two players with opposite goals:

- the longest path chooses the events to **maximise** `L` for the tolls it is given. Duplicates lower `L`, so it avoids them once the toll is high enough.
- the toll tuning chooses the tolls to **minimise** the result of that maximisation. It never chooses events.

Raising the toll of a duplicated movie makes its sessions less attractive to the maximiser, until it stops planning it twice.

### Is it the toll or its change that depends on the gap between ceiling and floor?

Its change. Each iteration moves a toll by `step · subgradient`, and `step` is proportional to the gap. The toll itself ends up wherever the balance point is.

### Which path gives the subgradient: the longest path or the repaired roadmap?

The longest path, duplicates included. A repaired roadmap never contains a movie twice, so no toll would ever go up. The repaired roadmap only influences the tolls through the floor, which sets the step length.

### Can the subgradient be zero?

Yes, and it is the best case: the code simply returns. Movies whose toll cannot move are left out of the norm (fewer than two sessions left, or not planned with a toll already at 0). The norm is zero when no movie is planned twice and every movie with a toll is planned exactly once. Then:

- a movie planned once has its toll subtracted once and refunded once: it cancels out,
- a movie not planned has a toll of 0, by the very condition.

What remains is the real score of the path, which is also a valid roadmap: ceiling and floor have met.

### Is it a greedy algorithm?

The repair is greedy. The whole is not: it knows when it is done (the stop test is a proof), and it reconsiders its decisions (branching explores both "planned" and "not planned").

### Is the planned list the floor?

No. The planned list holds the events forced in by the decisions between the root and the current node. The floor is the best complete roadmap found anywhere in the tree. They meet in `repairAndRecord`: a candidate is the planned list plus the repaired path among the active events.

### Can the branching event conflict with events already planned?

No. Planning an event removes its conflicts from the active set, and branching events are picked from the active set. It may conflict with events of the current longest path, which is harmless: that path is an estimate, and the child node computes a new one. "Conflict" means overlap in time or same movie, both are in the same bitset.

### Can a forbidden event come back through the gap filling?

No. Both the longest path and the repair only look at the active set, and a forbidden event is no longer in it.

### An event is hopeless with some tolls, but would not be with others. Which is right?

Hopeless. Every set of tolls gives a true upper limit. If one says "at most 50" and another "at most 60", both are true, so the real maximum is at most 50. With a floor of 55 the event is out. "At most 60" never meant that 60 can be reached, only that those tolls could not rule it out.

Two things could change the verdict and do not: the floor only goes up, and the proof is only used below the node where it was made.

### In the hopeless test, could a huge toll paid by another event make the figure unfairly low?

No, because of the refund. An event scoring 100 with a toll of 80 counts for 20 in the path, and the 80 is in the sum of the tolls: 100 in total. Tolls only change the total for a movie planned twice (penalty) or not planned (bonus).

### Is the hopeless test computed on roadmaps?

No, and this is the subtle part. The figure is computed on paths, duplicates allowed. Roadmaps only appear in the reasoning:

1. the figure is the best over **all** paths through the event,
2. any valid roadmap containing the event is one of those paths, so it cannot do better than the figure,
3. with the tolls and the refund, a valid roadmap is counted for at least its real score.

So the figure is above the real score of every roadmap containing the event. If it is below the floor, they all are. When duplicates make the best path look better than any roadmap could be, the figure is too generous and the event is kept: the test can miss, it cannot be wrong. For the same reason it does not need well-tuned tolls to be correct, only to be effective.

### Would a simpler variant work, with a step that just decreases over time and a single repair at the end?

Yes, it is the textbook subgradient method, and it converges. What is lost: the proof and the branching (it becomes a heuristic), the quality of the repair if only the last path is repaired (earlier paths often repair better), and the self-tuning of the step.

### Is the recursion a risk for the stack?

No. Each level of the tree removes at least one event from the active set, so the depth cannot exceed the number of events. A tree with thousands of nodes is wide, not deep. 240 deliberately hard grids of 500 to 2000 events ran without error with a thread stack of 160 KB, the default being 1 MB (run outside of the server).

### Why are default-rated activities not planned?

Events with a score of zero or less are never planned, and an OtherActivity with a DEFAULT rating scores 0. Setting `scoring.events.DEFAULT` to 1 is enough to have them planned when they fit. They would still lose against any session they overlap with.

## Measurements

Taken in November 2026 on a laptop (Intel Core Ultra 7 255U), JVM warmed up. The first call on a cold JVM took about 10 ms.

| Grid | Events | Time | Nodes |
|---|---|---|---|
| Festival 2020 | 98 | 0.06 ms | 1 |
| Festival 2023, nothing rated | 91 | 0.05 ms | 1 |
| Festival 2023, final | 84 | 0.03 ms | 1 |
| Festival 2026 | 103 | 0.04 ms | 1 |
| Generated, 5 days | 120 | 0.07 ms | 1 |
| Generated, 6 days | 150 | 0.1 ms | 1 |
| Generated, 7 days | 300 | 0.4 ms | 1 to 3 |
| Stress test, 2000 events | 2000 | 20 to 30 ms on average | a few |

The hardest grids are those with many sessions per movie and equal scores. The worst one produced (500 events, ten sessions per movie) took 441 ms and about 3300 nodes.

To reproduce: `BranchAndBoundPlannerTest` for the functional part, `gegerator-jmh` for the timings.
