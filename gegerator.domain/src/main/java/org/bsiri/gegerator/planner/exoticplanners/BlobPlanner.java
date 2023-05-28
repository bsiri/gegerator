package org.bsiri.gegerator.planner.exoticplanners;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import org.bsiri.gegerator.planner.PlannerEvent;
import org.bsiri.gegerator.planner.WizardPlanner;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * This planner returns an approximation of the optimum, by taking a greedy approach.
 * It is less accurate than RankedPathGraphPlanner, but much more (suspiciously even ?) faster.
 *
 * It works by having each movies competing for their timeslots (defined by the events in which
 * they are planned), and in case of timeslot overlap the movie with best score gets to keep its timeslot.
 * Evicted movies can then try another timeslot, which can lead to other conflicts etc. The solution
 * is attained when no more conflicts occurs and the process stabilizes.
 *
 * The wording used in the implementation speaks of Blobs applying pressures on each others etc, but the
 * core idea is the same.
 *
 * Use this planner if speed is absolutely required.
 *
 */
public class BlobPlanner implements WizardPlanner {

    Blobs blobs;

    public BlobPlanner(Collection<PlannerEvent> events){
        List<PlannerEvent> positiveScoreEvents = removeNegativeScore(events);
        blobs = Blobs.from(positiveScoreEvents);
    }

    @Override
    public List<PlannerEvent> findBestRoadmap(){

        boolean isStable;

        List<Blob> batch;

        do {
            batch = blobs.getNextBestBlobs();
            batch.sort(Blob.compareByStartTime());

            isStable = pressurizeBlobs(batch);
        }
        while(! isStable);

        return batch.stream().map(Blob::getEvent).collect(Collectors.toList());

    }

    private boolean pressurizeBlobs(List<Blob> batch) {
        boolean initiallyStable = true;
        boolean hasPressure;
        do {

            // making an array, so we can iterate faster by indices
            Blob[] blobarray = batch.toArray(new Blob[batch.size()]);
            resetPressure(blobarray);
            hasPressure = applyPressures(blobarray);

            if (hasPressure) {
                int indexMostPressured = findMostPressuredBlob(blobarray);
                Blob pressuredBlob = batch.remove(indexMostPressured);
                blobs.disqualifyBlob(pressuredBlob);
                initiallyStable = false;
            }

        }
        while(hasPressure);
        return initiallyStable;
    }

    /**
     * Compute the pressure applied to each Blob (note that they will be mutated).
     * Returns true if pressure was applied, or false if no pressure was applied.
     * @param blobarray
     * @return
     */
    private boolean applyPressures(Blob[] blobarray){

        boolean hadPressure = false;

        for (int i=0; i<blobarray.length; i++){
            Blob b1 = blobarray[i];
            for (int j=i+1; j<blobarray.length; j++){
                Blob b2 = blobarray[j];
                // detect conflict with immediate next blobs,
                // since the blobs are sorted by starttime,
                // we can shortcut the loop when no conflict is found
                if (! blobs.areInConflict(b1, b2)) break;

                b1.applyPressure(b2.resistance);
                b2.applyPressure(b1.resistance);
                hadPressure = true;
            }
        }

        return hadPressure;
    }

    int findMostPressuredBlob(Blob[] array){
        int idx = -1;
        long maxPressure = Long.MIN_VALUE;
        for (int i=0; i<array.length; i++){
            if (array[i].pressure > maxPressure){
                idx = i;
                maxPressure = array[i].pressure;
            }
        }
        return idx;
    }

    void resetPressure(Blob[] array){
        for (Blob b : array) b.resetPressure();
    }

    /*
     * This planner doesn't like negative scores, it makes it crash, so
     * we need to remove them.
     *
     * @param events
     * @return
     */
    List<PlannerEvent> removeNegativeScore(Collection<PlannerEvent> events){
        return events.stream().filter(e -> e.getScore() >=0 ).collect(Collectors.toList());
    }

    // **************** support classes ****************

    private static class Blobs {


        // Blobs are grouped by the movie ID.
        // For each movies, blobs are sorted by resistance descending.
        // Note that we use LinkedList, because we will often need to
        // remove the head of a given list.
        private Map<Long, LinkedList<Blob>> blobsByMovie;

