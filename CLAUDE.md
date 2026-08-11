# CLAUDE.md — WhatsApp Clone

This file gives Claude instant project context. Read this before touching any code.

## Project Layout

```
whatsapp/
├── server/          # Express + TypeScript backend (port 4000)
└── web/             # React + Vite frontend (port 5173)
```

Folders are `server/` and `web/` — never `backend/` or `frontend/`.

## Running the project

```bash
# Backend
cd server && npm run dev          # tsx --watch server.ts
cd server && npm run build        # typecheck only (tsc --noEmit)
cd server && npm start            # run via tsx (production)

# Frontend
cd web && npm run dev             # vite dev server (HMR via @vitejs/plugin-react)
cd web && npm run build           # tsc -b && vite build
cd web && npm run lint            # eslint (must be clean)
```

MongoDB must be running locally on port 27017. Copy `.env.example` → `.env` in each package and fill in real values (`.env` is gitignored — never commit it).

## Backend Architecture

**Entry point**: `server/server.ts`
Wires `helmet`, CORS (credentials), `express.json`, `cookie-parser`, `morgan`, routes, a `/health` check, a 404 handler, the global error handler, Socket.io, and graceful shutdown (SIGINT/SIGTERM). Boot failure calls `process.exit(1)`.

**Config** (`server/config/`)
- `env.ts` — single source of truth, **zod-validated at boot**. Required secrets (`JWT_SECRET` ≥16 chars, `GOOGLE_CLIENT_ID`, `CLOUDINARY_*`) fail fast if missing. Exposes `env.isProduction`. Never read `process.env` directly elsewhere.
- `db.ts` — Mongoose connect with retry. Call `connectDB()` once at startup.
- `cloudinary.ts` — pre-configured Cloudinary v2 SDK instance.
- `uploads.ts` — `ALLOWED_UPLOADS` (mime → {messageType, resourceType}), `isAllowedMime`, `MAX_FILE_SIZE`. Shared by the multer filter and the upload service.

**Models** (`server/models/`)
- `User.model.ts` — name, email, **passwordHash (`select:false`)**, avatarUrl, provider (local|google), googleId, isOnline, lastSeen. Pre-save bcrypt hook; `comparePassword(plain)`. Also exports `PUBLIC_USER_FIELDS` (projection string) and `toPublicUser(doc)` → `IUserPublic` (the one public-shape mapper, reused everywhere).
- `Room.model.ts` — name?, type (dm|group), members[] (indexed), createdBy, **dmKey** (unique partial index). `Room.findOrCreateDM` uses an atomic upsert on `dmKey` (no duplicate DMs, no self-DM).
- `Message.model.ts` — roomId, senderId, content, type (text|image|video|pdf), file fields, **deliveredTo[]**, readBy[]. Compound index `{ roomId, createdAt }`. Both receipt arrays include the sender, so "delivered/read" means *some id other than `senderId`* — that's what drives the one-tick → two-tick → blue-tick progression. Also exports `AttachmentType` (`MessageType` minus `"text"`).
- `Upload.model.ts` — ownerId, publicId, resourceType, fileUrl, fileName, fileSize, mimeType, messageType, **consumedAt**. One row per server-performed Cloudinary upload; single-use, claimed atomically. Index `{ consumedAt, createdAt }` for sweeping abandoned uploads.

**Types** (`server/types/`) — `express.d.ts` (`Request.user?: IUserPublic`), `file.types.ts`, `socket.types.ts`.

**Utils** (`server/utils/`)
- `ApiError.ts` — `class ApiError(statusCode, message)`. Services/controllers throw these; the global handler formats them.
- `asyncHandler.ts` — wraps async controllers so throws become `next(err)`.
- `objectId.ts` — `assertObjectId(id, label)` → throws `ApiError(400)` on a bad id.

**Services** (`server/services/`)
- `auth.service.ts` — `registerUser`, `loginUser` (opts into `+passwordHash`), `generateToken`, `verifyToken`, `verifyGoogleToken` (requires `email_verified`), `findOrCreateGoogleUser` (auto-links only when the existing account is already `provider:"google"`, else 409). Throws `ApiError` for auth failures so infra errors aren't masked as 401.
- `file.service.ts` — `createUpload(file, ownerId)` resolves the type from `ALLOWED_UPLOADS`, uploads via `upload_stream` with `unique_filename`, and records an `Upload`. `claimUpload(uploadId, ownerId)` atomically marks it consumed — the filter carries both the ownership check and the single-use guarantee, so a foreign, spent, or unknown id all fail identically.
- `message.service.ts` — `createRoomMessage({ roomId, senderId, content, uploadId, isOnline })`, the single place a message is written. Authorizes the room, claims the upload, derives `type` and every file field from the `Upload` record, and stamps `deliveredTo` for members with a live socket (presence is injected via `isOnline`, keeping socket state out of the service).

