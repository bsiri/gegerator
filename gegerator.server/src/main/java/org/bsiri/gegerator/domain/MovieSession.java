package org.bsiri.gegerator.domain;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@RequiredArgsConstructor
@EqualsAndHashCode(exclude = "id")
@ToString
public class MovieSession {
    private Long id;
    private @NonNull Movie movie;
    private @NonNull Theater theater;
    private @NonNull LocalDateTime startTime;
}