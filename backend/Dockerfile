FROM node:20-bookworm-slim AS frontend
WORKDIR /workspace
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile
COPY client ./client
COPY shared ./shared
COPY vite.config.ts tsconfig.json ./
RUN pnpm exec vite build

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY backend/pom.xml ./pom.xml
RUN mvn -q -DskipTests dependency:go-offline
COPY backend/src ./src
COPY --from=frontend /workspace/dist/public ./src/main/resources/static
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre
RUN apt-get update \
    && apt-get install -y --no-install-recommends wget \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --system --create-home --uid 10001 appuser
WORKDIR /app
COPY --from=build /workspace/target/sih-connect-api-1.0.0.jar app.jar
USER 10001
EXPOSE 10000
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-XX:+UseG1GC", "-jar", "app.jar"]
