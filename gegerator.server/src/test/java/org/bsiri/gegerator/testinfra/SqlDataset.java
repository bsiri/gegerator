package org.bsiri.gegerator.testinfra;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation that will trigger the injection of
 * the designated SQL dataset into the database.
 * The content of the database will be truncated beforehand,
 * see {@link DatasetLoader}.
 *
 * Debug note: that annotation is processed by an aspect,
 * see {@link SqlDatasetProcessorAspect}. Remember this
 * if a stacktrace seems to make no sense.
 *
 * Inspired by Spring's @Sql annotation, but that one
 * works only for regular jdbc apps (doesn't work with
 * r2dbc)
 *
 */
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