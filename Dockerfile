# --- Stage 1: build the Vite/React frontend -------------------------------
FROM oven/bun:1 AS frontend-build
WORKDIR /frontend

COPY package.json bun.lock ./
RUN bun install

COPY index.html vite.config.ts tsconfig.json ./
COPY src ./src
RUN bun run build

# --- Stage 2: FastAPI runtime, serving the API + the built frontend -------
FROM python:3.12-slim AS runtime
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app ./app
COPY backend/alembic ./alembic
COPY backend/alembic.ini ./alembic.ini
COPY backend/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

COPY --from=frontend-build /frontend/dist ./static

ENV STATIC_DIR=static
EXPOSE 8000

CMD ["./entrypoint.sh"]
