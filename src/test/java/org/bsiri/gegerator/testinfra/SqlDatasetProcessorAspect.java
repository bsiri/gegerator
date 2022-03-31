package org.bsiri.gegerator.testinfra;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.core.io.ClassPathResource;
import org.springframework.r2dbc.core.DatabaseClient;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

/*
 * Handles the annotation SqlDataset.
 *
 * Weaved by AspectJ, but injected by Spring (see
 * PersistenceTestConfig).
 *
 */
@Aspect
public class SqlDatasetProcessorAspect {

    private static final String TRUNCATE_ALL =
            "delete from movie_session;"+
            "delete from movie;";

    private DatabaseClient dbClient;

    public SqlDatasetProcessorAspect(){

    }

    public void setDbClient(DatabaseClient dbClient) {
        this.dbClient = dbClient;
    }

    @Around("@annotation(org.bsiri.gegerator.testinfra.SqlDataset)")
    public Object injectDataset(ProceedingJoinPoint jointPoint) throws Throwable{
        MethodSignature signature = (MethodSignature) jointPoint.getSignature();
        Method method = signature.getMethod();
        SqlDataset annotation = method.getAnnotation(SqlDataset.class);
        String datasetPath = annotation.value();

        load(datasetPath);

        return jointPoint.proceed();
    }

    public void load(String datasetPath){
        try {
            ClassPathResource dsResource = new ClassPathResource(datasetPath);
            InputStream stream = dsResource.getInputStream();

            String sql = new BufferedReader(
                        new InputStreamReader(stream, StandardCharsets.UTF_8)
                    )
                    .lines()
                    .collect(Collectors.joining("\n"));

            // Well that's, uh... a very "reactive" way
            // to do a simple thing.
            String completeSQL = TRUNCATE_ALL + sql;
            dbClient.sql(completeSQL)
                    .then()
                    .block();

        }
        catch(IOException ex){
            throw new RuntimeException(ex);
        }

    }


}