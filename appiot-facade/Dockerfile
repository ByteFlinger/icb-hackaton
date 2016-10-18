FROM java:8  
ADD build/libs/appiot-facade-0.1.jar app.jar  
ADD application.properties /
RUN bash -c 'touch /app.jar'  
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","/app.jar"]
EXPOSE 8080