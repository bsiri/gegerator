package org.bsiri.gegerator.testinfra;

import org.h2.jdbcx.JdbcDataSource;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

import javax.sql.DataSource;

@TestConfiguration
public class PersistenceTestConfig {

    @Bean
    public DataSource datasource(){
        JdbcDataSource ds = new JdbcDataSource();
        ds.setURL("jdbc:h2:mem:gegerator;DB_CLOSE_DELAY=-1");
        ds.setUser("sa");
        ds.setPassword("");
        return ds;
    }

    @Bean
    public DatasetLoader dsLoader(){
        return new DatasetLoader(datasource());
    }



}
