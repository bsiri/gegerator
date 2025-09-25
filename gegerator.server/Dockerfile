# TODO: configure tini to have a sigkill handler
FROM gcr.io/distroless/java17-debian12
ARG BUILD_VERSION
ENV VERSION=$BUILD_VERSION
COPY target/gegerator.server-${VERSION}.jar /opt/gegerator.jar
EXPOSE 8080
#ENTRYPOINT ["java", "-jar", "/opt/gegerator.jar"]
CMD ["/opt/gegerator.jar"]
