AutoVexa — Online Vehicle Marketplace

**AutoVexa** is a full-stack online vehicle marketplace where customers browse and book vehicles, vendors manage listings, and admins control vendors and the platform.

Built with **React (Vite)**, **Redux Toolkit**, **Express.js**, and **MySQL** (Sequelize).

---

## Features

### Customer

- Browse and filter vehicles
- View detailed vehicle information
- Sign up / log in (required before booking)
- Book available vehicles
- View bookings and download invoices
- Agentic AI chat assistant (VexaBot) with live inventory tools and conversation history

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

### VexaBot AI

- Searches live vehicles by brand, type, fuel, price, and availability
- Shows vehicle details and checks availability from the database
- Guides customers through booking and invoices
- Explains customer, vendor, and admin workflows
- Uses OpenRouter tool calling when `OPENROUTER_API_KEY` is configured

---

## Tech Stack

| Layer    | Technology                                                                    |
| -------- | ----------------------------------------------------------------------------- |
| Frontend | React 18, Vite, React Router, Redux Toolkit, Axios, Tailwind CSS, React Icons |
| Backend  | Node.js, Express.js                                                           |
| Database | MySQL (Sequelize ORM)                                                         |
| Auth     | JWT, bcrypt                                                                   |
| AI Chat  | OpenRouter API (optional)                                                     |

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
git clone https://github.com/sujeethonnappagol/autovexa.git
cd autovexa
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

# Razorpay platform account (required for real booking payments)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
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

### Razorpay vendor payments

Real payments use Razorpay Checkout and Razorpay Route. Enable Route on the Razorpay platform account and create or onboard a linked account for every vendor. Copy each vendor's linked account ID (for example, `acc_...`) into **Admin → Vendors → Razorpay linked account ID** and save it.

The server verifies the Razorpay signature and transfers the full booking amount to the linked account belonging to the vehicle's vendor. It refuses checkout when the platform keys or that vendor's linked account are missing. Never commit `RAZORPAY_KEY_SECRET`; keep it only in `server/.env`.

After updating `server/.env`, run:

```bash
cd server
npm run migrate
npm run dev
```

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

## Deploy Frontend to Vercel

The React client can be deployed to Vercel. The Express API and MySQL database must run on a separate Node.js and managed MySQL host.

In Vercel, import the repository and set:

```text
Root Directory: autovexa/client
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

Add these Vercel environment variables:

```env
VITE_API_URL=https://your-backend-domain.example/api
VITE_USE_MOCK=false
```

For a frontend-only demo without a deployed API, use `VITE_USE_MOCK=true`.

The client includes `client/vercel.json` for React Router history fallback.

For the backend, configure the server host with the variables in `server/.env.example` and set `CLIENT_URL` to the Vercel domain.

---

## Demo Accounts (after `npm run seed`)

| Role     | Email              | Password  | Login path      |
| -------- | ------------------ | --------- | --------------- |
| Admin    | admin@autovexa.com | admin123  | `/admin/login`  |
| Vendor   | abc@motors.com     | vendor123 | `/vendor/login` |
| Customer | sujeet@example.com | user123   | `/login`        |

---

## Main API Routes

| Method   | Endpoint                    | Description                |
| -------- | --------------------------- | -------------------------- |
| POST     | `/api/auth/register`        | Customer register          |
| POST     | `/api/auth/login`           | Login (role-aware)         |
| POST     | `/api/auth/vendor/register` | Vendor register            |
| GET      | `/api/vehicles`             | List vehicles              |
| GET      | `/api/vehicles/:id`         | Vehicle details            |
| POST     | `/api/vehicles`             | Add vehicle (vendor/admin) |
| GET      | `/api/bookings`             | Bookings (role-scoped)     |
| POST     | `/api/bookings`             | Create booking (customer)  |
| GET      | `/api/admin/stats`          | Admin stats                |
| GET/POST | `/api/admin/vendors`        | List / create vendors      |
| DELETE   | `/api/admin/vendors/:id`    | Delete vendor              |
| GET      | `/api/vendor/stats`         | Vendor stats               |
| POST     | `/api/chat`                 | AI chat message            |
| GET      | `/api/chat/history`         | Chat history               |

---

## Database Tables

| Table           | Purpose                      |
| --------------- | ---------------------------- |
| `users`         | Customers, vendors, admins   |
| `vehicles`      | Vehicle listings             |
| `bookings`      | Customer bookings            |
| `chat_messages` | VexaBot conversation history |

---

## Scripts

### Server (`server/`)

| Command        | Description               |
| -------------- | ------------------------- |
| `npm run dev`  | Start API with file watch |
| `npm start`    | Start API                 |
| `npm run seed` | Reset and seed demo data  |

### Client (`client/`)

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start Vite dev server    |
| `npm run build`   | Production build         |
| `npm run preview` | Preview production build |

## Environment Variables

### Server

| Variable             | Description               |
| -------------------- | ------------------------- |
| `PORT`               | API port (default `5000`) |
| `DB_HOST`            | MySQL host                |
| `DB_PORT`            | MySQL port                |
| `DB_NAME`            | Database name             |
| `DB_USER`            | MySQL user                |
| `DB_PASSWORD`        | MySQL password            |
| `JWT_SECRET`         | JWT signing secret        |
| `CLIENT_URL`         | Frontend origin (CORS)    |
| `OPENROUTER_API_KEY` | Optional AI chat key      |
| `OPENROUTER_MODEL`   | OpenRouter model id       |

### Client

| Variable        | Description                                     |
| --------------- | ----------------------------------------------- |
| `VITE_API_URL`  | Backend API base URL                            |
| `VITE_USE_MOCK` | `true` to fall back to mock data if API is down |

---

## Troubleshooting

| Issue                         | Fix                                                          |
| ----------------------------- | ------------------------------------------------------------ |
| `ECONNREFUSED 3306`           | Start MySQL in XAMPP                                         |
| `Network Error` on login      | Start the server (`npm run dev` in `server/`)                |
| `vite is not recognized`      | Run `npm install` inside `client/`                           |
| Admin/vendor login role error | Use the correct login page and demo credentials              |
| Images not loading            | Re-run `npm run seed`; ensure internet access for CDN images |

---
