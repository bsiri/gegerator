package org.bsiri.gegerator.services.impl;

import org.bsiri.gegerator.config.Scoring;
import org.bsiri.gegerator.services.impl.AppStateServiceImpl;
import org.bsiri.gegerator.testinfra.SqlDatasetTestExecutionListener;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.autoconfigure.data.r2dbc.DataR2dbcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.test.context.TestExecutionListeners;

@DataR2dbcTest
@TestExecutionListeners(
        listeners = SqlDatasetTestExecutionListener.class,
        mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS
)
@ComponentScan(basePackageClasses = AppStateServiceImpl.class)
@EnableConfigurationProperties(Scoring.class)
public class AbstractDBBasedServiceTest {

}
