package org.bsiri.gegerator.exceptions;

import java.time.LocalTime;

public class TimeParadoxException extends BusinessException{
    public TimeParadoxException(LocalTime start, LocalTime end){
        super(String.format(
                "L'heure de fin est avant celle de début : %s et %s !",
                start.toString(),
                end.toString()
            )
        );
    }
}
