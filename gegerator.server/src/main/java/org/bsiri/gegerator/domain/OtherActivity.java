package org.bsiri.gegerator.domain;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@RequiredArgsConstructor
@EqualsAndHashCode(exclude = "id")
public class OtherActivity {
    @Id
    private Long id;

    @Column("day_name")
    private @NonNull Day day;
    private @NonNull LocalTime startTime;
    private @NonNull LocalTime endTime;
    private @NonNull String description;

    // TODO : maybe validation to enforce that
    // startTime < endTime, even though the DB does it already

    private void setId(long id){
        this.id = id;
    }

    public static OtherActivity of (long id, Day day, LocalTime startTime, LocalTime endTime, String description){
        OtherActivity activity = new OtherActivity(day, startTime, endTime, description);
        activity.setId(id);
        return activity;
    }
}
