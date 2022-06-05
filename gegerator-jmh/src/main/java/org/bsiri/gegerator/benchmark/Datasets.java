package org.bsiri.gegerator.benchmark;

import org.bsiri.gegerator.domain.Theater;
import org.bsiri.gegerator.planner.PlannerEvent;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

import static org.bsiri.gegerator.planner.PlannerEventHelper.*;

public class Datasets {

    private static Random random = new Random();

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


    /**
     * Generates a list of events according to the given spec
     * Warning : if you try to generate too many event, chances are
     * that the function never completes because due to its crude brute force
     * nature it could end stuck !
     * @param nbSessions
     * @param nbOtherActivities
     * @return
     */
    public static List<PlannerEvent> generateDatasetOf(int nbSessions, int nbOtherActivities){
        // empirically we measured that the average number of session per movies is around 2.04
        // so we use that ration to infer how many movies should be planned
        int nbMovies = nbSessions / 2;

        List<PlannerEvent> events = new ArrayList<>(nbSessions+nbOtherActivities);

        int scnt = nbSessions;
        while (scnt > 0){
            PlannerEvent newEvent = randomSession(nbMovies);
            if (isConsistent(events, newEvent)){
                events.add(newEvent);
                scnt--;
            }
        }

        int acnt = nbOtherActivities;
        while (acnt > 0){
            PlannerEvent activity = randomActivity();
            if (isConsistent(events, activity)){
                events.add(activity);
                acnt--;
            }
        }
        return events;

    }

    private static PlannerEvent randomSession(int nbMovies){
        LocalTime[] startEnd = randStartEndTime();
        return new PlannerEvent(
                null,
                "session-"+random.nextInt(1000),
                randScore(),
                randomMovie(nbMovies),
                randTheater(),
                randDay(),
                startEnd[0],
                startEnd[1]
        );
    }


    private static PlannerEvent randomActivity(){
        LocalTime[] startEnd = randStartEndTime();
        return new PlannerEvent(
                null,
                "activity-"+random.nextInt(1000),
                randScore(),
                null,
                null,
                randDay(),
                startEnd[0],
                startEnd[1]
        );

    }

    private static DayOfWeek randDay(){
        // from thursday to sunday inclusive
        // remember that for DayOfWeeks, ordering starts at 1 so thursday
        // is the 4th day of the week for real
        return DayOfWeek.of(random.nextInt(4)+4);
    }

    private static Theater randTheater(){
        return Theater.values()[random.nextInt(4)];
    }

    private static long randomMovie(int totalMovies){
        return random.nextInt(totalMovies);
    }

    private static LocalTime[] randStartEndTime(){
        // starttime : not before 8h nor after 21h59
        // endtime : somewhere between 45 and 2h after start time
        int starthour = random.nextInt(13)+8;
        int startminute = random.nextInt(60);
        LocalTime startTime = LocalTime.of(starthour, startminute);
        LocalTime endTime = startTime.plus(Duration.ofMinutes(random.nextInt(175)+45));
        return new LocalTime[]{startTime, endTime};
    }

    private static int randScore(){
        return random.nextInt(100000)-50000;
    }

    private static boolean isConsistent(Collection<PlannerEvent> events, PlannerEvent candidateEvent){
        // we assume that the day and theater are all the same,
        // and we only focus on checking whether there is a conflict in times.
        Optional<PlannerEvent> conflict = events.stream().filter(event -> overlap(event, candidateEvent) ).findAny();
        return ! conflict.isPresent();
    }

    private static boolean overlap(PlannerEvent event1, PlannerEvent event2){
        // Not same day -> ok
        if (event1.getDay() != event2.getDay()){
            return false;
        }
        // Not same place -> ok
        if (event1.getTheater() != event2.getTheater()){
            return false;
        }
        // time overlap ?
        boolean evt1BeforeEvt2 = event1.getEndTime().isBefore(event2.getStartTime());
        boolean evt1AfterEvt2 = event1.getStartTime().isAfter(event2.getEndTime());

        return ! (evt1BeforeEvt2 | evt1AfterEvt2);

    }

    // ********** crude self-tests **************

    // for testing purpose
    public static void main(String[] args){
        eyeballLargeDatasets();
        reverseTestIsConsistent();
    }

    private static void reverseTestIsConsistent(){
        // reverse test : we use a dataset we know as consistent,
        // and we apply isConsistent on it
        Deque<PlannerEvent> events = new LinkedList<>(Datasets.shuffledSmallDataset());

        while (! events.isEmpty()){
            PlannerEvent evt = events.pop();
            if (! isConsistent(events, evt)){
                System.out.println("FAAAALSE");
            }
        }

        System.out.println("method isConsistent: works");
    }

    private static void eyeballLargeDatasets(){
        List<PlannerEvent> events = Datasets.generateDatasetOf(96, 3);
        System.out.println(events.size());

        List<DayOfWeek> days = events.stream().map(PlannerEvent::getDay).distinct().collect(Collectors.toList());
        List<Theater> theaters = events.stream().map(PlannerEvent::getTheater).distinct().collect(Collectors.toList());
        long distinctMovieCount = events.stream().map(PlannerEvent::getMovie).distinct().count();

        System.out.println(days);
        System.out.println(theaters);
        System.out.println(distinctMovieCount);

    }

}
