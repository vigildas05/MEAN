# Taskometer

A Docker-ready MEAN stack microservices-based project management platform built with Angular, Node.js, Express, MongoDB, and JWT authentication.

FlowForge is designed to demonstrate modern full-stack engineering practices including:
- Microservices architecture
- API-first backend development
- JWT-based authentication
- Docker containerization
- CI/CD workflows
- Modular TypeScript codebases
- Scalable service separation

---

# Features

## Authentication Service
- User registration
- Secure login
- JWT token generation
- Protected routes

## Task Management
- Create and manage projects
- Task boards and workflows
- Comments and activity tracking
- Filters and task statistics

## User Service
- User profile lookup
- Profile updates
- User metadata management

## Frontend Dashboard
- Angular-based responsive UI
- Task board visualization
- Project analytics dashboard
- API-integrated workflows

---

# Architecture

```text
Frontend (Angular)
        │
        ▼
API Gateway / Vercel Functions
        │
 ┌───────────────┬───────────────┬───────────────┐
 ▼               ▼               ▼
Auth Service   Task Service   User Service
        │
        ▼
     MongoDB
```

---

# Tech Stack

## Frontend
- Angular
- TypeScript
- RxJS

## Backend
- Node.js
- Express.js
- JWT Authentication

## Database
- MongoDB
- Mongoose

## DevOps & Tooling
- Docker
- Docker Compose
- GitHub Actions
- Vercel

---

# Monorepo Structure

```bash
.
├── frontend/
├── auth-service/
├── task-service/
├── user-service/
├── shared/
├── docker-compose.yml
├── vercel.json
└── .github/workflows/
```

---

# Local Development

## Install Dependencies

```bash
npm install
```

## Run Services Individually

Open separate terminals:

```bash
npm run dev:auth
npm run dev:tasks
npm run dev:users
npm run dev:frontend
```

---

# Docker Setup

## Run Entire Stack

```bash
docker compose up --build
```

## Services

| Service | URL |
|---|---|
| Frontend | http://localhost:4200 |
| Auth Service | http://localhost:4001 |
| Task Service | http://localhost:4002 |
| User Service | http://localhost:4003 |

MongoDB:
```bash
mongodb://localhost:27017/project_platform
```

---

# Environment Variables

Create a `.env` file in the appropriate services.

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
```

Example:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/project_platform
JWT_SECRET=8f3c1b9d4a7e2f6c8d1e5b7a9c3f2e6
```

---

# MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster
2. Create a database user
3. Add IP access:
   ```text
   0.0.0.0/0
   ```
4. Copy the Atlas connection URI
5. Add it to environment variables

---

# CI/CD

GitHub Actions workflow automatically:

- Installs dependencies
- Builds all services
- Runs tests
- Validates pull requests
- Executes CI pipeline on pushes to `main`

---

# Deployment

## Vercel Deployment

The frontend and lightweight serverless APIs can be deployed directly on Vercel.

### Steps

1. Import repository into Vercel
2. Keep repository root as project root
3. Add environment variables:
   ```env
   MONGODB_URI=your_uri
   JWT_SECRET=your_secret
   ```
4. Deploy

---

# Future Improvements

- WebSocket real-time updates
- Redis caching
- Kubernetes deployment
- Role-based access control
- Notifications system
- Activity feeds
- File uploads
- Team collaboration tools

---

# Learning Outcomes

This project demonstrates understanding of:

- Microservices architecture
- REST API design
- JWT authentication
- Angular frontend integration
- Docker orchestration
- CI/CD automation
- Cloud database deployment
- Full-stack TypeScript development

---

# License

MIT License

---

# Author

Built by Vigil Das
