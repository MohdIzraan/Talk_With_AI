# AI Chat Application

A full-stack MERN (MongoDB, Express, React, Node.js) web application that lets a registered user chat with an AI assistant in real time, with persistent multi-session chat history, JWT authentication, and a responsive dark/light UI. Built as a BCA final-year major project.

---

## 1. Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React.js (Vite), Tailwind CSS, Axios, React Router |
| Backend    | Node.js, Express.js |
| Database   | MongoDB with Mongoose |
| Auth       | JWT + bcrypt password hashing |
| AI         | OpenAI API (default) or Google Gemini API (switchable via `.env`) |

---

## 2. Folder Structure

```
ai-chat-app/
├── backend/
│   ├── config/          # db.js - MongoDB connection
│   ├── controllers/      # authController, chatController, aiController
│   ├── middleware/        # auth.js (JWT guard), errorHandler.js
│   ├── models/            # User.js, Chat.js (Mongoose schemas)
│   ├── routes/            # authRoutes, chatRoutes, aiRoutes
│   ├── services/          # aiService.js (OpenAI / Gemini integration)
│   ├── utils/              # generateToken.js, validators.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/    # Sidebar, Navbar, MessageBubble, TypingIndicator, LoadingSpinner, ProtectedRoute
    │   ├── pages/           # Login, Register, Chat, Profile
    │   ├── context/         # AuthContext, ThemeContext
    │   ├── services/        # api.js, authService.js, chatService.js
    │   ├── hooks/            # useAuth.js, useTheme.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    └── vite.config.js
```

---

## 3. Installation Guide

### Prerequisites
- Node.js v18+ and npm
- A MongoDB connection string (local MongoDB or free MongoDB Atlas cluster)
- An OpenAI API key (or a Gemini API key if you prefer Gemini)

### Step 1 — Clone / extract the project
Extract the provided zip, or if using git:
```bash
git clone <your-repo-url>
cd ai-chat-app
```

### Step 2 — Backend setup
```bash
cd backend
npm install
cp .env.example .env
# Now open .env and fill in MONGO_URI, JWT_SECRET, OPENAI_API_KEY, etc.
npm run dev
```
The API will start on `http://localhost:5000`. Visit `http://localhost:5000/api/health` to confirm it is running.

### Step 3 — Frontend setup
Open a **second terminal**:
```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL should point to the backend, e.g. http://localhost:5000/api
npm run dev
```
The app will start on `http://localhost:5173`.

### Step 4 — Use the app
1. Open `http://localhost:5173` in your browser.
2. Register a new account.
3. You'll be redirected to the Chat dashboard.
4. Click "New Chat" and start chatting with the AI.

---

## 4. Environment Variables

### backend/.env
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/ai-chat-app
JWT_SECRET=replace_this_with_a_long_random_secret_string
JWT_EXPIRES_IN=7d
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-2.5-flash
CLIENT_URL=http://localhost:5173
```

### frontend/.env
```
VITE_API_URL=http://localhost:5000/api
```

> To use Gemini instead of OpenAI, simply set `AI_PROVIDER=gemini` and fill in `GEMINI_API_KEY` — no code changes required, since `aiService.js` branches on this variable.

---

## 5. API Documentation

Base URL: `http://localhost:5000/api`

### Auth Routes (`/api/auth`)

| Method | Endpoint | Access | Body | Description |
|--------|----------|--------|------|--------------|
| POST | `/register` | Public | `{ name, email, password }` | Creates a new user, returns JWT + user |
| POST | `/login` | Public | `{ email, password }` | Authenticates user, returns JWT + user |
| GET | `/profile` | Private | — | Returns the logged-in user's profile |
| PUT | `/profile` | Private | `{ name?, avatar? }` | Updates the logged-in user's profile |

### Chat Routes (`/api/chats`) — all require `Authorization: Bearer <token>`

| Method | Endpoint | Body | Description |
|--------|----------|------|--------------|
| GET | `/` | — | List all chat sessions (title, timestamps) for the user |
| POST | `/` | `{ title? }` | Create a new empty chat session |
| GET | `/:id` | — | Get one chat session with full messages |
| PUT | `/:id` | `{ title }` | Rename a chat session |
| DELETE | `/:id` | — | Delete a chat session |

