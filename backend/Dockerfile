# ==========================================
# Stage 1: Build the application
# ==========================================
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy the maven wrapper and pom.xml
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Force Maven to use a tiny amount of memory and single thread
ENV MAVEN_OPTS="-Xmx512m -XX:MaxMetaspaceSize=256m"
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B -Dmaven.repo.local=/tmp/.m2 -Dorg.slf4j.simpleLogger.showDateTime=true

# Copy the source and build
COPY src ./src
RUN ./mvnw package -DskipTests -Dmaven.repo.local=/tmp/.m2

# ==========================================
# Stage 2: Run the application
# ==========================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Photos that existed before going live. On startup, any that are missing from
# the uploads folder (a Railway volume mounted at /app/uploads) are copied in.
# Existing files are never overwritten.
COPY seed-uploads ./seed-uploads
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "mkdir -p uploads && cp -rn seed-uploads/. uploads/ 2>/dev/null; exec java -jar app.jar"]