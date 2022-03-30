package org.bsiri.gegerator.testinfra;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface SqlDataset {
    /**
     * The sql dataset classpath path.
     *
     * @return
     */
    String value();
}
