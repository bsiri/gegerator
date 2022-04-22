package org.bsiri.gegerator.testinfra;

import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.core.io.ClassPathResource;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.test.context.TestContext;
import org.springframework.test.context.TestExecutionListener;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.stream.Collectors;

public class SqlDatasetTestExecutionListener implements TestExecutionListener {

    private static final String TRUNCATE_ALL =
            "delete from other_activity;"+
            "delete from movie_session;"+
                    "delete from movie;";

    /**
     * Locate if the annotation SqlDataset is present,
     * and if so load it.
     *
     * @param testContext
     * @throws Exception
     */
    @Override
    public void beforeTestMethod(TestContext testContext) throws Exception {
        TestExecutionListener.super.beforeTestMethod(testContext);
        findDatastName(testContext)
                .ifPresent( dataset -> {
                    DatabaseClient dbClient = getDatabaseClient(testContext);
                    load(dbClient, dataset);
                });
    }


    static private Optional<String> findDatastName(TestContext testContext){
        Method testMethod = testContext.getTestMethod();
        SqlDataset sqlAnnotation = AnnotationUtils.getAnnotation(testMethod, SqlDataset.class);
        if (sqlAnnotation != null){
            return Optional.of(sqlAnnotation.value());
        }
        else{
            return Optional.empty();
        }
    }

    static private DatabaseClient getDatabaseClient(TestContext testContext){
        return testContext.getApplicationContext().getBean(DatabaseClient.class);
    }

    private void load(DatabaseClient dbClient, String datasetPath){
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
