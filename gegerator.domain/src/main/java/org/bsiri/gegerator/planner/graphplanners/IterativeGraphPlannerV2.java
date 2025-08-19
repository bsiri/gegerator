package org.bsiri.gegerator.planner.graphplanners;


import org.bsiri.gegerator.domain.TheaterDistanceTravel;
import org.bsiri.gegerator.planner.PlannerEvent;
import org.bsiri.gegerator.planner.WizardPlanner;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.LongStream;

/**
    Slightly optimized version of IterativePlanner.

    Iterative Planner was rather crappy because of too many branch miss,
    so in this one we attempt to reduce the number of branches as well.

    This planner do an exhaustive search of optimum and returns an exact
    solution, but work in reasonable time for low number of events
    (about 30). For larger volumes you should consider alternative
    implementations.
 */
public class IterativeGraphPlannerV2 implements WizardPlanner {


    private static Long ROOT_MOVIE = -9999L;
    private static Long SINK_MOVIE = -9998L;

    private static final PlannerEvent ROOT = new PlannerEvent(
            null,
            "ROOT",
            0,
            ROOT_MOVIE,
            null,
            DayOfWeek.TUESDAY,
            LocalTime.of(0, 1),
            LocalTime.of(0,2)
    );

    private static final PlannerEvent SINK = new PlannerEvent(
            null,
            "SINK",
            0,
            SINK_MOVIE,
            null,
            DayOfWeek.SUNDAY,
            LocalTime.of(23, 58),
            LocalTime.of(23,59)
    );

    /*
     * The event nodes will be sorted by Day, then by startTime,
     * taking advantage of the fact that if event B starts after
     * event A, then event B cannot possibly end before the start
     * of event A.
     *
     * Since our edges are modeled by an adjacency matrix (and not
     * a proper Edge object), this allows us to shortcut a good amount
     * of loop iterations * instead of exploring the whole N²
     * combinations.
     */
    private PlannerEvent[] nodes;

    /* The value for each entry is 1 if a connection
     * is possible and 0 otherwise.
     * The first axis is the index of the source event,
     * the second axis is for the destination event.
     *
     * Since we assume that the events are sorted chronologically
     * (see remarks above), this matrix will be quasi-diagonal).
     */
    private int[][] adjacency;


    private int[] nodes_movies;
    private long[] nodes_scores;
    private int movies_count = 0;

    public IterativeGraphPlannerV2(Collection<PlannerEvent> evts){
       initNodes(evts);
       initEdges();
    }

    // ************** Initialization *****************

    private void initNodes(Collection<PlannerEvent> orig){
        List<PlannerEvent> copy = new ArrayList<>(orig);
        copy.add(ROOT);
        copy.add(SINK);

        // sort by date so that we can iterate more efficiently later
        Collections.sort(copy, Comparator.comparing(PlannerEvent::getDay).thenComparing(PlannerEvent::getStartTime));
        this.nodes = copy.toArray(new PlannerEvent[]{});

        // Also populate the local arrays for movie ids and event scores
        // In case no movie id is available (because of an eventless movie),
        // a unique movie ID will be generated.
        // Furthermore the movies are renumbered : here we don't store the
        // movie ID directly but rather its index by order of encounter.
        // This allows us to re-scale the values for much smaller range
        // from 0 to card(movies).
        Random r = new Random();
        Map<Long, Integer> movieMap = new HashMap<>();
        this.nodes_movies = new int[this.nodes.length];
        this.nodes_scores = new long[this.nodes.length];

        for (int i=0; i< nodes.length; i++){
           PlannerEvent event = nodes[i];
           Long movieId = event.getMovie();
           if (movieId == null){
               // generate a value in the negative range so that no collision
               // occur with real movie IDs (which are all positive).
               movieId = Long.valueOf(r.nextInt(7999) - 8000);
           }
           if (movieMap.containsKey(movieId)){
               this.nodes_movies[i] = movieMap.get(movieId);
           }
           else{
               movieMap.put(movieId, movies_count);
               this.nodes_movies[i] = movies_count;
               movies_count++;
           }

           this.nodes_scores[i] = event.getScore();
        };
    }

