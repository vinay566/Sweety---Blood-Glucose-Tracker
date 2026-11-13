# Sweety – Blood Glucose Tracker (MERN + PostgreSQL)

Sweety is a professional, production-grade full-stack web application designed for diabetes patients to record up to 4 blood glucose readings a day, track health statistics, visualize glucose trends, and generate comprehensive daily, month-to-date, and monthly reports.

---

## Table of Contents
1. [Project Introduction](#project-introduction)
2. [Features Built](#features-built)
3. [Technology Stack](#technology-stack)
4. [Project Folder Structure](#project-folder-structure)
5. [Installation & Setup](#installation--setup)
6. [Environment Variables](#environment-variables)
7. [Database Setup & Seeding](#database-setup--seeding)
8. [How to Run Server & Client](#how-to-run-server--client)
9. [API Endpoints Reference](#api-endpoints-reference)
10. [Demo Account](#demo-account)
11. [Screenshots](#screenshots)
12. [Assumptions & Future Improvements](#assumptions--future-improvements)

---

## Project Introduction
Developed as a comprehensive full-stack assessment project, Sweety implements secure user authentication, robust server-side and client-side input validations, relational database persistence (Neon PostgreSQL), concurrency safety via transactional row locking, and detailed healthcare analytics.

---

## Features Built
- **User Registration & Login**: Secure signup and login with bcrypt password hashing and JWT token authentication.
- **Glucose Reading Management**: Add, view, edit, and delete readings across 4 mandatory slots:
  - `morning_fasting` (Morning fasting)
  - `after_breakfast` (After breakfast)
  - `after_lunch` (After lunch)
  - `after_dinner` (After dinner)
- **Strict Validation Rules**:
  - Empty glucose value check (`"Please enter a glucose value."`)
  - Range and whole number check (`"Value must be between 40 and 600 mg/dL."`)
  - Unique slot per date check (`"You already have an After lunch reading for this date."`)
  - Maximum 4 readings per day limit (`"You can add only 4 readings per day."`)
  - Future date rejection (`"Date cannot be in the future."`)
- **Reports & Analytics**:
  - **Daily Report**: Selected date summary (highest, lowest, average rounded to 1 decimal, count, readings breakdown).
  - **Month-to-Date (MTD) Report**: 1st of the month through selected date.
  - **Monthly Report**: Entire previous calendar month relative to selected date.
  - Friendly empty states when no records exist.
- **Dashboard & Trend Chart**: Summary metric cards and Recharts monthly glucose trend line chart.

---

## Technology Stack
- **Frontend**: React, Vite, Tailwind CSS, Recharts, React Router, Lucide Icons, Axios.
- **Backend**: Node.js, Express, PostgreSQL (`pg`), bcrypt, jsonwebtoken, dotenv, tsx.
- **Database**: External PostgreSQL database (Neon free tier).

---

## Project Folder Structure
```text
/
├── server.ts                  # Express server entry point & Vite middleware
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── /src
│   ├── App.tsx                # Main Router component
│   ├── main.tsx               # React entry point
│   ├── index.css              # Tailwind CSS imports
│   ├── types.ts               # Shared TypeScript interfaces
│   ├── /db
│   │   ├── db.ts              # PostgreSQL connection pool & schema init
│   │   └── seed.ts            # Demo user and sample readings seed script
│   ├── /middleware
│   │   └── authMiddleware.ts  # JWT authentication middleware
│   ├── /controllers
│   │   ├── authController.ts  # Register, login, and me controllers
│   │   ├── readingController.ts # CRUD readings controllers with validation
│   │   └── reportController.ts  # Daily, MTD, and Monthly report controllers
│   ├── /routes
│   │   ├── authRoutes.ts      # Auth endpoints router
│   │   ├── readingRoutes.ts   # Readings endpoints router
│   │   └── reportRoutes.ts    # Reports endpoints router
│   ├── /services
│   │   └── api.ts             # Axios API service client
│   ├── /utils
│   │   └── formatters.ts      # Slot display formatting utility
│   └── /pages
│       ├── Login.tsx          # Login page
│       ├── Register.tsx       # Register page
│       ├── Dashboard.tsx      # Dashboard page
│       ├── Readings.tsx       # Readings management page
│       └── Reports.tsx        # Reports page
```

---

## Installation & Setup

1. Clone repository:
   ```bash
   git clone <repository-url>
   cd sweety
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

---

## Environment Variables
Create a `.env` file in the root directory based on `.env.example`:
```env
DATABASE_URL="postgresql://username:password@hostname:5432/database_name?sslmode=require"
JWT_SECRET="your_jwt_secret_key"
PORT=3000
FRONTEND_URL="http://localhost:3000"
```

---

## Database Setup & Seeding
The application automatically runs idempotent schema initialization (`CREATE TABLE IF NOT EXISTS`) and seeds a demo user with sample readings on server startup.

To manually verify or inspect tables:
```sql
SELECT id, name, email FROM users;
SELECT id, user_id, date, slot, value FROM readings;
```

---

## How to Run Server & Client
- **Development Mode**:
  ```bash
  npm run dev
  ```
- **Production Build**:
  ```bash
  npm run build
  ```
- **Production Start**:
  ```bash
  npm start
  ```

---

## API Endpoints Reference
- **Auth**:
  - `POST /api/auth/register` — Register user
  - `POST /api/auth/login` — Login user
  - `GET /api/auth/me` — Get current user (Protected)
- **Readings**:
  - `GET /api/readings` — Get paginated readings (Protected)
  - `GET /api/readings/:id` — Get single reading (Protected)
  - `POST /api/readings` — Create reading with validation & locking (Protected)
  - `PUT /api/readings/:id` — Update reading (Protected)
  - `DELETE /api/readings/:id` — Delete reading (Protected)
- **Reports & Stats**:
  - `GET /api/reports/daily` — Daily report
  - `GET /api/reports/mtd` — Month-to-date report
  - `GET /api/reports/monthly` — Previous monthly report
  - `GET /api/stats` — Overall statistics

---

## Demo Account
- **Email**: `demo@sweety.app`
- **Password**: `password123`

---

## Screenshots

To capture screenshots on Windows:
1. Open the application in your browser (`http://localhost:3000`).
2. Use **Win + Shift + S** to capture each screen and save them to the `screenshots/` directory with the exact filenames listed below.

1. **Login Page** (`screenshots/01-login.png`)
   ![Login Page](screenshots/01-login.png)
   *Displays the sign-in form, demo login button, and registration link.*

2. **Dashboard** (`screenshots/02-dashboard.png`)
   ![Dashboard](screenshots/02-dashboard.png)
   *Displays summary statistic cards, today's 4 reading slots, recent readings, and trend chart.*

3. **Add Reading Form** (`screenshots/03-add-reading.png`)
   ![Add Reading](screenshots/03-add-reading.png)
   *Displays date picker, slot dropdown, glucose value input, and notes.*

4. **Reading History** (`screenshots/04-reading-history.png`)
   ![Reading History](screenshots/04-reading-history.png)
   *Displays paginated table of saved readings with edit and delete actions.*

5. **Validation Error** (`screenshots/05-validation.png`)
   ![Validation Error](screenshots/05-validation.png)
   *Displays exact error messages such as "Value must be between 40 and 600 mg/dL."*

6. **Reports Page** (`screenshots/06-reports.png`)
   ![Reports Page](screenshots/06-reports.png)
   *Displays Daily, MTD, and Monthly report tabs with summary statistics and breakdown.*

---

## Assumptions & Future Improvements
- **Assumptions**: Users record up to 4 distinct slots per calendar day. Timezones are managed in UTC/local ISO format.
- **Future Improvements**: Export reports to PDF/CSV, doctor role accounts for clinical monitoring, and email reminders for missed readings.
