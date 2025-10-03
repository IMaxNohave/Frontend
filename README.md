# NextJS

## Getting Started

To get started with this template, simply paste this command into your terminal:

```bash
pnpm i
```

## Development

To start the development server run:

```bash
pnpm run dev
```

## Run with Docker

```bash
docker compose up -d --build
docker compose --env-file ./.env.docker up -d --force-recreate --build
docker compose down -v
```
