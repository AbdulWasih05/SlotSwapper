# SlotSwapper - Peer-to-Peer Time Slot Swap Application

A full-stack peer-to-peer calendar app where users swap time slots with others. Mark a slot "swappable," browse the marketplace, request a swap, and accept/reject in real-time.

## Overview & Architecture

**SlotSwapper** is a web application for exchanging calendar time slots between users. User A marks their Tuesday 10–11 AM meeting as swappable; User B marks Wednesday 2–3 PM as swappable. User A requests a swap of their Tuesday slot for User B's Wednesday slot. On acceptance, both calendars update automatically.

**Tech Stack:**
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Zustand (state)
- **Backend**: Node.js 20 + Express + TypeScript + Prisma ORM + MySQL 8
- **Real-time**: Socket.io for instant notifications
- **Auth**: JWT + bcrypt password hashing
- **Deployment**: Docker + Docker Compose (local); If possible Render (backend) + Netlify (frontend) 


**Architecture**: Monolithic repo with separate backend (Node/Express) and frontend (React) services. Both communicate via REST API + WebSocket. MySQL backend stores users, events, and swap requests.


##  Start (10–15 minutes)

### Prerequisites
- Node.js 20+ and npm
- MySQL 8+ (or Docker)
- Git

### Option 1: Docker (Recommended — Fastest)

```bash
git clone https://github.com/AbdulWasih05/SlotSwapper.git
cd slotswapper
docker-compose up

# Wait for "listening on port 5000" and "Vite server running"
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
```

### Option 2: Manual Setup

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with:
# DATABASE_URL="mysql://root:password@localhost:3306/slotswapper"
# JWT_SECRET="your-dev-secret-key-change-in-prod"
# PORT=5000
# use this command to generate a jwt secret key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"


npx prisma migrate dev
npm run dev
# Expect: "Express server running on port 5000"
```

**Frontend** (in new terminal):
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with:
# VITE_API_URL=http://localhost:5000
# VITE_WS_URL=ws://localhost:5000

npm run dev
# Expect: "Vite server running at http://localhost:5173"
```

### First-Time Testing

1. **Register**: Navigate to http://localhost:5173, click "Sign Up", create account with email/password
2. **Create Event**: Go to Calendar, add an event (title, start time, end time)
3. **Mark Swappable**: Toggle event status to SWAPPABLE
4. **Register 2nd User**: Open incognito window or different broswer, register different email
5. **Request Swap**: 2nd user goes to Marketplace, sees 1st user's slot, requests swap with their own slot
6. **Accept Swap**: 1st user goes to Requests, accepts swap
7. **Verify**: Both calendars now show swapped ownership

**Environment Variables Reference:**

| Key | Backend | Frontend | Example |
|-----|---------|----------|---------|
| DATABASE_URL | Required | — | `mysql://root:password@localhost:3306/slotswapper` |
| JWT_SECRET | Required | — | `dev-secret-key-min-32-chars` |
| PORT | Optional | — | `5000` |
| NODE_ENV | Optional | — | `development` |
| VITE_API_URL | — | Required | `http://localhost:5000` |
| VITE_WS_URL | — | Required | `ws://localhost:5000` |

## System Architecture

```
Frontend (React)           Backend (Express)         Database (MySQL)
   :5173                       :5000
    |                            |                        |
    +------- HTTP REST API ------|------- SELECT/INSERT --|
    |                            |                        |
    +------ WebSocket (io) ------|--- Events/Swaps -------|
```

Three main entities:
- **users**: Email, hashed password, profile
- **events**: Title, timestamps, status (BUSY/SWAPPABLE/SWAP_PENDING), userId
- **swap_requests**: Links two events and users; status (PENDING/ACCEPTED/REJECTED)

## API Endpoints

All endpoints require JWT token in `Authorization: Bearer <token>` header (except `/api/auth/register` and `/api/auth/login`).

