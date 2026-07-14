# AI Chat Application

A full-stack MERN (MongoDB, Express, React, Node.js) web application that lets a registered user chat with an AI assistant in real time, with persistent multi-session chat history, JWT authentication, and a responsive dark/light UI. 

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

## 2. Database Design

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

## 3. Testing Instructions

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

---

## 4. Advantages
- Demonstrates a complete, production-style full-stack workflow (auth, REST API, database design, third-party AI API integration) in a single project.
- Secure by design: hashed passwords, JWT-protected routes, server-side input validation.
- Clean separation of concerns (MVC backend, component/context-based frontend) makes the codebase easy to extend and to explain in a viva.
- AI provider is swappable via a single environment variable, with no code changes needed.

## 5. Future Scope
- Real-time streaming responses (token-by-token) via WebSockets/Server-Sent Events.
- Voice input/output for the chat interface.
- File/image upload support within conversations.
- Admin dashboard for usage analytics.
- Shareable/public chat links.

## 6. Conclusion
This project demonstrates how modern web development practices — secure authentication, RESTful API design, NoSQL database modeling, and AI API integration — combine into a single, deployable, real-world application, fulfilling the learning objectives 
