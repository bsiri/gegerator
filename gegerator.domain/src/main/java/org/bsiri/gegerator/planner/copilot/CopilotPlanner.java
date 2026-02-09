package org.bsiri.gegerator.planner.copilot;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.bsiri.gegerator.planner.PlannerEvent;
import org.bsiri.gegerator.planner.TimeAndSpaceLocation;
import org.bsiri.gegerator.planner.WizardPlanner;

/**
 * Implementation of WizardPlanner by Copilot, after the specs in `specs/feat-betterplanner.md`
 * 
 */
public class CopilotPlanner implements WizardPlanner{

    final private List<PlannerEvent> events;

    public CopilotPlanner(List<PlannerEvent> events){
        this.events = events;
    }

    @Override
    public List<PlannerEvent> findBestRoadmap() {
        List<PlannerEvent> candidates = events.stream()
                .filter(event -> event.getScore() >= 0)
                .collect(Collectors.toList());

        if (candidates.isEmpty()){
            return List.of();
        }

        int size = candidates.size();
        boolean[][] overlap = new boolean[size][size];
        for (int i = 0; i < size; i++){
            for (int j = i + 1; j < size; j++){
                boolean isOverlap = TimeAndSpaceLocation.overlap(candidates.get(i), candidates.get(j));
                overlap[i][j] = isOverlap;
                overlap[j][i] = isOverlap;
            }
        }

        List<Integer> order = buildScoreOrder(candidates);
        boolean[] selected = new boolean[size];
        Map<Long, Integer> selectedByMovie = new HashMap<>();
        int[] marks = new int[size];
        int markId = 1;
        int maxPasses = 3;
        for (int pass = 0; pass < maxPasses; pass++){
            boolean improved = false;
            for (int index : order){
                if (selected[index]){
                    continue;
                }

                PlannerEvent candidate = candidates.get(index);
                long candidateScore = candidate.getScore();
                Long candidateMovieKey = movieKey(candidate.getMovie(), index);

                markId++;
                List<Integer> toRemove = new ArrayList<>();
                long removeScore = 0;

                for (int i = 0; i < size; i++){
                    if (!selected[i]){
                        continue;
                    }
                    if (!overlap[index][i]){
                        continue;
                    }
                    if (marks[i] == markId){
                        continue;
                    }
                    marks[i] = markId;
                    toRemove.add(i);
                    removeScore += candidates.get(i).getScore();
                }

                Integer sameMovieIndex = selectedByMovie.get(candidateMovieKey);
                if (sameMovieIndex != null && sameMovieIndex != index && marks[sameMovieIndex] != markId){
                    marks[sameMovieIndex] = markId;
                    toRemove.add(sameMovieIndex);
                    removeScore += candidates.get(sameMovieIndex).getScore();
                }

                if (toRemove.isEmpty()){
                    selected[index] = true;
                    selectedByMovie.put(candidateMovieKey, index);
                    improved = true;
                    continue;
                }

                if (candidateScore > removeScore){
                    for (int removeIndex : toRemove){
                        if (!selected[removeIndex]){
                            continue;
                        }
                        PlannerEvent removed = candidates.get(removeIndex);
                        Long removedMovieKey = movieKey(removed.getMovie(), removeIndex);
                        if (selectedByMovie.get(removedMovieKey) != null
                                && selectedByMovie.get(removedMovieKey) == removeIndex){
                            selectedByMovie.remove(removedMovieKey);
                        }
                        selected[removeIndex] = false;
                    }

                    selected[index] = true;
                    selectedByMovie.put(candidateMovieKey, index);
                    improved = true;
                }
            }

            if (!improved){
                break;
            }
        }

        List<PlannerEvent> result = new ArrayList<>();
        for (int i = 0; i < size; i++){
            if (selected[i]){
                result.add(candidates.get(i));
            }
        }

        result.sort(Comparator
                .comparing(PlannerEvent::getDay)
                .thenComparing(PlannerEvent::getStartTime)
                .thenComparing(PlannerEvent::getEndTime)
                .thenComparing(PlannerEvent::getName));
        return result;
    }

    private static List<Integer> buildScoreOrder(List<PlannerEvent> candidates){
        Comparator<PlannerEvent> timeComparator = Comparator
                .comparing(PlannerEvent::getDay)
                .thenComparing(PlannerEvent::getStartTime)
                .thenComparing(PlannerEvent::getEndTime)
                .thenComparing(PlannerEvent::getName);

        List<Integer> order = new ArrayList<>();
        for (int i = 0; i < candidates.size(); i++){
            order.add(i);
        }

        order.sort((left, right) -> {
            PlannerEvent leftEvent = candidates.get(left);
            PlannerEvent rightEvent = candidates.get(right);
            int scoreCompare = Long.compare(rightEvent.getScore(), leftEvent.getScore());
            if (scoreCompare != 0){
                return scoreCompare;
            }
            return timeComparator.compare(leftEvent, rightEvent);
        });

        return order;
    }

    private static Long movieKey(Long movieId, int index){
        if (movieId == null){
            return Long.MIN_VALUE + index;
        }
        return movieId;
    }
    

}
