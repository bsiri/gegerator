package org.bsiri.gegerator.domain;

import lombok.*;
import org.springframework.data.annotation.Id;

import java.time.Duration;

@Getter
@Setter
@NoArgsConstructor
@RequiredArgsConstructor
@EqualsAndHashCode(exclude = "id")
public class Movie implements Identifiable {

    @Id
    private Long id;
    private @NonNull String title;
    private @NonNull Duration duration;
    private @NonNull MovieRating rating;

    private void setId(Long id) {
        this.id = id;
    }

    @Override
    public String toString(){
        long seconds = duration.getSeconds();
        String strDuration = String.format("%02d:%02d", seconds / 3600, (seconds % 3600) / 60);
        return String.format(
            "Movie(id=%d, title='%s', duration=%s, rating=%s)", this.id, this.title, strDuration, rating
        );
    }

    public static Movie of(Long id, String title, Duration duration, MovieRating rating){
        Movie m = new Movie(title, duration, rating);
        m.setId(id);
        return m;
    }

}
