package org.bsiri.gegerator.testinfra;

import io.r2dbc.spi.Option;
import org.aspectj.lang.Aspects;
import org.h2.jdbcx.JdbcDataSource;
import org.springframework.boot.autoconfigure.r2dbc.ConnectionFactoryOptionsBuilderCustomizer;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import io.r2dbc.spi.ConnectionFactoryOptions.Builder;

import javax.sql.DataSource;
import java.util.concurrent.ThreadLocalRandom;

/**
 * This configuration class has three purposes:
 * 1. hook on the r2dbc connection factory and change the name of the database to be unique
 * 2. create an additional jdbc datasource to be used by the DatasetLoader (which is jdbc-based).
 * 3. create the DatasetLoader and SqlDataset annotation processing plumbing.
 *
 * It supplements the regular R2DBC AutoConfiguration, hence the @TestConfiguration annotation.
 * It does not replace it !
 *
 * ----------------------
 *
 * 1. unique database name:
 *
 * Spring behavior is to run schema.sql everytime it creates a new Context. It is run against
 * the memory instance of h2, which runs until the JVM exits.
 *
 * It's all fine if only one TestSuite class is run in the IDE, but problems arise if many
 * are executed (eg, mvn test). When many TestSuite are run, a new context is created,
 * thus run schema.sql again on the same existing H2 instance, and thus leads to a redundant
 * initialization error ("table already exists").
 *
 * To prevent this from happening, the best course was to find a way to have each TestSuite
 * run on its own database. This config class does the job by tweaking the database properties
 * before the connection factory is created, using some callback interface exposed by Spring r2dbc,
 * each time a new context is created.
 *
 * This is a bit hacky but it is a simple solution and also robust to parallel test execution.
 *
 * Other solutions proposed by the community :
 * - use Liquibase or Flyway, which can detect and avoid double-execution of DDL instructions,
 *   probably the most advanced and reliable (also more complex)
 * - switch spring.datasource.continueOnError=true to ignore DDL errors (a bit dirty).
 * - set the H2 connection option DB_CLOSE_ON_EXIT=True, however this induces different failures
 *   (see https://stackoverflow.com/questions/15613722/spring-s-embedded-h2-datasource-and-db-close-on-exit)
 * - try to fiddle with ContextHierarchies and see if the Datasource can be created once and
 *   shared among all tests.
 *
 * ----------------------
 *
 * 2. Additional JDBC datasource
 *
 * This datasource is created for the use of DbSetup, the data injection framework from Ninja Squad.
 * I would have used DbUnit if the Spring integration was mature, alas it works up to Junit 4 and not
 * to Junit 5 which I use here.
 *
 * ----------------------
 *
 * 3. DatasetLoader and SqlDataset aspects
 *
 * DatasetLoader is build around Ninja-Squad DbSetup library.
 * In order to emulate the oh-so missed @Dataset annotation from DbUnit, I sort of mimic
 * the same here with @SqlDataset, which is then channeled to the DatasetLoader via
 * SqlDatasetProcessorAspect.
 *
 * None of these use @Component annotation, all the wiring happens here.
 *
 *
 */
@TestConfiguration
public class PersistenceTestConfig {

    @Bean
    public String dbName(){
        return "gegerator-"+ ThreadLocalRandom.current().nextInt();
    }


    @Bean
    public ConnectionFactoryOptionsBuilderCustomizer uniqueDbnameCustomizer(){
        return (Builder options) -> {
            Option dbnameOption = Option.sensitiveValueOf("database");
            String dbname = dbName();
            options.option(dbnameOption, dbname);
        };
    }


    @Bean
    public DataSource datasource(){
        JdbcDataSource ds = new JdbcDataSource();
        ds.setURL("jdbc:h2:mem:"+dbName()+";DB_CLOSE_DELAY=-1");
        ds.setUser("sa");
        ds.setPassword("");
        return ds;
    }

    @Bean
    public DatasetLoader dsLoader(){
        return new DatasetLoader(datasource());
    }


    @Bean
    public SqlDatasetProcessorAspect sqlDatasetProcessorAspect(){
        SqlDatasetProcessorAspect aspect = Aspects.aspectOf(SqlDatasetProcessorAspect.class);
        aspect.setDsLoader(dsLoader());
        return aspect;
    }

}
