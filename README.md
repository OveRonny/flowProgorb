# FlowProgorb

A full-stack project management and planning application for software development teams. FlowProgorb lets you plan projects, manage requirements, track features and tasks, and sync your work directly with GitHub repositories.

## Features

- **Project Management** — Create and organize projects with modules, features, and tasks. Track status and progress end-to-end.
- **Planning** — Record customer requirements, log meetings, and define milestones with due dates.
- **Development Tracking** — Manage features and tasks through their lifecycle (planned → in progress → done) with time logging and team assignments.
- **GitHub Integration** — Connect a GitHub repository to a project, create issues from features, sync pull request status, and receive real-time updates via webhooks.
- **Team Collaboration** — Invite members to projects with fine-grained roles: Owner, Admin, Member, or Viewer.
- **Technology Catalog** — Track which languages, frameworks, and libraries each feature uses.
- **Authentication** — Email/password sign-up or GitHub OAuth login, secured with JWT.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3, Vite, TailwindCSS, Pinia, Vue Router, Axios |
| Backend | Node.js (≥22), Express 5 |
| Database | PostgreSQL with Prisma ORM |
| Auth | JWT, bcrypt, GitHub OAuth |
| GitHub | Octokit, GitHub Apps, Webhooks |
| Hosting | Azure App Service (backend) + Azure Static Web Apps (frontend) |

## Project Structure

```
flowProgorb/
├── backend/          # Node.js/Express API
│   ├── prisma/       # Database schema and migrations
│   └── src/
│       ├── app.js
│       ├── server.js
│       └── features/ # auth, projects, features, tasks, modules, technologies, github
└── frontend-vue/     # Vue 3 single-page app
    └── src/
        ├── components/
        ├── router/
        ├── views/
        └── features/ # auth, projects, development, features, tasks, modules, technologies
```

## Prerequisites

- Node.js ≥ 22 and npm ≥ 10
- A PostgreSQL database (local or Azure Database for PostgreSQL)
- A [GitHub OAuth App](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) for login
- A [GitHub App](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/registering-a-github-app) for repository integration (issues, branches, webhooks)

## Getting Started

### 1. Clone the repository

```sh
git clone https://github.com/OveRonny/flowProgorb.git
cd flowProgorb
```

### 2. Set up the backend

```sh
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in the required values (see [Backend configuration](#backend-configuration) below), then run:

```sh
npm run dev   # starts the API server with auto-reload on http://localhost:3000
```

### 3. Set up the frontend

```sh
cd ../frontend-vue
npm install
cp .env.example .env
```

Edit `.env`:

```sh
VITE_API_BASE_URL=http://localhost:3000
```

Then run:

```sh
npm run dev   # starts the Vite dev server on http://localhost:5173
```

## Backend Configuration

All settings are controlled by environment variables. Copy `backend/.env.example` to `backend/.env` and provide the following:

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | ✅ | Strong random secret used to sign JWT tokens |
| `JWT_EXPIRES_IN` | ✅ | Token lifetime, e.g. `30d` |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `FRONTEND_URL` | ✅ | Frontend origin used for OAuth redirects |
| `GITHUB_CLIENT_ID` | ✅ | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | ✅ | GitHub OAuth App client secret |
| `GITHUB_APP_ID` | ✅ | GitHub App ID for repository integration |
| `GITHUB_PRIVATE_KEY` | ✅ | PEM private key for the GitHub App |
| `GITHUB_WEBHOOK_SECRET` | ✅ | HMAC secret to verify webhook payloads |
| `PORT` | ➖ | Server port (defaults to `3000`) |

## Frontend Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | ✅ | Base URL of the backend API |

For production builds, see `frontend-vue/.env.production.example`.

## Database Migrations

Prisma is used for schema management. To apply migrations when setting up a fresh database:

```sh
cd backend
npx prisma migrate dev
```

## Running Tests

```sh
cd backend
npm test
```

## Production Build

```sh
cd frontend-vue
npm run build   # outputs to frontend-vue/dist/
```

The backend is deployed to Azure App Service and the frontend to Azure Static Web Apps via the GitHub Actions workflows in `.github/workflows/`.

## License

This project does not currently specify a license.
