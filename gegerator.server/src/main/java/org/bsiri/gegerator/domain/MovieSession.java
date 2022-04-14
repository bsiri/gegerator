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
@ToString
public class MovieSession {
    @Id
    private Long id;
    // r2dbc isn't yet as mature as JPA unfortunately
    // so we cannot map directly the Movie entity
    // It's no so bad though, because I don't need to
    // manager complex grapes of entities.
    private @NonNull Long movieId;

    private @NonNull Theater theater;
    @Column("day_name")
    private @NonNull Day day;
    private @NonNull LocalTime startTime;

    public void setId(Long id) {
        this.id = id;
    }
}