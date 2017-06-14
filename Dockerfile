FROM openjdk:8
MAINTAINER Niels Boecker

WORKDIR /app

COPY ./target/universal/mine-sweeper-web-1.0-SNAPSHOT.tgz /app/tmp/app.tgz

RUN tar xzf /app/tmp/app.tgz --directory /app/tmp
RUN mv /app/tmp/mine-sweeper-web-1.0-SNAPSHOT/* /app
RUN rm -r -f /app/tmp/

CMD /app/bin/mine-sweeper-web\
    -Dconfig.file=/app/conf/heroku.conf

EXPOSE 9000
