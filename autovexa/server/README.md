# AutoVexa API (MySQL)

Express + **MySQL** (Sequelize) backend.

## Requirements

- Node.js 18+
- **MySQL 8** (or 5.7+) running locally

## Create database

In MySQL:

```sql
CREATE DATABASE autovexa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Configure

Copy `.env.example` → `.env` and set:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=autovexa
DB_USER=root
DB_PASSWORD=your_password
```

## Run

```bash
npm install
npm run seed
npm run dev
```

API: http://localhost:5000  
Health: http://localhost:5000/api/health

## Tables

| Table | Purpose |
|-------|---------|
| `users` | Customers, vendors, admins |
| `vehicles` | Vehicle listings |
| `bookings` | Bookings |

Tables are created/updated automatically via `sequelize.sync({ alter: true })`.
