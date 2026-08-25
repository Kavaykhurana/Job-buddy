# Self-Managed Deployment

Deploy the portal through one HTTPS origin. The browser then calls the Java API at `/api/v1`, so the refresh cookie is same-site and the frontend does not need to expose an API host in its bundle.

| Component | Runtime | Responsibility |
|---|---|---|
| React portal | Static files behind Nginx | User interface and short-lived in-memory access token. |
| SIH Connect API | Java 21, Spring Boot 4.1.1, Maven | REST API, JWT issuance, authorization, validation, and workflow enforcement. |
| PostgreSQL | PostgreSQL 16 or later | Durable system-of-record data and Flyway migration history. |
| Redis | Redis 7 or compatible | Distributed login/register rate limit counter in production. |
| Nginx | Nginx with TLS termination | Static delivery, reverse proxy, security headers, and same-origin API routing. |

## Required production configuration

Set the variables named in `deployment.env.template` in your deployment platform’s secret manager. Generate `APP_JWT_SECRET` from at least 32 random bytes encoded with Base64. Set `APP_CORS_ALLOWED_ORIGINS` to the precise HTTPS frontend origin, never `*`. Keep `APP_COOKIE_SECURE=true` in production.

> Do not commit a `.env` file, a database password, a bootstrap password, or a JWT secret. The included template contains variable names only.

## Build and run

Build the API with `cd backend && mvn clean verify`. The resulting `target/sih-connect-api-1.0.0.jar` runs with `java -jar target/sih-connect-api-1.0.0.jar` after production environment variables are supplied. Flyway applies forward-only migrations at startup and Hibernate validates the resulting schema.

For an OCI deployment, build `backend/Dockerfile` from the `backend` directory. The supplied `compose.yaml` starts the API with PostgreSQL and Redis; inject its environment variables from your secret manager rather than committing a local secrets file. For a static frontend container, build from the repository root with `docker build -f backend/Dockerfile.frontend -t sih-connect-web .`. Adapt `backend/deployment/nginx.conf` if the API runs in another container or host; its `/api/` target must reach the Java API.

## Operations checklist

| Check | Expected result |
|---|---|
| `GET /actuator/health` | `200` with `UP` after PostgreSQL and Redis are reachable. |
| First startup | Flyway records its migrations, then Hibernate validates the schema. |
| `POST /api/v1/auth/register` | Student account, BCrypt password hash, 15-minute access token, and HttpOnly refresh cookie. |
| `POST /api/v1/auth/refresh` | Refresh cookie rotates; old refresh session is revoked. |
| `POST /api/v1/auth/logout` | Refresh session is revoked and the cookie is cleared. |
| Protected request | `401` without a token; `403` when role or record ownership is insufficient. |

Run any local authentication verification only against a disposable development database. A verification flow should create a test student, confirm session rotation and revocation, and confirm a recruiter-only action is denied to that student; it must not be committed with production credentials or run against production data.

## Response-time and scale posture

The API keeps access-token validation stateless and uses a bounded Hikari connection pool. PostgreSQL indexes exist on user, refresh-token, opportunity, application, assessment attempt, document, audit, and schedule lookup paths. Redis makes the login limit effective across replicas. Scale the API horizontally behind a load balancer; keep PostgreSQL and Redis managed or highly available in production. Measure p50/p95 latency, database pool saturation, and error rate in your own deployment before choosing final pool and replica counts.
