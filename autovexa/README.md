# AutoVexa — Full Stack (React + Express + MySQL)

Online vehicle showroom with **React frontend** and **Express + MySQL** backend.

## Structure

```
autovexa/
├── client/          # React (Vite) frontend
└── server/          # Node.js + Express + MySQL (Sequelize)
```

## Prerequisites

- Node.js 18+
- **MySQL** 8.x (or 5.7+)

### Create the database

```sql
CREATE DATABASE autovexa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Setup

### 1. Backend (MySQL)

```bash
cd server
# edit .env — set DB_USER / DB_PASSWORD
npm install
npm run seed
npm run dev
```

API: **http://localhost:5000**

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

`client/.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_USE_MOCK=false
```

## Demo accounts (after seed)

| Role     | Email                | Password  |
|----------|----------------------|-----------|
| Admin    | admin@autovexa.com   | admin123  |
| Vendor   | abc@motors.com       | vendor123 |
| Customer | sujeet@example.com   | user123   |

## MySQL tables

| Table | Stores |
|-------|--------|
| **users** | Customers, vendors, admins (bcrypt passwords) |
| **vehicles** | Listings (`vendorId` FK → users) |
| **bookings** | Bookings (vehicle, customer, vendor FKs) |

## Tech

- **mysql2** + **Sequelize** ORM
- JWT auth, role-based access
- Same REST API shape as before (frontend unchanged)

## Windows MySQL tips

1. Install [MySQL Community](https://dev.mysql.com/downloads/installer/)
2. During setup, set a root password
3. Put that password in `server/.env` as `DB_PASSWORD`
4. Create DB: `CREATE DATABASE autovexa;`
