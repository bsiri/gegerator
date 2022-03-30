package org.bsiri.gegerator.repositories;

import org.bsiri.gegerator.testinfra.DatasetLoader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.r2dbc.core.DatabaseClient;

public class MovieSessionTupleRepositoryTest extends AbstractRepositoryTest{

    @Autowired
    DatasetLoader dsLoader;

    @Autowired
    MovieSessionTupleRepository repo;

    @Autowired
    DatabaseClient client;



}
