package org.bsiri.gegerator.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.bsiri.gegerator.config.AppState;
import org.bsiri.gegerator.services.AppStateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.http.codec.multipart.Part;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;


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
    public ResponseEntity<Mono<? extends Resource>> dumpAsFile(){

        /*
            Using piped streams for serializing straight from Jackson to
            the server output stream. This is essentially for fun because we
            don't really need such setup (volume of data is expected to
            be very small and could fit in whole in the memory).

            Note: both the input and output streams will be closed
            automatically on success by the server as usual.
        */

        PipedInputStream resourceIn = new PipedInputStream();
        PipedOutputStream jsonOut = new PipedOutputStream();

        connect(jsonOut, resourceIn);

        // (new) producer thread : fetching then dumping the data into the stream here...
        service.dumpAppState()
                .publishOn(Schedulers.boundedElastic())
                .subscribe(
                    loadedState -> this.serializeToStream(loadedState, jsonOut),
                    ex -> closeOnError(ex, jsonOut, resourceIn)
                );

        // ... (current) consumer thread:  we return the EntityResponse immediately.
        // It'll block until the other thread starts producing data in the stream.
        return ResponseEntity
                .ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "filename=gegerator.json")
                .body(
                    Mono.just(new InputStreamResource(resourceIn))
                        .doOnError(ex -> closeOnError(ex, jsonOut, resourceIn))
                );
    }


    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Mono<AppState>> dumpAsJson(){
        return ResponseEntity.ok().body(service.dumpAppState());
    }


    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE ,produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Mono<AppState>> load(@RequestPart("file") Mono<FilePart> partMono){

        Mono<AppState> loadedAppState = partMono.flatMapMany(Part::content)
                .map(DataBuffer::asInputStream)
                .map(this::readAppState)
                .flatMap(service::loadAppState)
                .last();

        return ResponseEntity.ok().body(loadedAppState);
    }

    // ************ internal boilerplate *****************

    // method necessary to wrap the checked exception as an unchecked one
    private AppState readAppState(InputStream stream){
        try{
            return objectMapper.readValue(stream, AppState.class);
        }
        catch(IOException ex){
            throw new RuntimeException(ex);
        }
    }

    private void connect(PipedOutputStream out, PipedInputStream in){
        try{
            in.connect(out);
        }
        catch (IOException ioex){
            throw new RuntimeException(ioex);
        }
    }

    private void serializeToStream(AppState appState, PipedOutputStream out){
        try{
            objectMapper
                    .writerWithDefaultPrettyPrinter()
                    .writeValue(out, appState);
        }
        catch (IOException ex){
            throw new RuntimeException(ex);
        }
    }

    private void closeOnError(Throwable sourceEx, Closeable... closeables) throws RuntimeException{
        for (Closeable closable : closeables){
            try{
                closable.close();
            }
            catch (IOException ioex){
                sourceEx.addSuppressed(ioex);
            }
        }

        if (RuntimeException.class.isAssignableFrom(sourceEx.getClass())){
            throw (RuntimeException) sourceEx;
        }
        else{
            throw new RuntimeException(sourceEx);
        }
    }

}
