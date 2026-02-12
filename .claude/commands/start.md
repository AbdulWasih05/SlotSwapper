---
description: Start SlotSwapper implementation with strict no-documentation policy
---

# Start Implementation - SlotSwapper

You are implementing the SlotSwapper project based on the blueprint at `slotswapper-implementation-blueprint.md`.

## Critical Rules:

### 🚫 DOCUMENTATION PROHIBITION:
**NEVER create ANY .md files during implementation:**
- No README.md
- No API documentation files
- No architecture docs
- No changelog files
- Documentation ONLY in code comments

### ✅ Implementation Focus:

**Tech Stack:**
- Backend: Node.js 20.x + Express + TypeScript + Prisma + MySQL
- Frontend: React 18.3 + TypeScript + Vite + Tailwind CSS + Zustand
- Real-time: Socket.io
- DevOps: Docker + docker-compose

**Priority Order:**
1. Setup project structure (backend + frontend)
2. Database schema with Prisma
3. Authentication (JWT)
4. Event CRUD APIs
5. Swap logic APIs (critical!)
6. Frontend auth pages
7. Frontend calendar view
8. Frontend marketplace
9. WebSocket integration (bonus)
10. Docker setup

**Core Features Only:**
- User auth with JWT
- Event management (CRUD)
- Swap marketplace
- Swap request/response
- Real-time notifications (bonus)

### 📁 Files to Create:
- Source code (.ts, .tsx, .js, .jsx)
- Config files (.json, .env.example, .yml)
- Dockerfiles
- Prisma schema
- Test files (if time)

### 🎯 Success Criteria:
- All API endpoints working
- Frontend fully functional
- Swap logic correct (owner exchange)
- Docker setup complete
- Code is clean and commented

**Remember: The code should be self-documenting. User writes README after completion.**
