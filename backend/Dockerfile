# ==========================================
# Stage 1: Build the application
# ==========================================
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy the maven wrapper and pom.xml
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Download dependencies with a specific local repo to avoid memory issues
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B -Dmaven.repo.local=/tmp/.m2

# Copy the actual source code and build the jar
COPY src ./src
RUN ./mvnw package -DskipTests -Dmaven.repo.local=/tmp/.m2

# ==========================================
# Stage 2: Run the application
# ==========================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy only the built jar from the first stage
COPY --from=build /app/target/*.jar app.jar

# Expose port 8080
EXPOSE 8080

# Run the jar
ENTRYPOINT ["java", "-jar", "app.jar"]