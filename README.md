# MEAN Microservices Project Platform

A Docker-ready MEAN stack project management platform aligned with modern UI, API-first, and microservices internship requirements.

## Stack

- Angular + TypeScript frontend
- Node.js + Express services
- MongoDB with Mongoose
- JWT authentication
- Docker Compose for local orchestration
- GitHub Actions for CI

## Services

- `frontend`: Angular task board and dashboard UI
- `auth-service`: registration, login, JWT issuing
- `task-service`: projects, tasks, comments, filters, board statistics
- `user-service`: user profile lookup and updates
- `shared`: shared TypeScript domain types

## Local Development

Install dependencies:

```bash
npm install
```

Run services locally in separate terminals:

```bash
npm run dev:auth
npm run dev:tasks
npm run dev:users
npm run dev:frontend
```

Or run the full stack with Docker:

```bash
docker compose up --build
```

## CI/CD

The included GitHub Actions workflow installs dependencies, builds every workspace package, and runs available tests on pull requests and pushes to `main`.
