package org.bsiri.gegerator.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(Scoring.class)
public class GegeratorConfig {

}
