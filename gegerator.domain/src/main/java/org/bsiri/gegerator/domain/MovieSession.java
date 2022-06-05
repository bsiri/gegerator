package org.bsiri.gegerator.domain;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@RequiredArgsConstructor
@EqualsAndHashCode(exclude = "id")
@ToString
public class MovieSession implements RatableEvent, PlannableEvent{
    @Id
    private Long id;
    // r2dbc isn't yet as mature as JPA unfortunately
    // so we cannot map directly the Movie entity
    // It's no so bad though, because I don't need to
    // manager complex grapes of entities.
    private @NonNull Long movieId;

    private @NonNull Theater theater;
    @Column("day_name")
    private @NonNull DayOfWeek day;
    private @NonNull LocalTime startTime;
    private @NonNull EventRating rating;

    public void setId(Long id) {
        this.id = id;
    }

    public void setDay(DayOfWeek day){
        // only days from thursday to sunday are allowed
        if (day.getValue() < DayOfWeek.THURSDAY.getValue()){
            throw new IllegalArgumentException("Days allowed are from THURSDAY to SUNDAY inclusive, but got : "+day.name());
        }
        this.day = day;
    }

    public static MovieSession of(long id, long movieId, Theater theater, DayOfWeek day, LocalTime startTime, EventRating rating){
        MovieSession session = new MovieSession(movieId, theater, day, startTime, rating);
        session.setId(id);
        return session;
    }
}