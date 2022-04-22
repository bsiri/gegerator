package org.bsiri.gegerator.controllers;

import org.bsiri.gegerator.exceptions.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import reactor.core.publisher.Mono;


@RestControllerAdvice
public class BusinessExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity handleBusinessException(BusinessException ex){
        return ResponseEntity
                .status(HttpStatus.PRECONDITION_FAILED)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Mono.just(ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity handleOtherException(Exception ex){
        ex.printStackTrace();
        String message = String.format("Gros problème %s : %s", ex.getClass().getName(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Mono.just(message));
    }
}