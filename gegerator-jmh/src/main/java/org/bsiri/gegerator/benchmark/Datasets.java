package org.bsiri.gegerator.benchmark;

import org.bsiri.gegerator.planner.PlannerEvent;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import static org.bsiri.gegerator.planner.PlannerEventHelper.*;

public class Datasets {
    static private Long NO_MOVIE = null;
    static private Long MOVIE_1 = 1L;
    static private Long MOVIE_2 = 2L;
    static private Long MOVIE_3 = 3L;
    static private Long MOVIE_4 = 4L;

    static private long OUTSTANDING_SCORE = 100000;
    static private long SUPER_SCORE = 1000;
    static private long MEDIUM_SCORE = 500;
    static private long AVERAGE_SCORE = 0;
    static private long AWFUL_SCORE = -1000;


    public static List<PlannerEvent> shuffledSmallDataset(){
        List<PlannerEvent> events = Arrays.asList(
            // THURSDAY
            event("movie 1 awfull", AWFUL_SCORE, MOVIE_1, "PARADISO | THURSDAY | 08:00 | 09:00"),
            event("movie 2 super", SUPER_SCORE, MOVIE_2, "ESPACE_LAC | THURSDAY | 10:00 | 11:00"),
            event("movie 3 medium", MEDIUM_SCORE, MOVIE_3, "CASINO | THURSDAY | 12:00 | 13:00"),
            event("movie 4 average", AVERAGE_SCORE, MOVIE_4, "MCL | THURSDAY | 14:00 | 15:00"),

            // FRIDAY
            event("movie 2 awfull", AWFUL_SCORE, MOVIE_2, "PARADISO | FRIDAY | 08:00 | 09:00"),
            event("movie 3 super", SUPER_SCORE, MOVIE_3, "ESPACE_LAC | FRIDAY | 10:00 | 11:00"),
            event("movie 4 medium", MEDIUM_SCORE, MOVIE_4, "CASINO | FRIDAY | 12:00 | 13:00"),
            event("movie 1 average", AVERAGE_SCORE, MOVIE_1, "MCL | FRIDAY | 14:00 | 15:00"),

            // SATURDAY + RESTAURANT
            event("movie 3 awfull", AWFUL_SCORE, MOVIE_3, "PARADISO | SATURDAY | 08:00 | 09:00"),
            event("movie 4 super", SUPER_SCORE, MOVIE_4, "ESPACE_LAC | SATURDAY | 10:00 | 11:00"),
            event("restaurant", OUTSTANDING_SCORE, NO_MOVIE, "| SATURDAY | 10:30 | 11:30"),
            event("movie 1 medium", MEDIUM_SCORE, MOVIE_1, "CASINO | SATURDAY | 12:00 | 13:00"),
            event("movie 2 average", AVERAGE_SCORE, MOVIE_2, "MCL | SATURDAY | 14:00 | 15:00"),

            // SUNDAY
            event("movie 4 awfull", AWFUL_SCORE, MOVIE_4, "PARADISO | SUNDAY | 08:00 | 09:00"),
            event("movie 1 super", SUPER_SCORE, MOVIE_1, "ESPACE_LAC | SUNDAY | 10:00 | 11:00"),
            event("movie 2 medium", MEDIUM_SCORE, MOVIE_2, "CASINO | SUNDAY | 12:00 | 13:00"),
            event("movie 3 average", AVERAGE_SCORE, MOVIE_3, "MCL | SUNDAY | 14:00 | 15:00")
        );
        Collections.shuffle(events);
        return events;
    }
}
