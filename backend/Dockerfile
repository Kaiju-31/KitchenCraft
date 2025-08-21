# 🍳 KitchenCraft Backend Dockerfile
# Multi-stage build for optimized Spring Boot application

# Stage 1: Build stage with Maven
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copy pom.xml first for better layer caching
COPY pom.xml .

# Download dependencies (cached layer if pom.xml hasn't changed)
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application (skip tests for Docker build speed)
RUN mvn clean package -DskipTests

# Stage 2: Runtime stage with minimal JRE
FROM eclipse-temurin:21-jre-alpine

# Install curl for health checks
RUN apk --no-cache add curl

# Create non-root user for security (Alpine syntax)
RUN addgroup -S kitchencraft && adduser -S -G kitchencraft kitchencraft

# Set working directory
WORKDIR /app

# Copy JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Change ownership to non-root user
RUN chown kitchencraft:kitchencraft app.jar

# Switch to non-root user
USER kitchencraft

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Environment variables with defaults
ENV SPRING_PROFILES_ACTIVE=docker
ENV JVM_OPTS="-Xmx512m -Xms256m"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JVM_OPTS -jar app.jar"]