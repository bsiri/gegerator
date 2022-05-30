package org.bsiri.gegerator.controllers;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.time.Duration;

/*
    TODO: discard when I've a better understanding of what's going on
 */
@RestController("timer-controller")
@RequestMapping(path = "/timer")
public class TimingController {

    private Flux<Long> timer = Flux.interval(Duration.ofSeconds(1)).log();

    public TimingController(){ }

    @GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<Long> getTimer(){
        return timer;
    }

    @GetMapping(path="test-page", produces = MediaType.TEXT_HTML_VALUE)
    public @ResponseBody  String getTestPage(){
        return "<html><body><div id=\"app-mainview\"></div></body></html>";
    }

}
