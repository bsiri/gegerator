package org.bsiri.gegerator.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

@Configuration
@EnableConfigurationProperties(Scoring.class)
@EnableAspectJAutoProxy
public class GegeratorConfig {

}
