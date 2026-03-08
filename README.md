# SkillHire

SkillHire is a full-stack worker hiring platform built with ASP.NET Core Web API and React. It supports role-based access for admins, clients, and workers, including authentication, worker profile management, service discovery, hiring requests, and admin management pages.

## Tech Stack

- Backend: ASP.NET Core Web API, Entity Framework Core, SQL Server
- Frontend: React, React Router, Axios, Tailwind CSS
- Auth: JWT Bearer authentication

## Main Features

- JWT-based login and registration
- Role-based dashboards for `Admin`, `Client`, and `Worker`
- Worker profile, services, and photo management
- Client worker browsing and hire requests
- Admin management for users, categories, and services

## Project Structure

- `backend/SkillHire` - ASP.NET Core Web API
- `frontend` - React frontend

## Running Locally

### Backend

```powershell
cd backend/SkillHire
dotnet restore
dotnet ef database update
dotnet run --launch-profile https
```

Backend runs on:

- `https://localhost:7109`

### Frontend

```powershell
cd frontend
npm install
npm start
```

Frontend runs on:

- `http://localhost:3000`

## Authentication

- Users authenticate through `/api/Auth/login`
- Backend returns a JWT access token
- Frontend stores the token in `localStorage`
- Axios sends the token in the `Authorization: Bearer <token>` header

## Notes For Publishing

- Local uploaded media under `backend/SkillHire/wwwroot/uploads` is ignored from Git
- Environment-specific files like `.env` are ignored
- The repo is intended to contain source code only, not personal uploads or local machine data

## License

This project is licensed under the MIT License.
