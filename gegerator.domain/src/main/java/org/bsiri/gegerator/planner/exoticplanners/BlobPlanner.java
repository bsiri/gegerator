package org.bsiri.gegerator.planner.exoticplanners;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import org.bsiri.gegerator.planner.PlannerEvent;
import org.bsiri.gegerator.planner.TimeAndSpaceLocation;
import org.bsiri.gegerator.planner.WizardPlanner;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * This planner returns an approximation of the optimum, by taking a greedy approach.
 * On average, it is less accurate than RankedPathGraphPlanner (though beats it sometimes),
 * but much faster (about 60 times faster, see jmh benchmarks).
 *
 * It works by having each movie competing for their timeslots, over multiple rounds, until a stable
 * solution is reached.
 *
 * A Movie have as many timeslots as there are MovieSession that schedules that movie, and the
 * score of the timeslot is the score of the underlying MovieSession. When a new round begins,
 * the highest-score timeslot for each Movie are pitted against each others. Then, overlapping
 * timeslots ("conflicts") are detected. If conflicts are detected, the scores are compared
 * and at the end of the round the most contended timeslot is evicted. A new round then starts,
 * until there are no more conflicts left.
 *
 * The wording used in the implementation speaks of Blobs applying pressures on each others etc,
 * but the core idea is the same.
 *
 * A limitation of this algorithm is that it doesn't work well with negative score. In order to
 * keep it simple, MovieSession with negative scores are ignored.
 *
 * Use this planner if speed is absolutely required and near-optimum solution is enough.
 *
 */
public class BlobPlanner implements WizardPlanner {

    private Blobs blobs;

    public BlobPlanner(Collection<PlannerEvent> events){
        List<PlannerEvent> positiveScoreEvents = removeNegativeScore(events);
        blobs = Blobs.from(positiveScoreEvents);
    }

    @Override
    public List<PlannerEvent> findBestRoadmap(){

        boolean isStable;

        List<Blob> batch;

        // keep the reaction alive until the solution is stable
        do {
            batch = blobs.getNextBestBlobByMovie();
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
            Blob[] blobarray = batch.toArray(new Blob[0]);
            resetPressure(blobarray);
            hasPressure = applyPressures(blobarray);

            if (hasPressure) {
                int indexMostPressured = findMostPressuredBlobIndex(blobarray);
                Blob pressuredBlob = batch.remove(indexMostPressured);
                blobs.disqualifyBlob(pressuredBlob);
                initiallyStable = false;
            }

        }
        while(hasPressure);
        return initiallyStable;
    }

    /**
     * Assigns the blobs with their peer-pressure.
     * Returns true if at least one Blob had pressure applied,
     * or false if no Blob was pressured this round.
     * @param blobarray
     * @return
     */
    private boolean applyPressures(Blob[] blobarray){

        boolean hadPressure = false;

        for (int i=0; i<blobarray.length; i++){
            Blob b1 = blobarray[i];

            /*
             Blobs are pressured by any other blob that is conflicting
             with it because of time overlap. The pressure is mutual: they
             inflict their own resistance to each other and their own
             pressure thus increase accordingly

             Since the Blobs are sorted by start datetime, the proximity in
             time between blobs is reflected by proximity of their indices
             in the conflict matrix. This allows us to not fully explore the
             matrix, because conflicting blobs tend to have clustered indices.
            */

            int next = i+1;
            while (next < blobarray.length && blobs.areInConflict(b1, blobarray[next]))  {
                Blob b2 = blobarray[next];
                // blobs pressuring each others
                b1.incrPressureBy(b2.resistance);
                b2.incrPressureBy(b1.resistance);
                // record that pressure was applied at least once
                // for this batch.
                hadPressure = true;
                next++;
            }
        }

        return hadPressure;
    }

    private int findMostPressuredBlobIndex(Blob[] array){
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

    private void resetPressure(Blob[] array){
        for (Blob b : array) b.resetPressure();
    }

    /*
     * This planner doesn't like negative scores, it makes it crash, so
     * we need to remove them.
     *
     * Also negative scopes would mean Blobs with
     * negative resistance: they would remove pressure on their conflicting
     * peers. It could lead a crappy Blob to make a slightly less crappy Blob
     * look more awesome than it really is.
     *
     * For the sake of simplicity, Sessions with negative scores are removed.
     * This is one of the limitations of the algorithm.
     *
     * @param events
     * @return
     */
    private List<PlannerEvent> removeNegativeScore(Collection<PlannerEvent> events){
        return events.stream().filter(e -> e.getScore() >=0 ).collect(Collectors.toList());
    }

    // **************** support classes ****************

    private static class Blobs {

        // Blobs are grouped by the Movie ID of the Movie they are championing.
        // For each movie, blobs are sorted by resistance descending.
        // Note that we use LinkedList, because we will often need to
        // remove the head of a given list.
        private Map<Long, LinkedList<Blob>> blobsByMovie;

        // The conflict matrix describes which pairs of blobs are in conflict
        // with each others, because the movie session they represent
        // have overlapping timeslots (see #initConflictMatrix)
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
            // see comment on the attribute 'blobsByMovie' for context.
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
                    if (TimeAndSpaceLocation.overlap(from.event, to.event)){
                        conflict[from.blobId][to.blobId]=true;
                        conflict[to.blobId][from.blobId]=true;
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

            // if the list for the given movie happens to
            // end up empty, remove it altogether from the pool.
            if (bloblist.isEmpty()){
                blobsByMovie.remove(movieId);
            }
        }

        /**
         * For each movie, return the next most resistant blob.
         */
        List<Blob> getNextBestBlobByMovie(){
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

        private static final Random rnd = new Random(System.currentTimeMillis());

        final int blobId;

        // payload attributes
        final Long movieId;
        final private PlannerEvent event;

        // Algorithm attributes:
        /*
         pressure: the higher, the more likely this
         blob will be evicted. Recomputed each round.
        */
        private long pressure = 0;
        /*
         resistance: how "hard" this Blob is, and basically
         how much pressure it will add to other Blobs it is
         conflicting with.
         Assigned once and finally, here
        */
        private final long resistance;

        public Blob(int blobId, PlannerEvent evt){
            this.blobId = blobId;
            this.event = evt;
            if (event.getMovie() == null){
                // assign a surrogate random id, picks a negative one to prevent conflict
                // with events that have an actual movie id.
                // TODO : collisions on ids are unlikely but still possible;
                // if needed keep track of the surrogate ids already assigned
                this.movieId = (long) (rnd.nextInt(1000) - 1500);
            } else{
                this.movieId = evt.getMovie();
            }
            this.pressure = 0;
            this.resistance = event.getScore();
        }

        // **** core logic  ***

        void incrPressureBy(long increment){
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
