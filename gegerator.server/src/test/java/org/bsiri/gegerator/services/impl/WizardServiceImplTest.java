package org.bsiri.gegerator.services.impl;

import org.bsiri.gegerator.config.Scoring;
import org.bsiri.gegerator.config.TheaterRating;
import org.bsiri.gegerator.config.WizardConfiguration;
import org.bsiri.gegerator.domain.*;
import org.bsiri.gegerator.planner.PlannerEvent;

import static org.hamcrest.Matchers.*;
import static org.hamcrest.MatcherAssert.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.bsiri.gegerator.testinfra.TestBeans.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@ExtendWith(MockitoExtension.class)
public class WizardServiceImplTest {

    private WizardServiceImpl service;

    private Scoring scoring = defaultScoring();

    @Mock
    private WizardServiceImpl.ModelChangeDetector changeDetector;

    @BeforeEach
    public void setup(){
        service = new WizardServiceImpl(
            scoring, changeDetector
        );
    }


    @Test
    public void testScoring(){
        int halloweenDefaultScore = service.calculateSessionScore(defaultWizconf(), sundayHalloween(), halloween());
        // with no particular scoring on theater applied, the expected scode is :
        // (0.5*score_halloween) + (0.5*score_paradiso) + score_session
        // = 0.5*1000 + 0.5*0 + 0
        assertThat(500, equalTo(halloweenDefaultScore));

        int biasedScore = service.calculateSessionScore(theaterBiasedConf(), sundayHalloween(), halloween());
        // with a biased score in favor of theaters, the expected new score is :
        // 0.25*1000 + 0.75*100 + 0
        assertThat(325, equalTo(biasedScore));

    }

    @Test
    public void testCreateEventNodes(){
        List<Movie> movies = movies();
        List<MovieSession> sessions = sessions();
        List<OtherActivity> activities = activities();

        List<PlannerEvent> nodes = service.toEventNodes(
                defaultWizconf(),
                movies,
                sessions,
                activities);

        List<Long> scores = nodes.stream().
                map(PlannerEvent::getScore)
                .collect(Collectors.toList());

        List<PlannableEvent> plannable = nodes.stream()
                .map(PlannerEvent::getRepresentedEvent)
                .collect(Collectors.toList());


        assertThat(scores, contains(
            -1000000L,   // thursdayDecapitron : ok movie
            500L,        // sundayHalloween
            0L,          // saturdayDecapitron
            1000050L,    // fridayTremors
            1000000L,    // thursdayGeromoise
            0L           // saturdaySoupeAuChoux
        ));

        assertThat(plannable, contains(
            thursdayDecapitron(),
                sundayHalloween(),
                saturdayDecapitron(),
                fridayTremors(),
                thursdayGeromoise(),
                saturdaySoupeAuChoux()
        ));
    }


    // ********************* mocks *********************************

    private List<Movie> movies(){
        return Arrays.asList(decapitron(), tremors(), halloween(), theMist());
    }

    private List<MovieSession> sessions(){
        return Arrays.asList(
                thursdayDecapitron(),
                sundayHalloween(),
                saturdayDecapitron(),
                fridayTremors()
        );
    }

    private List<OtherActivity> activities(){
        return Arrays.asList(thursdayGeromoise(), saturdaySoupeAuChoux());
    }

    // ************ sample WizardConfiguration *********************

    private WizardConfiguration defaultWizconf(){
        return new WizardConfiguration();
    }

    private WizardConfiguration theaterBiasedConf(){
        WizardConfiguration wizconf = new WizardConfiguration();
        wizconf.setEspaceLacRating(TheaterRating.HIGHEST);
        wizconf.setCasinoRating(TheaterRating.HIGH);
        wizconf.setMclRating(TheaterRating.DEFAULT);
        wizconf.setParadisoRating(TheaterRating.NEVER);
        wizconf.setMovieVsTheaterBias(0.75F);
        return wizconf;
    }

    // ***************** sample scoring ***************************

    public Scoring defaultScoring(){
        Scoring scoring = new Scoring();

        scoring.getTheaters().put(TheaterRating.HIGHEST, 1000);
        scoring.getTheaters().put(TheaterRating.HIGH, 100);
        scoring.getTheaters().put(TheaterRating.DEFAULT, 0);
        scoring.getTheaters().put(TheaterRating.NEVER, -100000);

        scoring.getMovies().put(MovieRating.HIGHEST, 1000);
        scoring.getMovies().put(MovieRating.HIGH, 100);
        scoring.getMovies().put(MovieRating.DEFAULT, 0);
        scoring.getMovies().put(MovieRating.NEVER, -100000);

        scoring.getEvents().put(EventRating.MANDATORY, 1000000);
        scoring.getEvents().put(EventRating.DEFAULT, 0);
        scoring.getEvents().put(EventRating.NEVER, -1000000);

        return scoring;
    }


}
