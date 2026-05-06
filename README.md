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

## Deployment Notes

### Docker

Install Docker Desktop, start it, then run:

```bash
docker compose up --build
```

The services will be available at:

- Frontend: `http://localhost:4200`
- Auth service: `http://localhost:4001`
- Task service: `http://localhost:4002`
- User service: `http://localhost:4003`
- MongoDB: `mongodb://localhost:27017/project_platform`

### MongoDB Atlas

For a cloud database, create a MongoDB Atlas cluster, add a database user, allow your deployment platform's network access, and set:

```bash
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster-url>/project_platform
JWT_SECRET=<long-random-secret>
```

### Vercel

Vercel can serve the Angular frontend and the lightweight `/api/*` serverless functions. Import this GitHub repo in Vercel and keep the repo root as the project root. The included `vercel.json` sets the build command and output directory.

Set these Vercel environment variables before deploying:

```bash
MONGODB_URI=<your MongoDB Atlas URI>
JWT_SECRET=<long-random-secret>
```

For a stricter microservices production deployment, deploy the Express services separately on Render, Railway, Fly.io, or another Node-friendly host. The Vercel functions are included so the portfolio demo can work from a single Vercel deployment.
