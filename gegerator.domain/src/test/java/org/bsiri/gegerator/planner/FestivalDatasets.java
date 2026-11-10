package org.bsiri.gegerator.planner;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.bsiri.gegerator.domain.Theater;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalTime;
import java.util.*;

/**
 * Realistic datasets for the planners:
 * - the actual grids of the past festivals (see directory /samples at the root of the project),
 * - generated grids that look like the actual ones, of any size.
 *
 * The scores are computed the same way the application does (see WizardServiceImpl
 * and the section 'scoring' of application.yml).
 */
public class FestivalDatasets {

    public static final String GEGE_2020 = "gege_2020.json";
    /** Nothing is rated yet: all scores are equal, which makes many equivalent roadmaps */
    public static final String GEGE_2023_UNRATED = "gege_2023.2.json";
    public static final String GEGE_2023 = "gege_2023.3.final.json";
    public static final String GEGE_2026 = "gege_2026.json";

    public static final List<String> ALL_SAMPLES = List.of(GEGE_2020, GEGE_2023_UNRATED, GEGE_2023, GEGE_2026);

    private static final Map<String, Integer> RATING_SCORES = Map.of(
            "HIGHEST", 1000,
            "HIGH", 100,
            "DEFAULT", 10,
            "NEVER", -99999
    );
    private static final Map<String, Integer> EVENT_RATING_SCORES = Map.of(
            "MANDATORY", 999999,
            "DEFAULT", 0,
            "NEVER", -999999
    );

    private FestivalDatasets() {}

    // ****************** actual grids ******************

    /**
     * Loads one of the appdata exports located in the directory /samples.
     */
    public static List<PlannerEvent> load(String sampleName) {
        JsonNode root;
        try {
            root = new ObjectMapper().readTree(Files.readAllBytes(locateSamples().resolve(sampleName)));
        } catch (IOException ex) {
            throw new UncheckedIOException(ex);
        }

        JsonNode wizconf = root.get("wizardConfiguration");
        double bias = wizconf.get("movieVsTheaterBias").asDouble();
        Map<Theater, Integer> theaterScores = new EnumMap<>(Theater.class);
        theaterScores.put(Theater.ESPACE_LAC, RATING_SCORES.get(wizconf.get("espaceLacRating").asText()));
        theaterScores.put(Theater.CASINO, RATING_SCORES.get(wizconf.get("casinoRating").asText()));
        theaterScores.put(Theater.PARADISO, RATING_SCORES.get(wizconf.get("paradisoRating").asText()));
        theaterScores.put(Theater.MCL, RATING_SCORES.get(wizconf.get("mclRating").asText()));

        Map<Long, JsonNode> moviesById = new HashMap<>();
        root.get("movies").forEach(movie -> moviesById.put(movie.get("id").asLong(), movie));

        List<PlannerEvent> events = new ArrayList<>();
        for (JsonNode session : root.get("sessions")) {
            JsonNode movie = moviesById.get(session.get("movieId").asLong());
            Theater theater = Theater.valueOf(session.get("theater").asText());
            LocalTime startTime = LocalTime.parse(session.get("startTime").asText());
            events.add(new PlannerEvent(
                    null,
                    String.format("%s - %s - %s - %s", session.get("day").asText(), startTime, theater, movie.get("title").asText()),
                    sessionScore(
                            bias,
                            RATING_SCORES.get(movie.get("rating").asText()),
                            theaterScores.get(theater),
                            EVENT_RATING_SCORES.get(session.get("rating").asText())),
                    movie.get("id").asLong(),
                    theater,
                    DayOfWeek.valueOf(session.get("day").asText()),
                    startTime,
                    startTime.plus(Duration.parse(movie.get("duration").asText()))
            ));
        }
        for (JsonNode activity : root.get("activities")) {
            LocalTime startTime = LocalTime.parse(activity.get("startTime").asText());
            events.add(new PlannerEvent(
                    null,
                    String.format("%s - %s - %s", activity.get("day").asText(), startTime, activity.get("description").asText()),
                    EVENT_RATING_SCORES.get(activity.get("rating").asText()),
                    -activity.get("id").asLong(),
                    null,
                    DayOfWeek.valueOf(activity.get("day").asText()),
                    startTime,
                    LocalTime.parse(activity.get("endTime").asText())
            ));
        }
        return events;
    }

    /* Same formula as WizardServiceImpl#calculateSessionScore */
    private static int sessionScore(double bias, int movieScore, int theaterScore, int sessionScore) {
        return (int) (((1.0 - bias) * movieScore) + (bias * theaterScore) + sessionScore);
    }

    private static Path locateSamples() {
        Path dir = Path.of("").toAbsolutePath();
        while (dir != null) {
            Path samples = dir.resolve("samples");
            if (Files.exists(samples.resolve(GEGE_2026))) return samples;
            dir = dir.getParent();
        }
        throw new IllegalStateException("cannot locate the directory 'samples' from the working directory");
    }

    // ****************** generated grids ******************

