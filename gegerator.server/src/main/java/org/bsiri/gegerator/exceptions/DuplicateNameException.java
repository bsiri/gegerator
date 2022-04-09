package org.bsiri.gegerator.exceptions;

public class DuplicateNameException extends BusinessException{
    public DuplicateNameException(String name) {
        super("Ce nom est déjà pris : "+name);
    }
}