    private void initEdges(){
        adjacency = new int[nodes.length][nodes.length];
        for (int iSrc = 0; iSrc < nodes.length; iSrc++){
            for (int iDst = iSrc+1; iDst < nodes.length; iDst++){
                PlannerEvent src = nodes[iSrc];
                PlannerEvent dst = nodes[iDst];
                if (! src.isTransitionFeasible(dst)) continue;
                adjacency[iSrc][iDst] = 1;
            }
        }
    }

    public long countPaths(){
        long[] nodepaths = new long[nodes.length];
        nodepaths[nodes.length -1] = 1L;
        for (int j=nodes.length-1; j>=0; j--){
            for (int i= j+1; i < nodes.length; i++){
                if (adjacency[j][i] == 1){
                    nodepaths[j] += nodepaths[i];
                }
            }
        }
        return nodepaths[0];
    }

    // ******************* Computation ************************

    @Override
    public List<PlannerEvent> findBestRoadmap(){
        List<PlannerEvent> best = explore();
        // remove the ROOT
        return best.subList(1, best.size());
    }



    // CAUTION : this is insane
    private List<PlannerEvent> explore(){
        int[] nodesStack = new int[nodes.length];
        int[] edgesStack = new int[nodes.length];
        int stackTop = 0;
        long currentScore = 0L;


        int saveStack[] = new int[nodes.length];
        int saveTop = 0;
        long bestScore = Long.MIN_VALUE;

        // an array of length cars(node_movies)
        // values are :
        // - true if the movie at this index has been seen
        //   in the path currently examined,
        // - false otherwise.
        boolean[] seenMovies = new boolean[nodes_movies.length];

        // init with the ROOT node (index 0 by construction)
        nodesStack[stackTop] = 0;
        edgesStack[stackTop] = 1;
        currentScore += nodes_scores[0];
        seenMovies[nodes_movies[0]] = true;


        // loop variables
        int iSrc;
        int iDest;

        nodeloop: while(stackTop >= 0){
            // restore the state
            iSrc = nodesStack[stackTop];
            PlannerEvent src = nodes[iSrc];
            iDest = edgesStack[stackTop];

            // edges exploration, except the SINK (last position)
            while (iDest < nodes.length - 1) {

                // skip if no edge or if movie already seen
                if (adjacency[iSrc][iDest] == 0 || seenMovies[nodes_movies[iDest]] == true) {
                    iDest++;
                    continue;
                }

                // else, "dest" is eligible for exploration
                // first, we save what will be the next dest to explore
                // from this src node.
                edgesStack[stackTop] = iDest+1;

                // now we push things in stack and go explore next node
                stackTop++;
                nodesStack[stackTop] = iDest;
                edgesStack[stackTop] = iDest + 1;
                currentScore += nodes_scores[iDest];
                seenMovies[nodes_movies[iDest]] = true;


                // now that the stacks are ready, break
                // the main while loop will pop and the processing
                // will resume at the next node.
                continue nodeloop;
            }

            // we exit this loop once we reach the SINK,
            // because the SINK is by construction the
            // last node. So we can evaluate the value
            // of the roadmap.
            // This block of code replace the
            // "if (this == SINK)" condition tested in
            // other variants

            if (currentScore > bestScore){
                bestScore = currentScore;
                System.arraycopy(nodesStack, 0, saveStack, 0, stackTop+1);
                saveTop = stackTop;
            }

            // if we have finished exploring that node
            // we pop the stacks
            stackTop--;
            seenMovies[nodes_movies[iSrc]] = false;
            currentScore -= nodes_scores[iSrc];
        }

        List<PlannerEvent> result = new ArrayList<>( saveTop);
        for (int i=0; i<=  saveTop; i++){
            result.add(nodes[saveStack[i]]);
        }

        return result;

    }


}



