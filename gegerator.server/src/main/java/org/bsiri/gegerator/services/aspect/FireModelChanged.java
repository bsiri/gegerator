package org.bsiri.gegerator.services.aspect;

import org.bsiri.gegerator.services.events.ModelChangeEvent;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface FireModelChanged {
    Class<? extends ModelChangeEvent> value();
}
