package org.bsiri.gegerator.config;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Data;
import lombok.NonNull;
import org.bsiri.gegerator.domain.Movie;
import org.bsiri.gegerator.domain.MovieSession;
import org.bsiri.gegerator.domain.OtherActivity;

import java.util.Collection;

/**
 * AppState is not a Business domain class, it's rather used as big
 * container used in data load and dump.
 */
@Data
public class AppState {

    private @NonNull WizardConfiguration wizardConfiguration;

    @JsonDeserialize(contentAs = Movie.class)
    private @NonNull Collection<Movie> movies;

    @JsonDeserialize(contentAs = MovieSession.class)
    private @NonNull Collection<MovieSession> sessions;

    @JsonDeserialize(contentAs = OtherActivity.class)
    private  @NonNull Collection<OtherActivity> activities;
}
