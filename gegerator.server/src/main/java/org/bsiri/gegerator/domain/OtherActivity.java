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
public class OtherActivity implements RatableEvent{
    @Id
    private Long id;

    @Column("day_name")
    private @NonNull DayOfWeek day;
    private @NonNull LocalTime startTime;
    private @NonNull LocalTime endTime;
    private @NonNull String description;
    private @NonNull EventRating rating;

    // TODO : maybe validation to enforce that
    // startTime < endTime, even though the DB does it already

    private void setId(long id){
        this.id = id;
    }

    public void setDay(DayOfWeek day){
        // only days from thursday to sunday are allowed
        if (day.getValue() < DayOfWeek.THURSDAY.getValue()){
            throw new IllegalArgumentException("Days allowed are from THURSDAY to SUNDAY inclusive, but got : "+day.name());
        }
        this.day = day;
    }

    public static OtherActivity of (long id, DayOfWeek day, LocalTime startTime, LocalTime endTime, String description, EventRating rating){
        OtherActivity activity = new OtherActivity(day, startTime, endTime, description, rating);
        activity.setId(id);
        return activity;
    }
}
