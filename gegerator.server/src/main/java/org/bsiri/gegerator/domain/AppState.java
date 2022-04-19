package org.bsiri.gegerator.domain;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Data;
import lombok.NonNull;

import java.util.Collection;

/**
 * AppState is not a Business domain class, it's rather used as big
 * container used in data load and dump.
 */
@Data
public class AppState {
    @JsonDeserialize(contentAs = Movie.class)
    private @NonNull Collection<Movie> movies;

    @JsonDeserialize(contentAs = MovieSession.class)
    private @NonNull Collection<MovieSession> sessions;

    @JsonDeserialize(contentAs = OtherActivity.class)
    private  @NonNull Collection<OtherActivity> activities;
}
