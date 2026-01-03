package org.bsiri.gegerator.config;


// TODO : make the scoring configurable via a file ?

import lombok.Getter;
import lombok.Setter;
import org.bsiri.gegerator.domain.EventRating;
import org.bsiri.gegerator.domain.MovieRating;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.HashMap;
import java.util.Map;

@ConfigurationProperties(prefix = "scoring")
@Getter
@Setter
public class Scoring {

    private Map<TheaterRating, Integer> theaters = new HashMap<>();
    private Map<MovieRating, Integer> movies = new HashMap<>();
    private Map<EventRating, Integer> events = new HashMap<>();


    public int getScore(TheaterRating rating){
        return theaters.get(rating);
    }

    public int getScore(MovieRating rating){
        return movies.get(rating);
    }

    public int getScore(EventRating rating){
        return events.get(rating);
    }
}