### AI Route (`/api/ai`) — requires `Authorization: Bearer <token>`

| Method | Endpoint | Body | Description |
|--------|----------|------|--------------|
| POST | `/message` | `{ chatId, content }` | Appends the user message, calls the AI provider, appends the AI reply, returns the updated chat |

### Example request
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secret123"}'
```

### Example response
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "64f...",
    "name": "Test User",
    "email": "test@example.com",
    "createdAt": "2026-01-01T10:00:00.000Z"
  }
}
```

---

## 6. Database Design

**User**
| Field | Type | Notes |
|-------|------|-------|
| name | String | required |
| email | String | required, unique |
| password | String | required, bcrypt-hashed, `select: false` |
| avatar | String | optional |
| createdAt / updatedAt | Date | auto (timestamps) |

**Chat**
| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId (ref: User) | required, indexed |
| title | String | default "New Chat" |
| messages | [Message] | embedded sub-documents |
| createdAt / updatedAt | Date | auto (timestamps) |

**Message (embedded in Chat.messages)**
| Field | Type | Notes |
|-------|------|-------|
| role | String enum: `user`, `assistant`, `system` | required |
| content | String | required |
| timestamp | Date | default now |

Messages are embedded inside their parent Chat document rather than stored as a separate collection, since a chat's messages are always read/written together — this avoids extra joins/populates and keeps read performance high for the app's access pattern.

---

## 7. Testing Instructions

### Manual testing checklist
1. **Registration** — try registering with an existing email → should show "Email is already registered". Try password < 6 chars → validation error.
2. **Login** — wrong password → "Invalid email or password". Correct credentials → redirected to `/chat`.
3. **JWT protection** — call `GET /api/chats` with Postman without a token → `401 Not authorized`.
4. **Chat flow** — create a new chat, send a message, confirm the AI reply appears and the sidebar title updates automatically from the first message.
5. **Multiple sessions** — create 2–3 chats, switch between them, confirm each keeps its own history.
6. **Delete chat** — delete a chat, confirm it disappears from the sidebar and (if active) the message pane clears.
7. **Dark mode** — toggle the moon/sun icon, refresh the page, confirm the theme persists (stored in `localStorage`).
8. **Responsive layout** — resize the browser / use DevTools device toolbar, confirm the sidebar collapses into a hamburger menu on mobile.
9. **Logout** — click logout, confirm redirect to `/login` and that visiting `/chat` directly redirects back to `/login`.

### API testing with curl / Postman
Import the endpoints listed in Section 5 into Postman, set an environment variable `{{token}}` after login, and add `Authorization: Bearer {{token}}` to the protected requests.

### Backend syntax verification
```bash
cd backend
node --check server.js
```

---

## 8. Deployment

### MongoDB Atlas (Database)
1. Create a free account at mongodb.com/atlas and create a free M0 cluster.
2. Under **Database Access**, create a database user with a username/password.
3. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) for demo purposes.
4. Click **Connect → Drivers**, copy the connection string, and replace `<username>`, `<password>`, and add your database name, e.g.:
   `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/ai-chat-app`
