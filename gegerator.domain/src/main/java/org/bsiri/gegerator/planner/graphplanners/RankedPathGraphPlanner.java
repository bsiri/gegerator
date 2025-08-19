package org.bsiri.gegerator.planner.graphplanners;

import org.bsiri.gegerator.domain.TheaterDistanceTravel;
import org.bsiri.gegerator.planner.PlannerEvent;
import org.bsiri.gegerator.planner.WizardPlanner;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * This planner returns an approximate optimum, sacrificing accuracy for speed.
 * It should run fast enough for about 120 events, perhaps even more.
 *
 * It works using divide-and-conquer, by solving first an exact roadmap solution
 * for each day separately, then trying to stitching them together. The stitching
 * process however cannot guarantee that the result is the global optimum. Furthermore
 * for technical reason, only the top 64 events (ranked by score) will be considered.
 * The end result is usually not too shabby though.
 *
 * Choose this planner if you have many events in your grid.
 */
public class RankedPathGraphPlanner implements WizardPlanner {

    // this is not an arbitrary value : we want
    // to use longs as masks so we assume 64bits.
    private static final int MAX_SIZE = 64;

    private SubGraph wednesdayGraph;
    private SubGraph thursdayGraph;
    private SubGraph fridayGraph;
    private SubGraph saturdayGraph;
    private SubGraph sundayGraph;

    // "global" variables
    private MoviesBitmask moviesBitmask = new MoviesBitmask();
    private EventsBitmask eventsBitmask = new EventsBitmask();


    public RankedPathGraphPlanner(Collection<PlannerEvent> originalEvents) {
        List<Node> nodes = preprocess(originalEvents);

        Map<DayOfWeek, List<Node>> nodesByDay = groupyByDay(nodes);

        wednesdayGraph = new SubGraph(DayOfWeek.WEDNESDAY, nodesByDay.getOrDefault(DayOfWeek.WEDNESDAY, new ArrayList<>()));
        thursdayGraph = new SubGraph(DayOfWeek.THURSDAY, nodesByDay.getOrDefault(DayOfWeek.THURSDAY, new ArrayList<>()));
        fridayGraph = new SubGraph(DayOfWeek.FRIDAY, nodesByDay.getOrDefault(DayOfWeek.FRIDAY, new ArrayList<>()));;
        saturdayGraph = new SubGraph(DayOfWeek.SATURDAY, nodesByDay.getOrDefault(DayOfWeek.SATURDAY, new ArrayList<>()));;
        sundayGraph = new SubGraph(DayOfWeek.SUNDAY, nodesByDay.getOrDefault(DayOfWeek.SUNDAY, new ArrayList<>()));;
    }


    private List<Node> preprocess(Collection<PlannerEvent> events){
        // First, trunk the list to the MAX_SIZE top scores
        List<PlannerEvent> sortedByScore = events.stream().sorted(
            Comparator.comparing(PlannerEvent::getScore)
                    .reversed()
                    .thenComparing(PlannerEvent::getDay)
        ).collect(Collectors.toList());

        List<PlannerEvent> shortlist = new ArrayList<>(sortedByScore.subList(0, Math.min(sortedByScore.size(), MAX_SIZE)));

        // Create the nodes now
        List<Node> allNodes = shortlist.stream().map( event -> {
            long movieBit = moviesBitmask.retrieveOrAssign(event);
            long eventBit = eventsBitmask.retrieveOrAssign(event);
            return new Node(
                event,
                movieBit,
                eventBit,
                event.getScore()
            );
        }).collect(Collectors.toList());

        return allNodes;
    }


    private Map<DayOfWeek, List<Node>> groupyByDay(Collection<Node> nodes){
        return nodes.stream().collect(Collectors.groupingBy(node -> node.evt.getDay()));
    }

    public long countPaths(){
        List<Path> wednesdayPath = wednesdayGraph.evaluateAllPaths();
        List<Path> thursdayPaths = thursdayGraph.evaluateAllPaths();
        List<Path> fridayPaths = fridayGraph.evaluateAllPaths();
        List<Path> saturdayPaths = saturdayGraph.evaluateAllPaths();
        List<Path> sundayPaths = sundayGraph.evaluateAllPaths();

        return wednesdayPath.size() + thursdayPaths.size() + fridayPaths.size()  + saturdayPaths.size() + sundayPaths.size();
    }

    public void stats(){
        wednesdayGraph.stats();
        thursdayGraph.stats();
        fridayGraph.stats();
        saturdayGraph.stats();
        sundayGraph.stats();
    }

