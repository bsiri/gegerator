package org.bsiri.gegerator.testinfra;

import org.aspectj.lang.Aspects;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.r2dbc.core.DatabaseClient;

/**
 * The purposes of that Configuration class are:
 *
 * 1. Inject the processor for SqlDataset with the SQL client.
 *
 * It supplements the regular R2DBC AutoConfiguration, hence the @TestConfiguration annotation.
 * It does not replace it !
 *
 * ------------------------------
 *
 * 1. SqlDataset processor
 *
 * In order to emulate the oh-so missed @Dataset annotation from DbUnit, I sort of mimic
 * the same here with @SqlDataset, which is then channeled to the DatabaseClient via
 * SqlDatasetProcessorAspect.
 *
 * ------------------------------
 *
 * None of these use @Component annotation, all the wiring happens here.
 *
 */
@TestConfiguration
public class PersistenceTestConfig {

    @Bean
    public SqlDatasetProcessorAspect sqlDatasetProcessorAspect(DatabaseClient dbClient){
        SqlDatasetProcessorAspect aspect = Aspects.aspectOf(SqlDatasetProcessorAspect.class);
        aspect.setDbClient(dbClient);
        return aspect;
    }

}
