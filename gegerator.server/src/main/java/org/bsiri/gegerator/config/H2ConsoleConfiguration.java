package org.bsiri.gegerator.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;

/*
    If the app run with the profile "dev", this class will start a separate, old school
    Servlet aside from the main Netty server. This will allow the H2 console to run.

    The console will be accessible at the root path of the URL on port 8082:
    http://localhost:8082/
    And you can connect the db using:
    - url=jdbc:h2:mem:gegerator
    - login/pwd = sa/<blank>

    However that class is going to ship with the release at the moment, unless I rework
    it as a separate artifact and make it embeddable only if built with a dedicated maven
    profile, I'll do that later. Maybe.

    Kudos to: https://medium.com/@padiahrohit/enable-h2-console-in-java-reactive-environmant-dcfcfdd6858a
 */

@Configuration
@Profile("dev")
public class H2ConsoleConfiguration {

    private org.h2.tools.Server webServer;

    private org.h2.tools.Server tcpServer;

    private final String WEB_PORT = "8082";
    private final String TCP_PORT = "9092";

    @EventListener(org.springframework.context.event.ContextRefreshedEvent.class)
    public void start() throws java.sql.SQLException {

        this.webServer = org.h2.tools.Server.createWebServer("-webPort", WEB_PORT, "-tcpAllowOthers").start();
        this.tcpServer = org.h2.tools.Server.createTcpServer("-tcpPort", TCP_PORT, "-tcpAllowOthers").start();
    }

    @EventListener(org.springframework.context.event.ContextClosedEvent.class)
    public void stop() {
        this.tcpServer.stop();
        this.webServer.stop();
    }

}