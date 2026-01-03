package org.bsiri.gegerator.testinfra;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation that will trigger the injection of
 * the designated SQL dataset into the database, and
 * if present is picked up by {@link SqlDatasetTestExecutionListener}.
 * The content of the database will be truncated beforehand.
 *
 * Debug note: that annotation is processed by
 *
 * Inspired by Spring's @Sql annotation, but that one
 * works only for regular jdbc apps (doesn't work with
 * r2dbc)
 *
 * Update 2025-12-28: yup, problem still live and kicking:
 * https://github.com/spring-projects/spring-framework/pull/34350
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