package org.bsiri.gegerator.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.bsiri.gegerator.domain.AppState;
import org.bsiri.gegerator.services.AppStateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import reactor.core.publisher.Mono;

import java.io.*;


@RestController("appstate-controller")
@RequestMapping(path = "/app-state")
public class AppStateController {

    private ObjectMapper objectMapper;
    private AppStateService service;

    public AppStateController(@Autowired AppStateService service, @Autowired ObjectMapper objectMapper) {
        this.service = service;
        this.objectMapper = objectMapper;
    }

    @GetMapping(produces = MediaType.APPLICATION_OCTET_STREAM_VALUE, params = "format=file")
    public ResponseEntity<Mono<Resource>> dumpAsFile(){
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
                            objectMapper.writerWithDefaultPrettyPrinter()
                                    .writeValue(jsonOut, appState);
                            return resource;
                        }
                        catch(IOException ex){
                            throw new RuntimeException(ex);
                        }
                    })
                );
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Mono<AppState>> dumpAsJson(){
        return ResponseEntity.ok().body(service.dumpAppState());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE ,produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Mono<AppState>> load(Mono<FilePart> part) throws IOException {

        System.out.println(part.toString());
        AppState appState = objectMapper.reader().readValue("{\"movies\": [], \"sessions\": [], \"activities\": []}");
        return ResponseEntity.ok().body(
                service.loadAppState(appState)
                .then(Mono.just(appState))
        );
    }

}