    /* Typical start times of the sessions, in minutes */
    private static final int[] SLOTS = {9 * 60, 11 * 60 + 15, 14 * 60, 16 * 60 + 30, 19 * 60, 21 * 60 + 30};

    /**
     * Generates a grid that looks like an actual one, with ratings as they would be
     * once the users have expressed their preferences:
     * - four theaters, with different ratings,
     * - each theater shows a session per time slot (give or take 30 minutes), until
     *   the requested number of sessions is reached. When there are more sessions than
     *   slots available, the extra sessions are squeezed in anyway.
     * - a movie lasts between 80 and 125 minutes, and has 2.4 sessions on average,
     * - 20% of the movies are rated HIGHEST, 15% HIGH, 55% DEFAULT, 10% NEVER,
     * - 5% of the sessions are MANDATORY, 5% are NEVER.
     *
     * @param seed       for reproducibility
     * @param nbDays     at most 7, the last day is always sunday
     * @param nbSessions total number of sessions over the festival
     */
    public static List<PlannerEvent> generate(long seed, int nbDays, int nbSessions) {
        return generate(seed, nbDays, nbSessions, true);
    }

    /**
     * Same as {@link #generate(long, int, int)}, but nothing is rated : every score is
     * the same. This is the state of the grid when the users begin to work with it.
     */
    public static List<PlannerEvent> generateUnrated(long seed, int nbDays, int nbSessions) {
        return generate(seed, nbDays, nbSessions, false);
    }

    private static List<PlannerEvent> generate(long seed, int nbDays, int nbSessions, boolean rated) {
        Random rand = new Random(seed);
        DayOfWeek[] days = Arrays.copyOfRange(DayOfWeek.values(), 7 - nbDays, 7);
        Theater[] theaters = Theater.values();
        int[] theaterScores = rated ? new int[]{1000, 100, 10, 10} : new int[]{10, 10, 10, 10};

        // the movies
        int nbMovies = Math.max(1, (int) Math.round(nbSessions / 2.4));
        int[] movieDurations = new int[nbMovies];
        int[] movieScores = new int[nbMovies];
        for (int m = 0; m < nbMovies; m++) {
            movieDurations[m] = 80 + rand.nextInt(46);
            float pick = rand.nextFloat();
            movieScores[m] = !rated ? 10 :
                    (pick < 0.20) ? 1000 :
                    (pick < 0.35) ? 100 :
                    (pick < 0.90) ? 10 : -99999;
        }

        // every movie is shown at least once, the other sessions are picked at random
        List<Integer> sessionMovies = new ArrayList<>();
        for (int s = 0; s < nbSessions; s++) {
            sessionMovies.add(s < nbMovies ? s : rand.nextInt(nbMovies));
        }
        Collections.shuffle(sessionMovies, rand);

        // every (day, theater, slot) is used once before any is used twice
        List<int[]> places = new ArrayList<>();
        while (places.size() < nbSessions) {
            List<int[]> round = new ArrayList<>();
            for (int d = 0; d < days.length; d++) {
                for (int t = 0; t < theaters.length; t++) {
                    for (int slot : SLOTS) round.add(new int[]{d, t, slot});
                }
            }
            Collections.shuffle(round, rand);
            places.addAll(round);
        }

        List<PlannerEvent> events = new ArrayList<>();
        for (int s = 0; s < nbSessions; s++) {
            int[] place = places.get(s);
            int movie = sessionMovies.get(s);
            DayOfWeek day = days[place[0]];
            Theater theater = theaters[place[1]];
            LocalTime startTime = LocalTime.ofSecondOfDay(60L * (place[2] + rand.nextInt(61) - 30));

            float pick = rand.nextFloat();
            int eventScore = !rated ? 0 :
                    (pick < 0.05) ? 999999 :
                    (pick < 0.10) ? -999999 : 0;

            events.add(new PlannerEvent(
                    null,
                    String.format("%s - %s - %s - movie %d", day, startTime, theater, movie),
                    sessionScore(0.5, movieScores[movie], theaterScores[place[1]], eventScore),
                    (long) movie,
                    theater,
                    day,
                    startTime,
                    startTime.plusMinutes(movieDurations[movie])
            ));
        }
        return events;
    }

    // ****************** validation ******************

    public static long totalScore(Collection<PlannerEvent> roadmap) {
        return roadmap.stream().mapToLong(PlannerEvent::getScore).sum();
    }

    /**
     * @return null if the roadmap is valid (no two events overlap, no movie is planned
     * twice), or the description of the first problem found.
     */
    public static String findInconsistency(List<PlannerEvent> roadmap) {
        for (int i = 0; i < roadmap.size(); i++) {
            for (int j = i + 1; j < roadmap.size(); j++) {
                PlannerEvent one = roadmap.get(i);
                PlannerEvent other = roadmap.get(j);
                if (one.getMovie() != null && one.getMovie().equals(other.getMovie())) {
                    return String.format("same movie planned twice : '%s' and '%s'", one, other);
                }
                if (TimeAndSpaceLocation.overlap(one, other)) {
                    return String.format("overlapping events : '%s' and '%s'", one, other);
                }
            }
        }
        return null;
    }
}