    @Override
    public List<PlannerEvent> findBestRoadmap() {

        List<Path> wednesdayPaths = wednesdayGraph.evaluateAllPaths();
        List<Path> thursdayPaths = thursdayGraph.evaluateAllPaths();
        List<Path> fridayPaths = fridayGraph.evaluateAllPaths();
        List<Path> saturdayPaths = saturdayGraph.evaluateAllPaths();
        List<Path> sundayPaths = sundayGraph.evaluateAllPaths();

        //  stitching each roadmap together, trying to find the best one.
        Path bestPath = electBestPath(wednesdayPaths, thursdayPaths, fridayPaths, saturdayPaths, sundayPaths);

        List<PlannerEvent> best = eventsBitmask.retrieveByMask(bestPath.allEventsMask)
                .stream()
                .sorted(Comparator.comparing(PlannerEvent::getDay)
                        .thenComparing(PlannerEvent::getStartTime))
                .collect(Collectors.toList());

        return best;

    }


    private Path electBestPath(List<Path> ...pathLists){
        if (pathLists.length == 0) return Path.empty();

        List<Path> accum = sortKeepBest(pathLists[0]);
        for (int i=1; i < pathLists.length; i++){
            accum = mergeWhenPossible(accum, pathLists[i]);
            accum = sortKeepBest(accum);
        }

        return accum.get(0);

    }

    private List<Path> mergeWhenPossible(List<Path> first, List<Path> second){
        List<Path> result = new ArrayList<>();
        for (Path prev: first){
            for (Path next: second){
                if (prev.noOverlap(next)){
                    result.add(prev.merge(next));
                }
            }
        }
        return result;
    }

    private List<Path> sortKeepBest(List<Path> paths){
        List<Path> sortedByScore = paths.stream()
                .sorted(Comparator.comparing(Path::getOverallScore).reversed())
                .collect(Collectors.toList());
        return sortedByScore.subList(0, Math.min(sortedByScore.size(), MAX_SIZE));
    }




    // *************** subgraphs *****************

    private final class SubGraph{
        DayOfWeek day;
        Node[] nodes;
        int[][] adjacency;

        public SubGraph(DayOfWeek day, List<Node> nodes) {
            this.day = day;
            List<Node> sortedNodes = sortByStartTime(nodes);
            initNodes(sortedNodes);
            initEdges();
        }

        private List<Node> sortByStartTime(List<Node> nodes){
            return nodes.stream()
                    .sorted(Comparator.comparing(node -> node.evt.getStartTime()))
                    .collect(Collectors.toList());
        }

        private void initNodes(List<Node> sortedNodes){
            this.nodes = sortedNodes.toArray(new Node[]{});
        }

        private void initEdges(){
            adjacency = new int[nodes.length][nodes.length];
            for (int iSrc = 0; iSrc < nodes.length; iSrc++){
                PlannerEvent src = nodes[iSrc].evt;
                for (int iDst = iSrc+1; iDst < nodes.length; iDst++){
                    PlannerEvent dst = nodes[iDst].evt;
                    if (! src.isTransitionFeasible(dst)) continue;
                    adjacency[iSrc][iDst] = 1;
                }
            }
        }

        public void stats(){
            long edgecount = 0;
            for (int i=0; i<nodes.length; i++){
                for (int j=i+1; j < nodes.length; j++){
                    edgecount++;
                }
            }

            List<Path> paths = evaluateAllPaths();
            long totalPath = paths.size();

            long distinctmovies= Arrays.stream(nodes).map(n -> n.movieBit).distinct().count();
            System.out.println(String.format("%s : %d movies, %d events, %d edges, %d path total, %d path distinct", day, distinctmovies, nodes.length, edgecount, totalPath));
        }


        /*
         * Evaluates all possible path and retuns all of them.
         *
         * The exploration of the adjacency matrix leverages the fact that nodes
         * are sorted by start time (ie for i,j, if i < j then starttime(node(i)) < starttime(node(j)).
         *
         */
        List<Path> evaluateAllPaths(){

            List<Path>[] pathsByNodes = new List[nodes.length];
            for (int i=0; i<nodes.length; i++) {
                pathsByNodes[i] = new ArrayList<Path>();
            }

            // compute all paths
            for (int i = nodes.length -1; i >=0; i--){
                Node currentNode = nodes[i];
                List<Path> currentNodePaths = pathsByNodes[i];
                for (int j=i+1; j < nodes.length; j++){
                    if (adjacency[i][j] == 0) continue;
                    List<Path> destPaths = pathsByNodes[j];
                    for (Path destP : destPaths){
                        currentNodePaths.add(destP.augment(currentNode));
                    }
                }
                currentNodePaths.add(Path.justNode(currentNode) );
            }

            List<Path> allpaths = Arrays.stream(pathsByNodes)
                    .flatMap(List::stream)
                    .collect(Collectors.toList());

            // add the "nothing" path"
            allpaths.add(Path.empty());

            // prune redundant paths and return
            return pruneUselessPaths(allpaths);
        }

