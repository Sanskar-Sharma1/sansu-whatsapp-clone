# WhatsApp Clone

A production-quality real-time chat application built with the MERN stack and TypeScript.

## Features

- **Real-time messaging** via Socket.io (text, images, videos, PDFs)
- **Authentication** — email/password and Google OAuth
- **Direct Messages** and **Group Chats**
- **File uploads** to Cloudinary (images, videos, PDFs up to 50MB)
- **Online presence** — live user online/offline status
- **Typing indicators** — debounced, per-room
- **Read receipts** — per-message, per-user
- WhatsApp-style dark UI (Tailwind CSS + MUI)

## Project Structure

```
whatsapp/
├── server/                    # Express + TypeScript backend
│   ├── config/                # env, db (Mongoose), cloudinary
│   ├── models/                # Mongoose models: User, Room, Message
│   ├── modules/               # Feature modules (auth, users, rooms, files)
│   │   ├── auth/              # Login, register, Google OAuth
│   │   ├── users/             # User listing and profiles
│   │   ├── rooms/             # DM and group room management
│   │   └── files/             # Cloudinary file upload
│   ├── middleware/            # requireAuth, Multer upload
│   ├── services/              # auth.service, file.service
│   ├── socket/                # Socket.io server, middleware, handlers
│   ├── types/                 # TypeScript interfaces & Express extensions
│   └── server.ts              # Entry point
└── web/                       # React + Vite frontend
    ├── src/
    │   ├── api/               # Typed API clients (auth, users, rooms, files)
    │   ├── components/
    │   │   ├── Chat/          # ChatWindow, MessageList, MessageBubble, MessageInput
    │   │   ├── Sidebar/       # Sidebar, UserList, RoomList, CreateGroupModal
    │   │   └── shared/        # Avatar, OnlineIndicator, FilePreviewBar
    │   ├── context/           # SocketContext
    │   ├── features/auth/     # AuthContext, Login, ProtectedRoute, useAuthInit
    │   ├── hooks/             # useAuth, useSocket, useChat
    │   ├── pages/             # LoginPage, SignupPage, ChatPage
    │   ├── services/          # Axios instance
    │   └── types/             # Shared TypeScript interfaces
    └── ...
```

## Running Locally

### Prerequisites

- Node.js 18+
- MongoDB running locally on port 27017 (or set `MONGO_URI` to a remote instance)
- A Cloudinary account (free tier works)

### 1. Clone and install

```bash
# Install server dependencies
cd server && npm install

# Install web dependencies
cd ../web && npm install
```

### 2. Configure environment variables

**Backend** — copy `server/.env.example` to `server/.env` and fill in:

```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/whatsapp_clone
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=...                  # From Google Cloud Console
GOOGLE_CLIENT_SECRET=...              # From Google Cloud Console
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Frontend** — copy `web/.env.example` to `web/.env`:

```env
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Start the servers

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd web && npm run dev
```

The app will be available at **http://localhost:5173**.

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `PORT` | server | Port the API server listens on (default 4000) |
| `MONGO_URI` | server | MongoDB connection string |
| `JWT_SECRET` | server | Secret key for signing JWTs — use a long random string |
| `JWT_EXPIRES_IN` | server | Token expiry (e.g. `7d`, `24h`) |
| `GOOGLE_CLIENT_ID` | server + web | Google OAuth app client ID |
| `GOOGLE_CLIENT_SECRET` | server | Google OAuth app client secret |
| `CLIENT_URL` | server | Frontend origin for CORS (e.g. `http://localhost:5173`) |
| `CLOUDINARY_CLOUD_NAME` | server | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | server | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | server | Cloudinary API secret |
| `VITE_API_URL` | web | Backend API base URL |
| `VITE_SOCKET_URL` | web | Socket.io server URL (usually same as API URL) |

## Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier includes 25GB storage)
2. Go to **Dashboard** → your credentials are displayed at the top
3. Copy **Cloud Name**, **API Key**, and **API Secret** into `server/.env`
4. Files are uploaded to a folder named `whatsapp_clone` automatically

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → **APIs & Services** → **Credentials**
3. Create an **OAuth 2.0 Client ID** (Web application)
4. Add `http://localhost:5173` to **Authorized JavaScript origins**
5. Copy the Client ID into both `.env` files

## Adding a New Feature

### Backend example — adding a "reaction" to a message

1. Add `reactions` field to `server/models/Message.model.ts`
2. Create a service function in `server/modules/rooms/room.service.ts`
3. Add a socket event handler in `server/socket/socket.handlers.ts`
4. Add the corresponding TypeScript types to `server/types/socket.types.ts`

### Frontend example — displaying reactions

1. Add the event payload type to `web/src/types/index.ts`
2. Register the socket listener in `web/src/hooks/useChat.ts`
3. Render reactions in `web/src/components/Chat/MessageBubble.tsx`

## API Reference

All routes are prefixed with `/api`.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account with email/password |
| POST | `/api/auth/login` | — | Login with email/password |
| POST | `/api/auth/google` | — | Login with Google idToken |
| GET | `/api/auth/me` | ✓ | Get current user |
| POST | `/api/auth/logout` | — | Clear auth cookie |
| GET | `/api/users` | ✓ | List all users except self |
| GET | `/api/users/:id` | ✓ | Get user by ID |
| POST | `/api/rooms/dm` | ✓ | Create or fetch DM room |
| POST | `/api/rooms/group` | ✓ | Create group room |
| GET | `/api/rooms` | ✓ | Get all rooms for current user |
| GET | `/api/rooms/:roomId/messages` | ✓ | Get last 50 messages |
| POST | `/api/files/upload` | ✓ | Upload file to Cloudinary |

## Socket Events

| Direction | Event | Payload |
|---|---|---|
| client → server | `join-room` | `{ roomId }` |
| client → server | `leave-room` | `{ roomId }` |
| client → server | `send-message` | `{ roomId, content, type, fileUrl?, ... }` |
| client → server | `typing` | `{ roomId }` |
| client → server | `stop-typing` | `{ roomId }` |
| client → server | `mark-read` | `{ roomId, messageId }` |
| server → client | `receive-message` | Full populated `IMessage` |
| server → client | `user-typing` | `{ userId, name, roomId }` |
| server → client | `user-stop-typing` | `{ userId, roomId }` |
| server → client | `user-online` | `{ userId }` |
| server → client | `user-offline` | `{ userId, lastSeen }` |
| server → client | `message-read` | `{ messageId, userId }` |