        private boolean[][] conflict;

        private Blobs(Collection<Blob> blobs){
            initBlobsByMovies(blobs);
            initConflictMatrix(blobs);
        }




        // ******** init ******************

        private void initBlobsByMovies(Collection<Blob> allBlobs){
            // partition by movie id
            Map<Long, List<Blob>> partitionBlobs = allBlobs.stream().collect(
                    Collectors.groupingBy( Blob::getMovieId )
            );

            // Create blobsByMovie
            // see comment on the attribute for details
            blobsByMovie = new HashMap<>(partitionBlobs.size());
            for (Map.Entry<Long, List<Blob>> entry: partitionBlobs.entrySet()){
                Long movieId = entry.getKey();
                LinkedList<Blob> sortedBlobs = entry.getValue() .stream()
                        .sorted(Comparator.comparing(Blob::getResistance).reversed())
                        .collect(Collectors.toCollection(LinkedList::new));

                blobsByMovie.put(movieId, sortedBlobs);
            }
        }

        private void initConflictMatrix(Collection<Blob> blobs){
            conflict = new boolean[blobs.size()][blobs.size()];

            for (Blob from: blobs){
                for (Blob to: blobs){
                    if (! from.event.isTransitionFeasible(to.event)){
                        conflict[from.blobId][to.blobId] = true;
                    }
                }
            }

        }

        // *************** handling ***************

        boolean areInConflict(Blob blob1, Blob blob2){
            return conflict[blob1.blobId][blob2.blobId];
        }

        void disqualifyBlob(Blob blob){
            Long movieId = blob.movieId;
            LinkedList<Blob> bloblist = blobsByMovie.get(movieId);
            // by construction, the blob is actually the first one in the list
            // so we can removeFirst
            bloblist.removeFirst();

            // also disqualify the movie if no more blobs
            // left for that movie
            if (bloblist.isEmpty()){
                blobsByMovie.remove(movieId);
            }
        }

        /**
         * For each movie, return the next most resistant blob.
         */
        List<Blob> getNextBestBlobs(){
            // Note : should not throw NoSuchElementException
            // if Blobs is properly used, because disqualifyBlob
            // would also remove entries from the map if
            // a blob list becomes empty
            return blobsByMovie.values() .stream()
                    .map(LinkedList::getFirst)
                    .collect(Collectors.toList());
        }

        // ************ static helpers *********

        static Blobs from(Collection<PlannerEvent> events){
            List<Blob> blobs = new ArrayList<>(events.size());
            int idseq=0;

            for (PlannerEvent event: events){
                blobs.add(new Blob(idseq++, event));
            }

            return new Blobs(blobs);

        }

    }

    @Getter
    @EqualsAndHashCode(of = "blobId")
    private final static class Blob{

        private static Random rnd = new Random(System.currentTimeMillis());

        int blobId;

        Long movieId;
        private PlannerEvent event;
        private long pressure = 0;
        private long resistance = 0;

        public Blob(int blobId, PlannerEvent evt){
            this.blobId = blobId;
            this.event = evt;
            if (event.getMovie() == null){
                this.movieId = Long.valueOf(rnd.nextInt(1000)-1500);
            } else{
                this.movieId = evt.getMovie();
            }
            this.pressure = 0;
            this.resistance = event.getScore();
        }

        // **** core logic  ***

        void applyPressure(long increment){
            pressure += increment;
        }
        void resetPressure(){
            pressure=0;
        }

        static Comparator<Blob> compareByStartTime(){
            return Comparator.comparing(Blob::getDay).thenComparing(Blob::getStartTime);
        }


        // *** getters not generated by Lombok & other **
        DayOfWeek getDay(){
            return event.getDay();
        }

        LocalTime getStartTime(){
            return event.getStartTime();
        }

        @Override
        public String toString(){
            StringBuilder sb = new StringBuilder()
                    .append(event)
                    .append(" ("+movieId+")");

            if (event.getTheater() != null){
                sb.append(" at ")
                    .append(event.getTheater().name());
            }

            sb.append("(score "+event.getScore()+")")
                    .append(" on ")
                    .append(event.getDay())
                    .append(" at ")
                    .append(event.getStartTime());
            return sb.toString();
        }

    }



}