5. Paste this into `MONGO_URI` in your backend `.env` (and later, into Render's environment variables).

### Backend on Render
1. Push the `backend/` folder to a GitHub repository.
2. Go to render.com → **New → Web Service** → connect your GitHub repo.
3. Set **Root Directory** to `backend` (if the repo contains both folders).
4. Build Command: `npm install`  Start Command: `npm start`
5. Add all variables from `.env.example` under **Environment** (MONGO_URI, JWT_SECRET, OPENAI_API_KEY, AI_PROVIDER, CLIENT_URL, etc.) — set `CLIENT_URL` to your Vercel frontend URL once you have it.
6. Deploy. Render will give you a URL like `https://ai-chat-app-backend.onrender.com`.

### Frontend on Vercel
1. Push the `frontend/` folder to GitHub (or the same repo).
2. Go to vercel.com → **Add New → Project** → import the repo.
3. Set **Root Directory** to `frontend`.
4. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
5. Add an environment variable `VITE_API_URL` = `https://ai-chat-app-backend.onrender.com/api` (your Render backend URL + `/api`).
6. Deploy. Vercel gives you a URL like `https://ai-chat-app.vercel.app`.
7. Go back to Render and update `CLIENT_URL` to this Vercel URL so CORS allows it, then redeploy the backend.

---

## 9. Viva Questions & Answers

**Q1. What is the architecture of your project?**
A: It follows the MERN stack with a clear MVC pattern on the backend (Models, Controllers, Routes) and a component-based architecture on the frontend using React Context for global state (auth, theme).

**Q2. How is user authentication handled?**
A: On registration/login, the backend issues a signed JWT containing the user's ID. The frontend stores this token in `localStorage` and attaches it as a `Bearer` token via an Axios interceptor on every request. A backend middleware (`protect`) verifies the token on protected routes before allowing access.

**Q3. How are passwords kept secure?**
A: Passwords are never stored in plain text. A Mongoose `pre("save")` hook hashes the password using bcrypt (with a salt) before it is written to the database, and the schema field has `select: false` so it's excluded from query results by default.

**Q4. How does the chat history persist across sessions?**
A: Each chat session is a MongoDB document with an embedded array of messages (role, content, timestamp). When a user logs back in, the frontend calls `GET /api/chats` to repopulate the sidebar, and `GET /api/chats/:id` to load a specific conversation's full message history.

**Q5. Why did you embed messages inside the Chat document instead of a separate Message collection?**
A: Messages are always read and written together with their parent chat (you never query a message independent of its conversation), so embedding avoids extra `populate`/join operations and keeps reads fast — a reasonable schema-design tradeoff for this access pattern, at the cost of a per-document size limit (16MB) that is far beyond what a normal conversation reaches.

**Q6. How does the AI integration work?**
A: `aiService.js` abstracts over two providers (OpenAI Chat Completions API and Google Gemini), selected via the `AI_PROVIDER` environment variable. The controller builds the full conversation history and passes it to whichever provider is active, so the rest of the codebase doesn't need to know which AI is being used.

**Q7. How is the application secured against invalid input?**
A: `express-validator` rules are applied on the auth and AI routes (e.g., valid email format, minimum password length, non-empty message content) and a shared `validate` middleware returns a structured 400 error listing every failed field before the request ever reaches a controller.

**Q8. How does error handling work on the backend?**
A: All controller logic is wrapped in try/catch blocks that call `next(error)`. A centralized `errorHandler` middleware (registered last in `server.js`) inspects the error type — Mongoose CastError, duplicate key error, ValidationError — and returns an appropriately formatted JSON response with the correct HTTP status code.

**Q9. How is dark mode implemented?**
A: A `ThemeContext` stores a `darkMode` boolean, initialized from `localStorage` or the OS's `prefers-color-scheme`. Toggling it adds/removes a `dark` class on the `<html>` element, and Tailwind's `darkMode: "class"` strategy applies the corresponding `dark:` utility classes throughout the component tree.

**Q10. How would you scale this application further?**
A: Move to a WebSocket-based connection (e.g., Socket.io) for true real-time streaming token-by-token AI responses, add Redis caching for frequent queries, paginate chat history for users with very long conversations, and add role-based access control if an admin panel were introduced.

---

## 10. Advantages
- Demonstrates a complete, production-style full-stack workflow (auth, REST API, database design, third-party AI API integration) in a single project.
- Secure by design: hashed passwords, JWT-protected routes, server-side input validation.
- Clean separation of concerns (MVC backend, component/context-based frontend) makes the codebase easy to extend and to explain in a viva.
- AI provider is swappable via a single environment variable, with no code changes needed.

## 11. Future Scope
- Real-time streaming responses (token-by-token) via WebSockets/Server-Sent Events.
- Voice input/output for the chat interface.
- File/image upload support within conversations.
- Admin dashboard for usage analytics.
- Shareable/public chat links.

## 12. Conclusion
This project demonstrates how modern web development practices — secure authentication, RESTful API design, NoSQL database modeling, and AI API integration — combine into a single, deployable, real-world application, fulfilling the learning objectives of a BCA final-year major project.