**Middleware** (`server/middleware/`)
- `auth.middleware.ts` — `requireAuth`: JWT from `Authorization: Bearer` OR `authToken` cookie → `req.user` via `toPublicUser`.
- `upload.middleware.ts` — Multer memory storage, `MAX_FILE_SIZE`, mime allowlist; rejects with `ApiError(400)`.
- `rateLimit.middleware.ts` — `authLimiter` (throttles login/register/google).

**Modules** (`server/modules/`) — controllers are thin and **throw `ApiError`**; routes wrap them in `asyncHandler`.
- `auth/` → `/api/auth/register|login|google` (rate-limited), `/me`, `/logout`. Cookie `secure: env.isProduction`.
- `users/` → `GET /api/users`, `GET /api/users/:id` (protected, id validated).
- `rooms/` → `POST /dm`, `POST /group`, `GET /`, `GET /:roomId/messages`. **`getRoomMessages` enforces `isRoomMember` (no IDOR).**
- `files/` → `POST /api/files/uploadFile` (protected, multer here). Responds `201 { uploadId }` — a handle only, never the file metadata.

**Socket.io** (`server/socket/`)
- `socket.server.ts` — `initSocketServer(httpServer)`, `getIO()`.
- `socket.middleware.ts` — reads JWT from the `authToken` **cookie** (falls back to `handshake.auth.token`).
- `socket.handlers.ts` — thin, like an HTTP controller: it validates the socket-only bits and delegates to services, with `emitError` mapping a thrown `ApiError` to `error` and anything else to a logged generic. Every handler validates ObjectIds + enforces `isRoomMember`; `send-message` delegates to `createRoomMessage` and echoes the client's `clientId` **back to the sender only** (so its optimistic bubble reconciles instead of duplicating); presence uses a per-user connection count (multi-tab safe); `mark-room-read` is scoped by `roomId`. Delivery is stamped in two places: `send-message` marks members with a live socket (`onlineCounts`), and `handleConnect` flushes the backlog for a user who just came online.

## Frontend Architecture

**Entry**: `web/src/main.tsx` (imports `./index.css`) → `App.tsx` → `AppProviders` → `AppRouter`.

**Providers** (`web/src/app/providers.tsx`)
Order: `GoogleOAuthProvider` → `AuthProvider` → `SocketProvider` → `PresenceProvider`. `AuthProvider` runs the session-restore effect itself (no separate initializer). All provider values are `useMemo`'d.

**API layer** (`web/src/api/`) — typed wrappers over the axios instance: `auth.api`, `users.api`, `rooms.api`, `files.api`.

**Axios** (`web/src/services/axios.ts`)
- `withCredentials: true` — auth is the httpOnly cookie; **no token in JS**.
- On a 401 to a non-`/api/auth/*` route, calls the handler registered via `setUnauthorizedHandler` (AuthProvider clears the user → ProtectedRoute redirects). No hard `window.location` redirect.

**Types** (`web/src/types/index.ts`) — IUser, IRoom, IMessage (+ client-only `clientId`/`pending`), IUploadResponse, socket payloads.

**Utils** (`web/src/utils/`) — `format.ts` (`formatBytes`, `formatTime`), `room.ts` (`getRoomMeta` — the one DM/group display selector), `apiError.ts` (`getApiErrorMessage`).

**Auth** (`web/src/features/auth/`)
- `auth-context.ts` — `AuthContext` + type (constant only, for fast-refresh).
- `AuthProvider.tsx` — state `{ user, isAuthLoading, login(user), logout() }`; restores session via `getMe()` on mount.
- `ProtectedRoute.tsx` — `Spinner` while loading, `<Navigate to="/login">` if no user.
- `AuthLayout.tsx` / `AuthField.tsx` / `AuthDivider.tsx` / `GoogleSignInButton.tsx` — shared by Login + Signup.

**Context** (`web/src/context/`)
- `socket-context.ts` + `SocketProvider.tsx` — socket held in **state** (consumers re-render on connect); connects when `user` is set, cookie-authed.
- `presence-context.ts` + `PresenceProvider.tsx` — live online map from `user-online`/`user-offline`; exposes `isOnline(userId, fallback)`.

**Hooks** (`web/src/hooks/`)
- `useAuth`, `useSocket`, `usePresence` — context accessors.
- `useUsers`, `useRooms` — data + `{ isLoading, error }`.
- `useRoomMessages(room)` — history load (loading/error), receive (deduped + optimistic reconciliation by `clientId`), delivered/read receipts (batched, room-scoped), `sendText`/`sendFile`, `sendError`.
- `useTyping(room)` — `typingNames` + debounced `notifyTyping`/`notifyStopTyping`.

