package org.bsiri.gegerator.testinfra;

import com.ninja_squad.dbsetup.DbSetup;
import com.ninja_squad.dbsetup.Operations;
import com.ninja_squad.dbsetup.destination.DataSourceDestination;
import com.ninja_squad.dbsetup.operation.Operation;
import org.springframework.core.io.ClassPathResource;

import javax.sql.DataSource;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/*
    Simple dataset manager,
    created and injected using PersistenceTestConfig
*/
public class DatasetLoader {

    private static final Operation TRUNCATE_ALL = Operations.deleteAllFrom("movie_session", "movie");

    private DataSource datasource;

    public DatasetLoader(DataSource datasource){
        this.datasource = datasource;
    }

    public void load(Operation operation){
        Operation todo = Operations.sequenceOf(
            TRUNCATE_ALL,
            operation
            );
        DbSetup dbSetup = new DbSetup(new DataSourceDestination(datasource), todo);
        dbSetup.launch();
    };

    public void load(String datasetPath){
        List<String> sql = readDataset(datasetPath);

        Operation todo = Operations.sequenceOf(
                TRUNCATE_ALL,
                Operations.sql(sql)
        );
        DbSetup dbSetup = new DbSetup(new DataSourceDestination(datasource), todo);
        dbSetup.launch();
    }

    private List<String> readDataset(String datasetPath){
        try {
            ClassPathResource dsResource = new ClassPathResource(datasetPath);
            InputStream stream = dsResource.getInputStream();

            String[] sql = new BufferedReader(
                    new InputStreamReader(stream, StandardCharsets.UTF_8)
                    )
                    .lines()
                    .collect(Collectors.joining())
                    .split(";");


            return Arrays.asList(sql);
        }
        catch(IOException ex){
            throw new RuntimeException(ex);
        }

    }

}
