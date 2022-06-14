package org.bsiri.gegerator.planner;

import org.bsiri.gegerator.domain.TheaterDistanceTravel;

import java.time.DayOfWeek;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

public class RankedPathGraphPlanner implements WizardPlanner {

    // this is not an arbitrary value : we want
    // to use longs as masks so we assume 64bits.
    private static final int MAX_SIZE = 64;

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

        thursdayGraph = new SubGraph(nodesByDay.get(DayOfWeek.THURSDAY));
        fridayGraph = new SubGraph(nodesByDay.get(DayOfWeek.FRIDAY));
        saturdayGraph = new SubGraph(nodesByDay.get(DayOfWeek.SATURDAY));
        sundayGraph = new SubGraph(nodesByDay.get(DayOfWeek.SUNDAY));
    }


    private List<Node> preprocess(Collection<PlannerEvent> events){
         List<PlannerEvent> sortedByScore = events.stream().sorted(
            Comparator.comparing(PlannerEvent::getScore)
                    .reversed()
                    .thenComparing(PlannerEvent::getDay)
        ).collect(Collectors.toList());


        List<PlannerEvent> shortlist = new ArrayList<>(sortedByScore.subList(0, Math.min(sortedByScore.size(), MAX_SIZE)));

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
        List<Path> thursdayPaths = thursdayGraph.evaluateAllPaths();
        List<Path> fridayPaths = fridayGraph.evaluateAllPaths();
        List<Path> saturdayPaths = saturdayGraph.evaluateAllPaths();
        List<Path> sundayPaths = sundayGraph.evaluateAllPaths();

        return thursdayPaths.size() + fridayPaths.size()  + saturdayPaths.size() + sundayPaths.size();
    }


    @Override
    public List<PlannerEvent> findBestRoadmap() {

        /*
            0. Ne conserver que les 64 événements les plus fortement valués ?
               Voir si finalement une implem avec des node-edge explicitement
               objets ne serait pas plus intéressant ?

            1. Calculer les scores de tous les chemins de chaque sous graphe
               en les scores et chemins par masques de films (long).

            2. Ensuite, aggréger les chemins en écartant ceux qui sont
               incompatibles en terme de films
               (Long.bitCount(movie1) + Long.bitCount(movie2) = Long.bitCount(moviemask1 & moviemask2))

            3. Sélectionner le chemin reconstruit qui a le meilleur score.

         */

        return Collections.emptyList();
    }


    // *************** subgraphs *****************

    private final class SubGraph{
        Node[] nodes;
        int[][] adjacency;

        public SubGraph(List<Node> nodes) {
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
                    if (! isTransitionFeasible(src, dst)) continue;
                    adjacency[iSrc][iDst] = 1;
                }
            }
        }

        /*
        public long countPaths(){
            long[] nodepaths = new long[nodes.length];
            nodepaths[nodes.length -1] = 1L;
            for (int j = nodes.length-1; j>=0; j--){
                for (int i = j+1; i < nodes.length; i++){
                    if (adjacency[j][i] == 1){
                        nodepaths[j] += nodepaths[i];
                    }
                }
            }
            return nodepaths[0];
        }
         */

        List<Path> evaluateAllPaths(){

            List<Path>[] pathsByNodes = new List[nodes.length];
            for (int i=0; i<nodes.length; i++) {
                pathsByNodes[i] = new ArrayList<Path>();
            }

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

            return Arrays.stream(pathsByNodes)
                    .flatMap(List::stream)
                    // filter inconsistent results
                    .filter(path -> Long.bitCount(path.allEventsMask) == Long.bitCount(path.allMoviesMask))
                    .collect(Collectors.toList());
        }

        /**
         * Test whether if the start time of event 'dst' is after the endtime of 'src',
         * while also accounting for external factors such as travel time.
         *
         * @param src
         * @param dst
         * @return
         */
        private boolean isTransitionFeasible(TimeAndSpaceLocation src, TimeAndSpaceLocation dst){
            Duration travel = TheaterDistanceTravel.get(src.getTheater(), dst.getTheater());
            return src.getEndTime().plus(travel).isBefore(dst.getStartTime());
        }
    }

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
    
    private static class Path{
        long allMoviesMask = 0L;
        long allEventsMask = 0L;
        long overallScore = 0L;

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

        public boolean canMerge(Path otherPath){
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

    private static class MoviesBitmask{
        private Random rnd = new Random();
        private Map<Long, Long> movieBits = new HashMap<>(MAX_SIZE);
        private long cursor = 1L;

        long retrieveOrAssign(PlannerEvent evt){
            Long movieId = evt.getMovie();
            if (movieId == null){
                movieId = Long.valueOf(-rnd.nextInt(1000)+1000);
            }
            if (! movieBits.containsKey(movieId)){
                movieBits.put(movieId, cursor);
                cursor <<= 1;
            }
            return movieBits.get(movieId);
        }
    }

    private static class EventsBitmask{
        private Map<PlannerEvent, Long> eventBits = new HashMap<>(MAX_SIZE);
        private long cursor = 1L;

        long retrieveOrAssign(PlannerEvent evt){
            if (!eventBits.containsKey(evt)){
                eventBits.put(evt, cursor);
                cursor <<= 1;
            }
            return eventBits.get(evt);
        }
    }

}



