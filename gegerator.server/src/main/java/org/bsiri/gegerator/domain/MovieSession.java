package org.bsiri.gegerator.domain;

import lombok.*;
import org.springframework.data.annotation.Id;

import java.time.LocalDateTime;

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
    private @NonNull LocalDateTime startTime;

    public void setId(Long id) {
        this.id = id;
    }
}