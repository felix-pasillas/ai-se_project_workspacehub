# WorkspaceHub

WorkspaceHub is a full-stack MERN application for teams to manage projects, tasks, and bookings within their own organization. It is built with TypeScript on the client and server, and access is controlled by each user's role.

I extended on this codebase as part of TripleTen's AI Software Engineering program, adding fixes, tests, and new features, then deploying it to production.

**Live site:** [WorkspaceHub](https://ai-se-project-workspacehub-pyoi-git-workspaceh-dcdf94-fpasillas.vercel.app)

To try the live site, register a new account. The demo users below exist only in locally seeded data.

## Features

- Multi-tenant organizations with owner, admin, and member roles
- Projects and tasks, with role-based editing
- Task comments with comment counts and a collapsible section on each task
- Comment editing and deleting, limited to the author and organization owners and admins
- An "Unknown user" label for comments from deleted accounts
- Automatic removal of a task's comments when the task is deleted
- Bookings with validation and overlap checks
- Per-organization feature flags

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- MongoDB Atlas (production database)
- JWT authentication
- Context API for client state
- Vercel (client and API hosting)

## Project Structure

```text
workspacehub/
  client/
  server/
  postman/
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment examples and fill them in:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Recommended local values:

```env
# server/.env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/workspacehub
JWT_SECRET=super-secret-jwt-key
CLIENT_ORIGIN=http://localhost:5173
```

```env
# client/.env
VITE_API_URL=http://localhost:5001
```

| Variable        | Purpose                                                                  |
| --------------- | ------------------------------------------------------------------------ |
| `PORT`          | Port for the local API server                                            |
| `MONGODB_URI`   | MongoDB connection string, including the database name                   |
| `JWT_SECRET`    | Secret used to sign login tokens. Use a long, random value in production |
| `CLIENT_ORIGIN` | Client URL allowed to call the API, with no trailing slash               |
| `VITE_API_URL`  | API base URL, with no `/api` or trailing slash                           |

3. Start MongoDB locally or point `MONGODB_URI` at an existing instance.

4. Seed demo data. This deletes the existing data in the database that `MONGODB_URI` points to:

```bash
npm run seed
```

5. Run the server and client in separate terminals:

```bash
npm run dev:server
npm run dev:client
```

## Demo Users

The seed script creates one organization with these users:

- `owner@workspacehub.dev` / `Password123!`
- `admin@workspacehub.dev` / `Password123!`
- `member@workspacehub.dev` / `Password123!`

## Scripts

- `npm run dev:server`
- `npm run dev:client`
- `npm run build`
- `npm run seed`
- `npm run typecheck`
- `npm run lint`
- `npm run format`
- `npm run format:check`
- `npm run test --workspace client`

## API Tests

The `postman/` folder contains collections you can import into Postman to test comment permissions and edge cases. Reseed the database before each run, as the permission tests leave comments behind.

## Notes

- All protected API responses follow the same JSON envelope:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

- The booking overlap rule is isolated in the booking service.
- Feature-flag checks are isolated in a reusable middleware/service path.
- Permission logic is centralized in auth and permission helpers.
