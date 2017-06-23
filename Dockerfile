FROM openjdk:8
MAINTAINER Niels Boecker

WORKDIR /app

ENV JAVA_OPTS "-Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.port=9010 -Dcom.sun.management.jmxremote.local.only=false -Dcom.sun.management.jmxremote.authenticate=false -Dcom.sun.management.jmxremote.ssl=false"

COPY ./target/universal/mine-sweeper-web-1.0-SNAPSHOT.tgz /app/tmp/app.tgz

RUN tar xzf /app/tmp/app.tgz --directory /app/tmp
RUN mv /app/tmp/mine-sweeper-web-1.0-SNAPSHOT/* /app
RUN rm -r -f /app/tmp/

CMD /app/bin/mine-sweeper-web\
    -Dconfig.file=/app/conf/docker.conf

EXPOSE 9000
EXPOSE 9010
