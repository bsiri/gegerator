package org.bsiri.gegerator.config;

import jdk.internal.loader.Resource;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.web.reactive.config.ResourceHandlerRegistry;
import org.springframework.web.reactive.resource.PathResourceResolver;

import java.io.IOException;

@Configuration
@EnableConfigurationProperties(Scoring.class)
@EnableAspectJAutoProxy
public class GegeratorConfig {

    /*

    TODO: http://[...]/gegerator/index.html serves the page just fine... but
    the web assets are not taking care of the contextPath (the /gegerator)
    So maybe the solution is to configure this thing.

    Alternately see if we can serve the angular app with the base-href configured
    as the contextPath

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requestedResource = location.createRelative(resourcePath);
                        return requestedResource.exists() && requestedResource.isReadable() ? requestedResource
                                : new ClassPathResource("/static/index.html");
                    }
                });
    }

     */
}
