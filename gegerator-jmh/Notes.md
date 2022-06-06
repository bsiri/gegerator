# Run:

java -jar target/microBenchmark [options]

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