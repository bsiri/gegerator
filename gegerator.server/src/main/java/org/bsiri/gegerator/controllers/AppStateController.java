package org.bsiri.gegerator.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.netty.handler.codec.http.HttpResponse;
import org.bsiri.gegerator.domain.AppState;
import org.bsiri.gegerator.services.AppStateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.io.*;


@RestController("appstate-controller")
@RequestMapping(path = "/app-state")
public class AppStateController {

    private ObjectMapper serializer;
    private AppStateService service;

    public AppStateController(@Autowired AppStateService service, @Autowired ObjectMapper serializer) {
        this.service = service;
        this.serializer = serializer;
    }

    @GetMapping(produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<Mono<Resource>> dump(ServerHttpResponse response){
        return ResponseEntity
                .ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "filename=gegerator.json")
                .body(
                    service.dumpAppState().map(appState -> {
                        try {
                            PipedOutputStream jsonOut = new PipedOutputStream();
                            PipedInputStream resourceIn = new PipedInputStream();
                            resourceIn.connect(jsonOut);

                            Resource resource = new InputStreamResource(resourceIn);
                            serializer.writerWithDefaultPrettyPrinter()
                                    .writeValue(jsonOut, appState);
                            return resource;
                        }
                        catch(IOException ex){
                            throw new RuntimeException(ex);
                        }
                    })
                );
    }

    @PostMapping
    public ResponseEntity<Void> load(@RequestBody AppState appState){
        service.loadAppState(appState);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
