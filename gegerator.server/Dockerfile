# TODO: configure tini to have a sigkill handler
FROM openjdk:23-slim-bookworm
ARG BUILD_VERSION
ENV VERSION=$BUILD_VERSION
COPY target/gegerator.server-${VERSION}.jar /opt/gegerator.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/opt/gegerator.jar"]
