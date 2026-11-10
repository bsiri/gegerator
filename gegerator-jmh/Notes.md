# Build

This module is not part of the main build. It depends on `gegerator.domain`
(main and test jars), which must be installed in the local repository first.
From the root of the project:

    mvn install -N
    mvn install -pl gegerator.domain -DskipTests

Then, from this directory:

    mvn clean package

Note: if you build with a JDK 23 or later, add `-Dmaven.compiler.proc=full`
when installing `gegerator.domain` (otherwise Lombok is not run).

# Run

From this directory (the grids of the directory `/samples` are looked
up from the working directory and its parents):

    java -jar target/microbenchmarks.jar PlannerBenchmark [options]

For instance, to run a single planner on a single grid:

    java -jar target/microbenchmarks.jar PlannerBenchmark.benchBranchAndBoundPlanner -p grid=gege_2026.json

Remember to kill any other tasks beforehand so as not to
pollute your CPU with random tasks too much.

# About -prof perf

Because of securities around the kernel that limit access
to event counters, one must :

* first, set echo 0 > /proc/sys/kernel/nmi_watchdog
* then run the command as root

The benchmark must run for a significant time to produce
meaningfull measures, otherwise the counters won't have
time to kick in ()
