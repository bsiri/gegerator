package org.bsiri.gegerator.domain;

import org.springframework.data.annotation.Id;

import java.time.Duration;

public class Movie implements Identifiable {

    @Id
    private Long id;
    private String name;
    private Duration duration;

    public Movie(String name, Duration duration){
        this.name = name;
        this.duration = duration;
    }


    @Override
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public Duration getDuration() {
        return duration;
    }
    public void setDuration(Duration duration) {
        this.duration = duration;
    }
    public void setDuration(String duration){

    }

    @Override
    public String toString(){
        long seconds = duration.getSeconds();
        String strDuration = String.format("%02d:%02d", seconds / 3600, (seconds % 3600) / 60);
        return String.format("Movie(id=%d, name='%s', duration=%s)", this.id, this.name, strDuration);
    }
}