        /*
         * Eliminates path that :
         * - plan the same movie more than once (redundancy),
         * - if multiple path are planning the same exact set of movies,
         *   only keeps the one with the highest score.
         */
        private List<Path> pruneUselessPaths(List<Path> paths){
            Map<Long, Path> bestPathByMoviePanel = new HashMap<>(paths.size());

            for (Path p : paths){
                if (p.hasRedundancy()) continue;

                Path former = bestPathByMoviePanel.get(p.allMoviesMask);
                if (former == null || p.overallScore > former.overallScore){
                    bestPathByMoviePanel.put(p.allMoviesMask, p);
                }
            }

            return new ArrayList<>(bestPathByMoviePanel.values());
        }


    }

    /*
     * Nodes in the graph represent their movie and event
     * as a long, of which only one bit is '1'.
     */
    private class Node{
        PlannerEvent evt;
        long movieBit = 0L;
        long eventBit = 0L;
        long score = 0L;

        public Node(PlannerEvent evt, long movieBit, long eventBit, long score) {
            this.evt = evt;
            this.movieBit = movieBit;
            this.eventBit = eventBit;
            this.score = score;
        }
    }

    /*
     * A Path keeps record of which events it is made of by storing
     * all their eventBit in one long (ie, the result of ORing their
     * event bit together). Same logic applies for movies.
     */
    private static class Path{
        long allMoviesMask = 0L;
        long allEventsMask = 0L;
        long overallScore = 0L;

        public long getOverallScore() {
            return overallScore;
        }

        public Path(long allMoviesMask, long allEventsMask, long overallScore) {
            this.allMoviesMask = allMoviesMask;
            this.allEventsMask = allEventsMask;
            this.overallScore = overallScore;
        }

        public Path augment(Node node){
            return new Path(
                this.allMoviesMask | node.movieBit,
                    this.allEventsMask | node.eventBit,
                    this.overallScore + node.score
            );
        }

        static Path empty(){
            return new Path(
                0, 0, 0
            );
        }

        public boolean hasRedundancy(){
            return Long.bitCount(allMoviesMask) != Long.bitCount(allEventsMask);
        }

        public boolean noOverlap(Path otherPath){
            return Long.bitCount(this.allMoviesMask | otherPath.allMoviesMask) ==
                    Long.bitCount(this.allEventsMask | otherPath.allEventsMask);
        }

        public Path merge(Path otherPath){
            return new Path(
                this.allMoviesMask | otherPath.allMoviesMask,
                    this.allEventsMask | otherPath.allEventsMask,
                    this.overallScore + otherPath.overallScore
            );
        }

        static Path justNode(Node node){
            return new Path(
                node.movieBit,
                node.eventBit,
                node.score
            );
        }

    }


    /*
     * This class will assign a single bit for each movies and also will keep tab
     * of which movie corresponds to which bit (see Node).
     *
     * PlannerEvents of type OtherActivites have no movie, in that case a
     * surrogate ID will be assigned.
     */
    private static class MoviesBitmask{
        private Random rnd = new Random();
        private Map<Long, Long> movieBits = new HashMap<>(MAX_SIZE);
        private long cursor = 1L;

        long retrieveOrAssign(PlannerEvent evt){
            Long movieId = evt.getMovie();
            if (movieId == null){
                movieId = Long.valueOf(rnd.nextInt(1000)-1500);
            }
            if (! movieBits.containsKey(movieId)){
                movieBits.put(movieId, cursor);
                cursor <<= 1;
            }
            return movieBits.get(movieId);
        }
    }

    /*
     * This class does the same than MoviesBitMask, but for events.
     */
    private static class EventsBitmask{
        private Map<PlannerEvent, Long> eventBits = new HashMap<>(MAX_SIZE);
        private Map<Long, PlannerEvent> reverseMapping = new HashMap<>(MAX_SIZE);
        private long cursor = 1L;

        long retrieveOrAssign(PlannerEvent evt){
            long mask = cursor;
            eventBits.put(evt, cursor);
            reverseMapping.put(cursor, evt);
            cursor <<= 1;
            return mask;
        }

        Collection<PlannerEvent> retrieveByMask(long mask){
            List<PlannerEvent> result = new ArrayList<>();
            long cursor = 1L;
            for (int i=0; i<63; i++){
                if ((mask & cursor) != 0){
                    result.add(reverseMapping.get(cursor));
                }
                cursor <<= 1;
            }
            return result;
        }
    }

}



