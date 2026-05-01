# White Nights

A book-focused social network — share reviews, follow fellow readers, organise your personal library.

---

## Table of contents

- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Project structure](#project-structure)
- [API reference](#api-reference)
- [WebSocket](#websocket)
- [Authentication](#authentication)
- [Database & migrations](#database--migrations)
- [File storage](#file-storage)
- [Roles & permissions](#roles--permissions)
- [Configuration](#configuration)
- [Error codes](#error-codes)

---

## Tech stack

| Layer | Technology |
|---|---|
| Language | Java 25 |
| Framework | Spring Boot 3.5 |
| Database | PostgreSQL 15 |
| Migrations | Flyway |
| ORM | Spring Data JPA / Hibernate |
| Auth | JWT (JJWT) + refresh tokens |
| File storage | MinIO (S3-compatible) |
| Real-time | Spring WebSocket + STOMP over SockJS |
| Build | Gradle |
| Utilities | Lombok, Bucket4j (rate limiting) |
| Frontend | React 19, TypeScript, Vite, TanStack Query, Zustand, Tailwind CSS |

---

## Quick start

### Requirements

- **Docker & Docker Compose** (for DB and storage)
- **JDK 25**
- **Node.js 20+** and **npm**
- **Gradle** (or use the bundled `./gradlew`)

### 1. Start infrastructure

From the repo root:
```bash
docker compose up -d
```

Starts:
- **PostgreSQL** on port `5432` (user: `user` / password: `password`)
- **MinIO** on ports `9000` (API) and `9001` (console)

### 2. MinIO buckets

Buckets (`avatars`, `posts`, `chat`) are **created automatically** on the first file upload — no manual setup needed.

If you prefer to create them upfront via CLI (requires `mc`):
```bash
mc alias set local http://localhost:9000 minioadmin minioadmin
mc mb local/avatars && mc mb local/posts && mc mb local/chat
mc anonymous set public local/avatars
mc anonymous set public local/posts
mc anonymous set public local/chat
```

### 3. Start the backend

```bash
cd backend
./gradlew bootRun
```
API will be available at `http://localhost:8080`.

### 4. Start the frontend

In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
The app will be available at `http://localhost:5173`. All `/api` requests are automatically proxied to the backend (port `8080`).

---

## Local development

| Service | URL | Notes |
|---|---|---|
| Frontend | `http://localhost:5173` | Vite dev server |
| Backend API | `http://localhost:8080` | REST + WebSocket |
| PostgreSQL | `localhost:5432` | Database `whitenights` |
| MinIO Console | `http://localhost:9001` | File storage UI |
| MinIO API | `http://localhost:9000` | S3-compatible API |

Email in dev is **console-only** (`ConsoleEmailService`) — check the backend logs for verification tokens.

---

## Project structure

```
backend/src/main/java/com/whitenights/
├── admin/          — user management and stats (admin only)
├── auth/           — registration, verification, JWT, refresh tokens, password reset
├── bookshelf/      — user bookshelves and books
├── chat/           — 1:1 and group chats, WebSocket, presence
├── common/         — security, storage, email, exceptions
├── feed/           — subscription timeline
├── moderation/     — report queue and moderator actions
├── post/           — posts, comments, likes, saves, views
├── search/         — full-text and trigram search across users, posts, tags
├── settings/       — saved posts, password change, support, account deletion
├── tag/            — tags: search, recent, posts by tag
├── tracker/        — reading tracker by date
└── user/           — profiles, follows, follow requests
```

DB migrations: `backend/src/main/resources/db/migration/`

Frontend:
```
frontend/src/
├── App.tsx             — routing + AppShell (TopBar + SideNav) / AuthShell layouts
├── features/           — one directory per feature (auth, profile, feed, chat, …)
│   └── <feature>/
│       ├── hooks/      — TanStack Query + business logic
│       └── *.tsx       — pages and modals
└── shared/
    ├── api/client.ts   — axios instance (reads access_token from localStorage)
    └── store/          — Zustand stores (useAuthStore)
```

---

## API reference

Base URL: `http://localhost:8080`

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

---

### Authentication `/api/auth`

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/api/auth/register` | `{ nickname, email, password }` | Register; sends verification email |
| POST | `/api/auth/verify` | `{ token }` | Activate account |
| POST | `/api/auth/login` | `{ email, password }` | Login; returns `accessToken` and sets `refresh_token` cookie |
| POST | `/api/auth/refresh` | *(cookie)* | Rotate both tokens |
| POST | `/api/auth/logout` | `{ refreshToken }` | Revoke refresh token |
| POST | `/api/auth/password/reset-request` | `{ email }` | Request password reset link |
| POST | `/api/auth/password/reset` | `{ token, newPassword }` | Reset password |

**Constraints:** nickname 3–50 chars, unique; password ≥ 8 chars; email verification required before login; banned accounts cannot log in.

---

### Profiles `/api/users`

| Method | Path | Description |
|---|---|---|
| GET | `/api/users/me` | My profile (auth required) |
| GET | `/api/users/:nickname` | Profile by nickname |
| PATCH | `/api/users/me` | Update nickname / bio / isPrivate |
| POST | `/api/users/me/avatar` | Upload avatar (multipart `file`) |
| DELETE | `/api/users/me/avatar` | Delete avatar |
| GET | `/api/users/:id/followers` | Follower list |
| GET | `/api/users/:id/following` | Following list |
| GET | `/api/users/:nickname/online` | Online status → `{ "online": true/false }` |

**Private profiles:** outsiders see only nickname, avatar, and bio.

---

### Follows `/api/users`

| Method | Path | Description |
|---|---|---|
| POST | `/api/users/:id/follow` | Follow (public → immediate; private → pending request) |
| DELETE | `/api/users/:id/follow` | Unfollow |
| GET | `/api/users/me/follow-requests` | Incoming follow requests |
| POST | `/api/users/me/follow-requests/:followerId/accept` | Accept request |
| POST | `/api/users/me/follow-requests/:followerId/reject` | Reject request |

---

### Posts

| Method | Path | Description |
|---|---|---|
| POST | `/api/posts` | Create post (multipart: `data` JSON + optional `image`) |
| GET | `/api/posts/:id` | Get post |
| PATCH | `/api/posts/:id` | Edit (author or moderator) |
| DELETE | `/api/posts/:id` | Delete (author or moderator) |
| GET | `/api/users/:id/posts?cursor=&limit=` | Posts by user |

**Post body** (`data`):
```json
{
  "title": "The Master and Margarita",
  "author": "Mikhail Bulgakov",
  "description": "A great novel…",
  "tagNames": ["classic", "fiction"],
  "tagIds": []
}
```

---

### Post interactions

| Method | Path | Description |
|---|---|---|
| POST | `/api/posts/:id/like` | Like |
| DELETE | `/api/posts/:id/like` | Unlike |
| POST | `/api/posts/:id/save` | Save |
| DELETE | `/api/posts/:id/save` | Unsave |
| POST | `/api/posts/:id/view` | Record view (idempotent) |
| GET | `/api/posts/:id/comments?cursor=&limit=` | Comments |
| POST | `/api/posts/:id/comments` | Add comment `{ text }` |
| DELETE | `/api/comments/:id` | Delete comment (author or moderator) |

---

### Feed `/api/feed`

| Method | Path | Description |
|---|---|---|
| GET | `/api/feed?cursor=&limit=` | Posts from subscriptions (cursor pagination) |

Returns posts from accepted follows, newest first. Includes `liked` and `saved` flags for the current user.

---

### Tags `/api/tags`

| Method | Path | Description |
|---|---|---|
| GET | `/api/tags/search?q=&limit=` | Search tags by prefix |
| GET | `/api/tags/recent?limit=` | Recent tags for the user + globally popular |
| GET | `/api/tags/:name/posts?cursor=&limit=` | Posts by tag |

---

### Search `/api/search`

| Method | Path | Description |
|---|---|---|
| GET | `/api/search?q=&limit=` | Grouped results (users + posts + tags, 5 each) |
| GET | `/api/search/users?q=&cursor=&limit=` | Search users |
| GET | `/api/search/posts?q=&cursor=&limit=` | Search posts |
| GET | `/api/search/tags?q=&cursor=&limit=` | Search tags |

Empty `q` returns 400. Private users appear but only public fields are shown.

---

### Bookshelves

| Method | Path | Description |
|---|---|---|
| GET | `/api/users/:id/shelves` | User's shelves with books (privacy respected) |
| POST | `/api/shelves/:shelfId/books` | Add book `{ title, author }` |
| DELETE | `/api/books/:bookId` | Delete book |
| POST | `/api/books/:bookId/move` | Move `{ toShelfId, position? }` |
| POST | `/api/shelves/:shelfId/reorder` | Reorder `{ bookIds: [] }` |

Three shelves are created automatically on registration: **Want to read**, **Reading**, **Read**.

---

### Reading tracker `/api/tracker`

| Method | Path | Description |
|---|---|---|
| GET | `/api/tracker?month=YYYY-MM` | Entries for the month |
| PUT | `/api/tracker/:date` | Upsert entry `{ pagesRead? }` (date: `YYYY-MM-DD`) |
| DELETE | `/api/tracker/:date` | Delete entry |

Future dates are blocked on the frontend.

---

### Chats (REST)

| Method | Path | Description |
|---|---|---|
| GET | `/api/chats` | List chats with last-message preview |
| POST | `/api/chats` | Create chat: `{ peerId }` (1:1) or `{ name, memberIds[] }` (group) |
| GET | `/api/chats/:id/messages?cursor=&limit=` | Message history |
| POST | `/api/chats/:id/upload-image` | Send an image (multipart `file`); uploads to MinIO `chat` bucket and broadcasts via WebSocket |
| POST | `/api/chats/:id/members` | Add member `{ userId }` (group owner only) |
| DELETE | `/api/chats/:id/members/:userId` | Remove member (owner only) |
| DELETE | `/api/messages/:id` | Soft-delete own message |

---

### Reports

| Method | Path | Description |
|---|---|---|
| POST | `/api/reports` | Report `{ targetType: post/comment/user, targetId, reason }` |
| GET | `/api/reports/me` | My reports |

Reason: 10–1000 chars. Duplicate pending report returns 409.

---

### Moderation (role: moderator / admin)

| Method | Path | Description |
|---|---|---|
| GET | `/api/moderation/reports?status=&cursor=&limit=` | Report queue |
| GET | `/api/moderation/reports/:id` | Specific report |
| POST | `/api/moderation/reports/:id/claim` | Claim (`in_review`) |
| POST | `/api/moderation/reports/:id/resolve` | Resolve `{ action, comment }` |

Actions (`action`): `block_post`, `warn_user`, `ban_user`, `reject`.

---

### Administration (role: admin)

| Method | Path | Description |
|---|---|---|
| POST | `/api/admin/users/:id/role` | Change role `{ role: user/moderator/admin }` |
| POST | `/api/admin/users/:id/unban` | Unban |
| DELETE | `/api/admin/users/:id` | Delete account |
| GET | `/api/admin/stats` | Stats (users, posts, reports, chats) |

Downgrading the last admin is forbidden (returns 403).

---

### Settings

| Method | Path | Description |
|---|---|---|
| GET | `/api/users/me/saved?cursor=&limit=` | Saved posts |
| POST | `/api/users/me/password` | Change password `{ currentPassword, newPassword }` |
| POST | `/api/support` | Contact support `{ subject?, message }` |
| DELETE | `/api/users/me` | Delete account |

---

## WebSocket

Connection: `ws://localhost:8080/ws` (SockJS).

### Authentication

Pass the access token in the STOMP CONNECT frame:
```
Authorization: Bearer <access_token>
```

### Sending messages

```
SEND /app/chat/{chatId}
Content-Type: application/json

{ "text": "Hello!" }
```

### Receiving messages

Subscribe to:
```
/topic/chat/{chatId}
```

Image messages are delivered to the same topic (sent via `POST /api/chats/:id/upload-image`).

### Presence

Online status is tracked in-memory by `PresenceService`. `PresenceEventListener` wires STOMP connect/disconnect Spring events — no manual call required.

Check status: `GET /api/users/:nickname/online` → `{ "online": true/false }`

---

## Authentication

| Token | Lifetime | Storage |
|---|---|---|
| Access token (JWT) | 15 minutes | `Authorization: Bearer` header |
| Refresh token | 14 days | `httpOnly` cookie |

All refresh tokens are revoked on password change or ban.

---

## Database & migrations

Flyway migrations run automatically on startup.

| Version | Description |
|---|---|
| V1 | Base schema: users, posts, comments, tags, likes, views, save, shelves, books, reports, moderation_actions, chats, messages |
| V2 | `follows` table |
| V3 | `reading_tracker` table |
| V4 | Performance indexes |
| V5 | Email verification tokens |
| V6 | Refresh tokens |
| V7 | Password reset tokens |
| V8 | `is_private` column in users |
| V9 | Tags + `is_blocked` column in posts |
| V10 | `position` column in shelves + unique constraint |
| V11 | `pg_trgm` extension + GIN indexes + `search_vector` in posts |
| V12 | `comment` column in moderation_actions |
| V13 | `is_group` in chats + `is_deleted` in messages |
| V14 | Nested comment replies support |
| V15 | `text` in messages becomes nullable; `image_url` column added |

---

## File storage

MinIO is used as an S3-compatible object store.

| Bucket | Contents |
|---|---|
| `avatars` | User avatars |
| `posts` | Post images |
| `chat` | Chat images |

Only files with `Content-Type: image/*` are accepted. All buckets are auto-created on first upload.

---

## Roles & permissions

| Role | Capabilities |
|---|---|
| `user` | All public actions: read, post, interact, chat |
| `moderator` | + Report queue, block posts, ban users |
| `admin` | + Role management, unban, account deletion, stats |

Default role on registration: `user`.

---

## Configuration

Main file: `backend/src/main/resources/application.yml`

| Parameter | Default | Description |
|---|---|---|
| `spring.datasource.url` | `jdbc:postgresql://localhost:5432/whitenights` | PostgreSQL URL |
| `auth.jwt.secret` | *(see file)* | JWT secret — **change in production** |
| `auth.jwt.access-expiration-ms` | `900000` (15 min) | Access token TTL |
| `auth.jwt.refresh-expiration-ms` | `1209600000` (14 days) | Refresh token TTL |
| `minio.endpoint` | `http://localhost:9000` | MinIO URL |
| `minio.access-key` | `minioadmin` | MinIO access key |
| `minio.secret-key` | `minioadmin` | MinIO secret key |
| `minio.bucket` | `avatars` | Avatar bucket |
| `minio.posts-bucket` | `posts` | Post image bucket |
| `minio.chat-bucket` | `chat` | Chat image bucket |
| `support.email` | `support@whitenights.local` | Support address |

---

## Error codes

| HTTP | Situation |
|---|---|
| 400 | Bad request / validation error |
| 401 | Not authenticated / invalid token / unverified / banned |
| 403 | Forbidden (private profile / resource owned by someone else / wrong role) |
| 404 | Resource not found |
| 409 | Conflict (duplicate email / nickname / report) |
| 429 | Too many requests (rate limiting) |