| Method | Endpoint | Purpose | Body | Response |
|--------|----------|---------|------|----------|
| POST | `/api/auth/register` | Create account | `{email, password, name}` | `{user, token}` |
| POST | `/api/auth/login` | Login | `{email, password}` | `{user, token}` |
| GET | `/api/auth/me` | Get current user | — | `{user}` |
| GET | `/api/events` | List user's events | — | `{events:[]}` |
| POST | `/api/events` | Create event | `{title, startTime, endTime}` | `{event}` |
| PATCH | `/api/events/:id/status` | Toggle BUSY/SWAPPABLE | `{status}` | `{event}` |
| PUT | `/api/events/:id` | Update event | `{title?, startTime?, endTime?}` | `{event}` |
| DELETE | `/api/events/:id` | Delete event | — | `{message}` |
| GET | `/api/swappable-slots` | Browse all swappable slots (others' only) | — | `{slots:[]}` |
| POST | `/api/swap-request` | Create swap request | `{mySlotId, theirSlotId}` | `{swapRequest}` |
| GET | `/api/swap-requests` | List incoming/outgoing swaps | — | `{incoming:[], outgoing:[]}` |
| POST | `/api/swap-response/:requestId` | Accept/reject swap | `{accept: boolean}` | `{swapRequest}` |

**WebSocket Events** (Socket.io):
- `swap:request:received` — Incoming swap request
- `swap:request:accepted` — Your request was accepted
- `swap:request:rejected` — Your request was rejected

**Sample Request/Response:**

```bash
# Register
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
# Response:
{
  "user": { "id": 1, "email": "user@example.com", "name": "John Doe" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}

# Create Event
POST /api/events
Authorization: Bearer <token>
{
  "title": "Team Meeting",
  "startTime": "2025-11-06T10:00:00Z",
  "endTime": "2025-11-06T11:00:00Z"
}
# Response:
{
  "event": {
    "id": 5,
    "userId": 1,
    "title": "Team Meeting",
    "startTime": "2025-11-06T10:00:00Z",
    "endTime": "2025-11-06T11:00:00Z",
    "status": "BUSY"
  }
}

# Swap Request
POST /api/swap-request
Authorization: Bearer <token>
{
  "mySlotId": 5,
  "theirSlotId": 12
}
# Response:
{
  "swapRequest": {
    "id": 3,
    "status": "PENDING",
    "requesterSlotId": 5,
    "recipientSlotId": 12
  }
}
```

## Swap Logic Details 

Below is the required server-side logic for each endpoint:

### GET /api/swappable-slots
**Purpose:** Browse all available slots for swapping from other users.

**Server-side logic:**
- Query all events with `status = SWAPPABLE`
- Exclude events where `userId = currentUserId` (hide own slots)
- Return with owner details (username, email) for UI display
- Sort by start time for user convenience

**Response includes:** Event ID, title, start/end times, owner name, owner ID

### POST /api/swap-request
**Purpose:** Initiate a swap request.

**Server-side validation & logic:**
1. Verify `mySlotId` exists and belongs to current user
2. Verify `theirSlotId` exists and belongs to a different user
3. Verify both slots have `status = SWAPPABLE` (critical!)
4. Create new `SwapRequest` record:
   - Set `status = PENDING`
   - Link `requester_id` = current user
   - Link `recipient_id` = owner of theirSlotId
   - Store `requester_slot_id = mySlotId`
   - Store `recipient_slot_id = theirSlotId`
5. **Update both events atomically:**
   - `mySlotId.status = SWAP_PENDING` (locks User A's slot)
   - `theirSlotId.status = SWAP_PENDING` (locks User B's slot)
6. Emit WebSocket event: `swap:request:received` to recipient

### POST /api/swap-response/:requestId
**Purpose:** Accept or reject an incoming swap request.

**If Rejected (`accept = false`):**
1. Verify current user is the recipient of this swap request
2. Update `SwapRequest.status = REJECTED`
3. Reset both events back to `status = SWAPPABLE` (unlock them)
4. Emit WebSocket event: `swap:request:rejected` to requester

**If Accepted (`accept = true`) — ATOMIC TRANSACTION:**
1. Verify current user is the recipient of this swap request
2. Fetch both events within transaction
3. Verify both events still have `status = SWAP_PENDING` (re-check)
4. **Swap ownership (critical exchange):**
   - Temp store: `ownerA = requester_slot.userId`, `ownerB = recipient_slot.userId`
   - Set: `requester_slot.userId = ownerB` (Event A now owned by User B)
   - Set: `recipient_slot.userId = ownerA` (Event B now owned by User A)
5. Update both events: `status = BUSY` (finalize them)
6. Update `SwapRequest.status = ACCEPTED`
7. Commit transaction (all-or-nothing)
8. Emit WebSocket events:
   - `swap:request:accepted` to requester
   - `slot:updated` to both users

**Ownership Exchange Example:**
```
BEFORE:
  Event A: "Team Meeting" (userId: 1, status: SWAP_PENDING)
  Event B: "Focus Block" (userId: 2, status: SWAP_PENDING)

AFTER:
  Event A: "Team Meeting" (userId: 2, status: BUSY)      ← Now User 2's
  Event B: "Focus Block" (userId: 1, status: BUSY)       ← Now User 1's
```

### Error Handling

Return appropriate HTTP status codes for validation failures:
- `400 Bad Request`: Missing or invalid slot IDs
- `403 Forbidden`: Slot belongs to another user or user not recipient of request
- `404 Not Found`: Slot or swap request doesn't exist
- `409 Conflict`: Slot not in correct status (not SWAPPABLE or not SWAP_PENDING)

### Database Transaction Safety

**Critical requirement:** The swap acceptance (`POST /api/swap-response` with `accept=true`) must execute as a **single atomic database transaction** to prevent:
- Race condition: Both users simultaneously accepting different swaps for same slots
- Partial updates: Status updated but ownership not swapped (corrupted state)
- Concurrent modifications: Another user modifying slots mid-transaction

Use Prisma transaction:
```typescript
await prisma.$transaction(async (tx) => {
  // All swap logic here
  // Either all succeeds or all rolls back
});
```

## Testing & Linting

```bash
# Backend tests (swap logic, auth, marketplace)
cd backend
npm test

# Linting and format check
npm run lint
npm run format

# Frontend tests (if implemented)
cd frontend
npm test

# Linting
npm run lint
```

## Build & Deploy

### Local Docker Build & Run

```bash
docker-compose build          # Build all images
docker-compose up             # Start all services
docker-compose down           # Stop all services
docker-compose logs -f        # View logs
```

### Production Deployment

**Backend (Render):**
1. Connect GitHub repo to Render
2. Set environment: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`
3. Build command: `npm install && npx prisma migrate deploy`
4. Start command: `npm start`

**Frontend (Vercel):**
1. Import GitHub repo to Vercel
2. Set environment: `VITE_API_URL=<your-render-url>`, `VITE_WS_URL=wss://<your-render-url>`
3. Deploy

**Database (PlanetScale):**
- Create MySQL database
- Use connection string in `DATABASE_URL`

## Assumptions & Limitations

**Assumptions:**
- Swap requests are immutable (accept/reject only, no modification)
- Single-timezone system (no TZ conversion between users)
- First-come-first-served for concurrent swap requests
- Recurring events not supported (create individual instances)

**Known Limitations:**
- WebSocket notifications require both users online simultaneously
- Email verification not implemented (instant account creation)
- No calendar sync with Google Calendar or Outlook (future enhancement)
- Swap history visible in DB only; no dedicated UI endpoint
- Single-region deployment (may need CDN/multi-region in production)

**What I'd Improve:**
- Add email verification + password reset
- Implement timezone awareness
- Advanced matching algorithm for swap suggestions
- WebSocket fallback to polling
- Rate limiting on API endpoints

## Project Files & Scripts

```
backend/
  package.json (npm scripts: dev, build, test, lint, start)
  prisma/schema.prisma (database schema)
  src/server.ts (Express entry point)
  
frontend/
  package.json (npm scripts: dev, build, preview, lint)
  vite.config.ts (Vite configuration)
  src/App.tsx (React entry point)

docker-compose.yml (orchestration)
.env.example (backend template)
frontend/.env.example (frontend template)
```

## License & Contact

MIT License. Questions? Open an issue on GitHub.

---

