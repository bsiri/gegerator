package org.bsiri.gegerator.repositories;

import lombok.*;
import org.bsiri.gegerator.domain.Identifiable;
import org.bsiri.gegerator.domain.Theater;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Table("movie_session")
@Getter
@Setter
@NoArgsConstructor
@RequiredArgsConstructor
@EqualsAndHashCode(exclude = "id")
public class MovieSessionTuple implements Identifiable {

    @Id
    private Long id;
    // r2dbc isn't yet as mature as JPA unfortunately
    // so we cannot map directly the Movie entity
    private @NonNull Long movieId;
    private @NonNull Theater theater;
    private @NonNull LocalDateTime startTime;

    public void setId(Long id) {
        this.id = id;
    }

}
