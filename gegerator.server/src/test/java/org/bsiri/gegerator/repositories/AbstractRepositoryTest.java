package org.bsiri.gegerator.repositories;

import org.bsiri.gegerator.testinfra.SqlDatasetTestExecutionListener;
import org.springframework.boot.test.autoconfigure.data.r2dbc.DataR2dbcTest;
import org.springframework.test.context.TestExecutionListeners;

/*
 * Mother class for repository testing; so that all code
 * go into it.
 */
@DataR2dbcTest
@TestExecutionListeners(
        listeners = SqlDatasetTestExecutionListener.class,
        mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS
)
public abstract class AbstractRepositoryTest {
}
