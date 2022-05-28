package org.bsiri.gegerator.config;


// TODO : make the scoring configurable via a file ?

import org.bsiri.gegerator.domain.EventRating;
import org.bsiri.gegerator.domain.MovieRating;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.HashMap;
import java.util.Map;

@ConfigurationProperties(prefix = "scoring")
public class Scoring {

    private TheaterScores theaters;
    private MovieScores movies;
    private EventScore events;


    public Integer getScore(TheaterRating rating){
        return theaters.getScores().get(rating);
    }

    public Integer getScore(MovieRating rating){
        return movies.getScores().get(rating);
    }

    public Integer getScore(EventRating rating){
        return events.getScores().get(rating);
    }


    public static final class TheaterScores{
        private final Map<TheaterRating, Integer> scores = new HashMap<>();

        public Map<TheaterRating, Integer> getScores(){
            return scores;
        }
    }

    public static final class MovieScores{
        private final Map<MovieRating, Integer> scores = new HashMap<>();

        public Map<MovieRating, Integer> getScores(){
            return scores;
        }
    }

    public static final class EventScore{
        private final Map<EventRating, Integer> scores = new HashMap<>();

        public Map<EventRating, Integer> getScores(){
            return scores;
        }
    }
}
