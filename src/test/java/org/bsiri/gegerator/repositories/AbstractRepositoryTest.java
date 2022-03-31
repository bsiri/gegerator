package org.bsiri.gegerator.repositories;

import org.bsiri.gegerator.testinfra.PersistenceTestConfig;
import org.springframework.boot.test.autoconfigure.data.r2dbc.DataR2dbcTest;
import org.springframework.test.context.ContextConfiguration;

/*
 * Mother class for repository testing; so that all code
 * go into it.
 */
@DataR2dbcTest
@ContextConfiguration(classes = {PersistenceTestConfig.class})
public abstract class AbstractRepositoryTest {
}
