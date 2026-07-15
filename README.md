<<<<<<< HEAD
# FileFlow — Async File Processing App

A full-stack web application where authenticated users upload files that are processed asynchronously, with real-time status tracking and output downloads.

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, React Router v6, Axios  |
| Backend    | Node.js, Express                  |
| Database   | MongoDB + Mongoose                |
| Auth       | JWT (jsonwebtoken + bcryptjs)     |
| Upload     | Multer                            |
| Processing | sharp (images), pdf-parse (PDFs) |

---

## Prerequisites

- **Node.js** v16+ (`node -v`)
- **MongoDB** running locally on port 27017  
  — Install: https://www.mongodb.com/docs/manual/installation/  
  — Start: `mongod` or `brew services start mongodb-community`
- **npm** v8+

---

## Quick Start

### 1. Install all dependencies

```bash
# From the project root (fileflow/)
npm install          # installs concurrently
npm run install:all  # installs server + client deps
```

### 2. Configure environment

The server `.env` is pre-configured for local development:

```
# server/.env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fileflow
JWT_SECRET=your_super_secret_jwt_key_change_in_production_min_32_chars
JWT_EXPIRE=7d
```

> ⚠️ Change `JWT_SECRET` before any production deployment.

### 3. Run both servers

```bash
npm run dev
```

This starts:
- **Backend** on `http://localhost:5000` (nodemon, auto-reload)
- **Frontend** on `http://localhost:3000` (CRA dev server, proxied to backend)

---

## Manual Start (alternative)

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm start
```

---

## Project Structure

```
fileflow/
├── package.json              ← root scripts (concurrently)
│
├── server/
│   ├── app.js                ← Express entry point
│   ├── .env                  ← environment variables
│   ├── config/
│   │   └── db.js             ← MongoDB connection
│   ├── models/
│   │   ├── User.js           ← users collection
│   │   ├── File.js           ← files collection
│   │   └── Job.js            ← jobs collection
│   ├── middleware/
│   │   ├── auth.js           ← JWT protect middleware
│   │   └── upload.js         ← multer config + validation
│   ├── controllers/
│   │   ├── authController.js ← register / login / me
│   │   ├── fileController.js ← upload + download original
│   │   └── jobController.js  ← list / get / download output
│   ├── routes/
│   │   ├── auth.js
│   │   ├── files.js
│   │   └── jobs.js
│   ├── services/
│   │   └── processor.js      ← background async processing
│   └── uploads/              ← stored files + outputs/
│
└── client/
    ├── public/index.html
    └── src/
        ├── index.js           ← React entry
        ├── App.js             ← Router + auth guards
        ├── context/
        │   └── AuthContext.js
        ├── services/
        │   ├── api.js
        │   ├── authService.js
        │   └── fileService.js
        ├── pages/
        │   ├── AuthPage.js + AuthPage.css
        │   └── Dashboard.js + Dashboard.css
        ├── components/
        │   ├── Navbar.js + Navbar.css
        │   ├── FileUpload.js + FileUpload.css
        │   └── JobsTable.js + JobsTable.css
        └── styles/
            └── global.css
```

---

## API Reference

### Auth

| Method | Endpoint         | Auth | Description        |
|--------|-----------------|------|--------------------|
| POST   | /auth/register  | No   | Create account     |
| POST   | /auth/login     | No   | Get JWT token      |
| GET    | /auth/me        | JWT  | Get current user   |

### Files

| Method | Endpoint              | Auth | Description          |
|--------|----------------------|------|----------------------|
| POST   | /files/upload         | JWT  | Upload file          |
| GET    | /files/:id/download   | JWT  | Download original    |

### Jobs

| Method | Endpoint           | Auth | Description          |
|--------|-------------------|------|----------------------|
| GET    | /jobs              | JWT  | List user's jobs     |
| GET    | /jobs/:id          | JWT  | Get job details      |
| GET    | /jobs/:id/output   | JWT  | Download output      |

---

## Processing Behaviour

Every uploaded file goes through:

```
UPLOADED → PROCESSING (30%) → PROCESSING (70%) → DONE / FAILED
```

| File Type | Processing              | Output         |
|-----------|------------------------|----------------|
| PDF       | Extract page count     | `.json` file   |
| JPG/PNG   | Resize to 800px width  | Image file     |
| TXT       | Word/character count   | `.txt` report  |

Processing runs **outside** the upload request via `setImmediate()` — the upload API returns immediately with `{ jobId, status: "UPLOADED" }`. The frontend polls `/jobs` every 3 seconds and stops when status is `DONE` or `FAILED`.

---

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT verified on every protected route
- File downloads check `ownerId === req.user.id` — users can't access others' files
- File type validated on both extension and MIME type
- File size capped at 10 MB by multer

---

## Common Issues

**MongoDB not connecting**  
Make sure `mongod` is running: `brew services start mongodb-community` (macOS) or `sudo systemctl start mongod` (Linux).

**Port 5000 in use**  
Change `PORT` in `server/.env`.

**`sharp` install fails on Apple Silicon**  
Run: `npm install --prefix server --arch=arm64`

**CORS errors**  
The CRA proxy in `client/package.json` routes `/auth`, `/files`, `/jobs` to `localhost:5000`. Make sure the backend is running before the frontend.
=======
# Document_Processing_web
>>>>>>> ca922db663dd0dbec94f6d1aefb3c1ed65d38b4f
