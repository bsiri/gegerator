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
    Note:
        At the moment the application use no contextpath (ie, spring.webflux.base-path is '/').
        It works because the frontend looks for its assets (img, js etc) at '/' too. However that behavior
        is hardcoded. If we introduce a context path, the UI will break.

        A solution to this could be to configure the resource handler and make it so that
        every request for css, js, img etc will be looked for in the classpath:/static location,
        regardless to the actual request path. It is probably much simpler than fixing the error
        on the client side.

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