**Shared components** (`web/src/components/shared/`) — `Avatar`, `OnlineIndicator`, `FilePreviewBar`, `Spinner`, `Button`, `IconButton` (required `label`), `EmptyState`, `ListRow`, `Modal` (accessible dialog: focus trap, Escape, backdrop), `PanelHeader` (shared `h-16` header).

**Feature components** — `components/Chat/{ChatWindow,MessageList,MessageBubble,MessageInput,TypingIndicator}`, `components/Sidebar/{Sidebar,UserList,RoomList,CreateGroupModal}`.

**Pages** (`web/src/pages/`) — `LoginPage`, `SignupPage`, `ChatPage` (uses `useRooms`; mobile single-pane via responsive show/hide).

**Routes** (`web/src/app/router.tsx`) — `/login`, `/signup`, `/chat` (protected), `/` & `*` → `/chat`.

## Design System

Tokens live in `web/src/index.css` under Tailwind v4 `@theme` — **never hardcode hex**. Use the utilities they generate:
- Surfaces: `bg-canvas` (app), `bg-panel`, `bg-surface`, `bg-input`; borders `border-line` / `border-line-subtle`.
- Brand: `brand` (CTAs/links/active), `brand-hover`, `brand-strong` + `brand-strong-hover` (composer/send), `bubble-out` (own message).
- Text: `text-fg`, `text-muted`, `text-faint`; feedback `text-danger` / `bg-danger-surface`.
- Type: `font-sans` (DM Sans), `font-display` (Sora). Radius token `--radius-bubble`.
A global `:focus-visible` ring is defined once in `index.css`. Icons come from **lucide-react** only. Prefer `shrink-0` over `flex-shrink-0`.

## Auth Flow

**Cookie-only.** `POST /api/auth/register|login|google` set an httpOnly `authToken` cookie; the response body's `user` populates `AuthProvider` (the body token is ignored client-side). The cookie authenticates both HTTP (`withCredentials`) and the socket handshake. **Google OAuth**: `@react-oauth/google` `GoogleLogin` → `credential` → `POST /api/auth/google`. Cookie name: `authToken`.

## Socket Events

| Direction | Event | Payload |
|---|---|---|
| client→server | `join-room` / `leave-room` | `{ roomId }` (membership-checked) |
| client→server | `send-message` | `{ roomId, content?, uploadId?, clientId? }` — **no type, no file fields** |
| client→server | `typing` / `stop-typing` | `{ roomId }` |
| client→server | `mark-room-read` | `{ roomId }` (on room open + on each new message) |
| server→client | `receive-message` | populated `IMessage` (+ `clientId`, echoed to the sender only) |
| server→client | `user-typing` / `user-stop-typing` | `{ userId, name?, roomId }` |
| server→client | `user-online` / `user-offline` | `{ userId, lastSeen? }` (consumed by PresenceProvider) |
| server→client | `messages-delivered` / `messages-read` | `{ roomId, messageIds, userId }` (batched receipts) |
| server→client | `error` | `{ message }` (surfaced near the composer) |

## Environment Variables

### `server/.env` (see `server/.env.example`)
`PORT`, `NODE_ENV`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `CLIENT_URL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

### `web/.env` (see `web/.env.example`)
`VITE_API_URL`, `VITE_SOCKET_URL`, `VITE_GOOGLE_CLIENT_ID`.

## Key Conventions

- **TypeScript strict**. No `any` except true external boundaries.
- **Named exports** everywhere except page components (default export) and `ProtectedRoute`.
- **Controllers** are thin (validate + delegate, throw `ApiError`); **services** own logic + DB.
- All error responses are `{ error: string }` — produced by the global handler (ApiError → its status, Multer → 413/400, else 500).
- Backend: validate ids with `assertObjectId`; enforce membership with `isRoomMember`; map users with `toPublicUser` + `PUBLIC_USER_FIELDS`.
- Frontend: style with **design tokens**, icons via **lucide-react**, data via **hooks** (never fetch in a page/component body), errors via `getApiErrorMessage`, icon-only buttons via `IconButton` (accessible name required).
- File uploads use Multer **memoryStorage** → Cloudinary `upload_stream`.

## What Does NOT Exist (don't look for it)

- `server/app.ts` — deleted (everything is wired in `server.ts`).
- `modules/chats/`, `modules/messages/`, `accounts/`, `utils/jwt.ts`, `config/passport.ts` — gone.
- `web/src/features/chats/`, `features/auth/Login.tsx`, `features/auth/auth.api.ts`, `web/src/utils/index.ts`, `App.css` — deleted dead code.
- `web/src/features/auth/AuthContext.tsx`, `useAuthInit.ts`, `context/SocketContext.tsx`, `hooks/useChat.ts` — replaced (see Frontend Architecture).
- **MUI / Emotion** — uninstalled; the app is Tailwind-only.
- **localStorage token** (`"accessToken"`) — removed; auth is cookie-only.
