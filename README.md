# Finance Data Processing and Access Control Backend

This version is implemented in a MERN-style backend stack: MongoDB, Express, and Node.js, with the API structured to serve a React dashboard client cleanly. The focus stays on the assignment’s core asks: RBAC, financial record management, dashboard summaries, validation, and maintainable separation of concerns.

It also includes a very simple demo frontend built with plain HTML, CSS, and vanilla JavaScript so the APIs can be tested in a browser without React.

## Tech Stack

- MongoDB
- Mongoose
- Express
- Node.js
- JWT authentication
- `bcrypt` password hashing

## Architecture

src/
  app.js
  server.js
  config.js
  db/
    connect.js
    seed.js
  models/
    User.js
    Record.js
  middleware/
  routes/
  services/
  lib/

## Data Model

### User

- `name`
- `email`
- `passwordHash`
- `role` (`admin`, `analyst`, `viewer`)
- `status` (`active`, `inactive`)
- `createdAt`, `updatedAt`

### Record

- `amount`
- `type` (`income`, `expense`)
- `category`
- `date`
- `notes`
- `createdBy` (MongoDB reference to `User`)
- `createdAt`, `updatedAt`

## Seed Accounts

The app auto-seeds sample users and records on first run:

- Admin: `admin@finance.local` / `admin123`
- Analyst: `analyst@finance.local` / `analyst123`
- Viewer: `viewer@finance.local` / `viewer123`
- Inactive Analyst: `inactive@finance.local` / `analyst123`

## Role Access

- `viewer`: dashboard summary only
- `analyst`: read records and dashboard summary
- `admin`: manage users and full record CRUD

## API Endpoints

### Auth

- `POST /api/auth/login`
- `GET /api/auth/me`

### Users

- `GET /api/users` (`admin`)
- `POST /api/users` (`admin`)
- `PATCH /api/users/:id` (`admin`)

### Records

- `GET /api/records` (`admin`, `analyst`)
- `GET /api/records/:id` (`admin`, `analyst`)
- `POST /api/records` (`admin`)
- `PATCH /api/records/:id` (`admin`)
- `DELETE /api/records/:id` (`admin`)

filters:

- `type`
- `category`
- `startDate`
- `endDate`
- `search`
- `page`
- `limit`

### Dashboard

- `GET /api/dashboard/summary` (`viewer`, `analyst`, `admin`)

Summary payload includes:

- total income
- total expenses
- net balance
- category-wise totals
- monthly trends
- recent activity

## Validation and Error Handling

The API returns structured JSON errors and covers:

- invalid login credentials
- inactive user login attempts
- invalid payloads for users and records
- duplicate user emails
- invalid or missing JWTs
- missing users or records
- malformed JSON bodies

## Running Locally

1. Make sure MongoDB is running locally.
2. Start the API:

```bash
npm start
```

Default settings:

- API: `http://localhost:3000`
- MongoDB: `mongodb://127.0.0.1:27017/finance_dashboard_assignment`

Open `http://localhost:3000` in the browser to use the simple frontend.

Optional environment variables:

- `PORT`
- `JWT_SECRET`
- `MONGO_URI`

## Simple Frontend

The `public/` folder contains:

- `index.html`
- `style.css`
- `script.js`

Frontend features:

- login with seeded users
- view dashboard totals
- view recent activity
- filter records
- create records from the browser when logged in as admin

## Example Login Request

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@finance.local",
  "password": "admin123"
}
```

## Design Notes

- Mongoose models are used to keep the MongoDB layer explicit and readable.
- Dashboard summaries are built with MongoDB aggregation pipelines rather than manual in-memory calculation.
- Seeding is automatic for quick reviewer setup.
- The backend is ready to plug into a React dashboard client, which is why the API returns clean resource and summary payloads.