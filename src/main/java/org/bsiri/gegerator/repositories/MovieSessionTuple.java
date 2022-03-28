package org.bsiri.gegerator.repositories;

import org.bsiri.gegerator.domain.Identifiable;
import org.bsiri.gegerator.domain.Theater;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Table("movie_session")
public class MovieSessionTuple implements Identifiable {

    @Id
    private Long id;
    private Theater theater;
    private LocalDateTime startTime;

    // r2dbc isn't yet as mature as JPA unfortunately
    private Long movieId;


    public MovieSessionTuple(Long movieId, Theater theater, LocalDateTime startTime) {
        this.movieId = movieId;
        this.theater = theater;
        this.startTime = startTime;
    }

    @Override
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Theater getTheater() {
        return theater;
    }

    public void setTheater(Theater theater) {
        this.theater = theater;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public Long getMovieId() {
        return movieId;
    }

    public void setMovieId(Long movieId) {
        this.movieId = movieId;
    }
}
