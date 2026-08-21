# syntax=docker/dockerfile:1

FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/my-angular-app/package*.json ./
RUN npm ci
COPY frontend/my-angular-app/ ./
RUN npm run build

FROM eclipse-temurin:24-jdk AS backend-build
WORKDIR /app/backend
COPY backend/workmaxone/workmaxone/gradlew ./
COPY backend/workmaxone/workmaxone/gradle ./gradle
COPY backend/workmaxone/workmaxone/build.gradle backend/workmaxone/workmaxone/settings.gradle ./
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon
COPY backend/workmaxone/workmaxone/ ./
COPY --from=frontend-build /app/frontend/dist/my-angular-app/browser/ src/main/resources/static/
RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:24-jre
WORKDIR /app
COPY --from=backend-build /app/backend/build/libs/*.jar app.jar
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
