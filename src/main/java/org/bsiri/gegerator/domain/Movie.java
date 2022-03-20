package org.bsiri.gegerator.domain;

import org.springframework.data.annotation.Id;

public class Movie implements Identifiable {

    @Id
    private Long id;

    private String name;

    public Movie(String name){
        this.name = name;
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

    @Override
    public String toString(){
        return String.format("Movie(id=%d, name='%s')", this.id, this.name);
    }
}
