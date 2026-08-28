AutoVexa — Online Vehicle Showroom

**AutoVexa** is a full-stack online vehicle marketplace where customers browse and book vehicles, vendors manage listings, and admins control vendors and the platform.

Built with **React (Vite)**, **Redux Toolkit**, **Express.js**, and **MySQL** (Sequelize).

---

## Features

### Customer
- Browse and filter vehicles
- View detailed vehicle information
- Sign up / log in (required before booking)
- Book available vehicles
- View bookings and download invoice data
- AI chat assistant (VexaBot) with conversation history

### Vendor
- Vendor registration (admin approval) or admin-created accounts
- Dashboard with stats
- Add / manage vehicles
- Toggle availability and delete listings
- View bookings for own vehicles

### Admin
- Admin dashboard with platform stats
- Create vendors and share login email & password
- Approve, disable, or delete vendors
- Overview of vehicles, users, and bookings

### Other
- Role-based login and protected routes
- Responsive UI (desktop, tablet, mobile)
- JWT authentication
- MySQL persistence for users, vehicles, bookings, and chat history

---

## Tech Stack

| Layer | Technology |
|--------|------------|
| Frontend | React 18, Vite, React Router, Redux Toolkit, Axios, Tailwind CSS, React Icons |
| Backend | Node.js, Express.js |
| Database | MySQL (Sequelize ORM) |
| Auth | JWT, bcrypt |
| AI Chat | OpenRouter API (optional) |

---

## Project Structure

```text
autovexa/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── services/
│   │   └── utils/
│   └── .env
└── server/                 # Express API
    ├── src/
    │   ├── config/
    │   ├── models/
    │   ├── routes/
    │   ├── middleware/
    │   ├── seed.js
    │   └── index.js
    └── .env
```

---

## Prerequisites

- **Node.js** 18+ (recommended 20 or 22)
- **MySQL** 5.7+ / 8.x (or **XAMPP** on Windows)
- npm

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/AutoVexa.git
cd AutoVexa
```

(Adjust the folder name if your repo root is `autovexa` or `AutoVexa-fullstack`.)

### 2. Create the MySQL database

In MySQL or phpMyAdmin:

```sql
CREATE DATABASE autovexa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Backend

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=autovexa
DB_USER=root
DB_PASSWORD=
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Optional — AI chatbot (OpenRouter)
OPENROUTER_API_KEY=
OPENROUTER_MODEL=openai/gpt-4o-mini
```

Install, seed, and run:

```bash
npm install
npm run seed
npm run dev
```

API: **http://localhost:5000**  
Health: **http://localhost:5000/api/health**

### 4. Frontend

```bash
cd ../client
```

Ensure `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_USE_MOCK=false
```

```bash
npm install
npm run dev
```

App: **http://localhost:5173**

---

## Running with XAMPP (Windows)

1. Start **MySQL** in XAMPP Control Panel (green).
2. Create database `autovexa` in phpMyAdmin.
3. Terminal 1:
   ```bash
   cd path\to\autovexa\server
   npm run dev
   ```
4. Terminal 2:
   ```bash
   cd path\to\autovexa\client
   npm run dev
   ```
5. Open http://localhost:5173

Both the **server** and **client** must run at the same time.

---

## Demo Accounts (after `npm run seed`)

| Role | Email | Password | Login path |
|------|--------|----------|------------|
| Admin | admin@autovexa.com | admin123 | `/admin/login` |
| Vendor | abc@motors.com | vendor123 | `/vendor/login` |
| Customer | sujeet@example.com | user123 | `/login` |

---

## Main API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Customer register |
| POST | `/api/auth/login` | Login (role-aware) |
| POST | `/api/auth/vendor/register` | Vendor register |
| GET | `/api/vehicles` | List vehicles |
| GET | `/api/vehicles/:id` | Vehicle details |
| POST | `/api/vehicles` | Add vehicle (vendor/admin) |
| GET | `/api/bookings` | Bookings (role-scoped) |
| POST | `/api/bookings` | Create booking (customer) |
| GET | `/api/admin/stats` | Admin stats |
| GET/POST | `/api/admin/vendors` | List / create vendors |
| DELETE | `/api/admin/vendors/:id` | Delete vendor |
| GET | `/api/vendor/stats` | Vendor stats |
| POST | `/api/chat` | AI chat message |
| GET | `/api/chat/history` | Chat history |

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `users` | Customers, vendors, admins |
| `vehicles` | Vehicle listings |
| `bookings` | Customer bookings |
| `chat_messages` | VexaBot conversation history |

---

## Scripts

### Server (`server/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API with file watch |
| `npm start` | Start API |
| `npm run seed` | Reset and seed demo data |

### Client (`client/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |


## Environment Variables

### Server

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default `5000`) |
| `DB_HOST` | MySQL host |
| `DB_PORT` | MySQL port |
| `DB_NAME` | Database name |
| `DB_USER` | MySQL user |
| `DB_PASSWORD` | MySQL password |
| `JWT_SECRET` | JWT signing secret |
| `CLIENT_URL` | Frontend origin (CORS) |
| `OPENROUTER_API_KEY` | Optional AI chat key |
| `OPENROUTER_MODEL` | OpenRouter model id |

### Client

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |
| `VITE_USE_MOCK` | `true` to fall back to mock data if API is down |

---

## Troubleshooting

| Issue | Fix |
|--------|-----|
| `ECONNREFUSED 3306` | Start MySQL in XAMPP |
| `Network Error` on login | Start the server (`npm run dev` in `server/`) |
| `vite is not recognized` | Run `npm install` inside `client/` |
| Admin/vendor login role error | Use the correct login page and demo credentials |
| Images not loading | Re-run `npm run seed`; ensure internet access for CDN images |

---

