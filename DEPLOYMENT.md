# Deploy WorkMax on Render

This repository includes a single-container deployment. The container builds the Angular application, places it inside Spring Boot, and serves both the UI and API from one Render web service.

## 1. Push the repository

Commit and push the repository to GitHub, GitLab, or Bitbucket. Keep `Dockerfile`, `.dockerignore`, and `render.yaml` at the repository root.

## 2. Create a PostgreSQL database

In the Render dashboard, choose **New +** → **PostgreSQL**. Create the database in the same region as the web service. After it is created, open its **Connect** page and copy the internal host, database name, username, and password.

## 3. Create the web service

Choose **New +** → **Blueprint** and select the repository. Render reads `render.yaml` and creates the Docker web service. Alternatively, choose **Web Service**, select the repository, and set the runtime to **Docker**.

Set these environment variables on the web service:

| Key | Value |
| --- | --- |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://<internal-host>:5432/<database-name>` |
| `SPRING_DATASOURCE_USERNAME` | PostgreSQL username |
| `SPRING_DATASOURCE_PASSWORD` | PostgreSQL password |
| `APP_ADMIN_EMAIL` | Initial admin email |
| `APP_ADMIN_PASSWORD` | Strong initial admin password |

Do not set `PORT`; Render sets it automatically. The app reads it through `server.port=${PORT:8000}`.

## 4. Deploy

Click **Create Web Service**. Render builds the Docker image and starts the app. When deployment completes, open the Render URL. The service uses `/health` for Render's health check. The Angular UI and Spring API use the same origin, so no frontend URL or CORS change is required.

## Notes

- The default `spring.jpa.hibernate.ddl-auto=update` creates/updates tables on first deployment. Prefer migrations before production use.
- Render free instances spin down after inactivity and the free PostgreSQL offering has storage/retention limits. Use a paid plan for persistent production data.
- Existing local JWTs are not valid after a deploy. Sign in again.
