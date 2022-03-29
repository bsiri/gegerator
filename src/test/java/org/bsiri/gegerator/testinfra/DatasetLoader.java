package org.bsiri.gegerator.testinfra;

import com.ninja_squad.dbsetup.DbSetup;
import com.ninja_squad.dbsetup.Operations;
import com.ninja_squad.dbsetup.destination.DataSourceDestination;
import com.ninja_squad.dbsetup.operation.Operation;

import javax.sql.DataSource;

public class DatasetLoader {
    public static final Operation TRUNCATE_ALL = Operations.deleteAllFrom("movie_session", "movie");
    public static final Operation MOVIE_REPOSITORY_DATASET =
            Operations.insertInto("movie")
                .columns("id", "title", "duration")
                .values("1", "Discopath", "PT1H26M")
            .build();

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

}
