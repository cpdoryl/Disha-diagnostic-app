# Development Environment Setup Guide

**Quick Setup for DISHA Stage 3 Development**

---

## Prerequisites

- **Node.js:** 18+ LTS
- **npm:** 9+
- **Git:** Latest version
- **Firebase CLI:** For local emulation (optional)

---

## Step 1: Clone & Install

```bash
# Navigate to project folder
cd reverse-simulation-engine

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your Firebase credentials
nano .env  # or use your editor
```

---

## Step 2: Configure Firebase

### Option A: Firebase Emulator (Development)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Start emulator
firebase emulators:start

# In .env, set:
# DATABASE_EMULATOR=true
# FIRESTORE_EMULATOR_HOST=localhost:8080
```

### Option B: Firebase Project (Production)

```bash
# Create Firebase project at console.firebase.google.com
# Get credentials and add to .env:
# FIREBASE_PROJECT_ID=your_project_id
# FIREBASE_API_KEY=your_api_key
# etc.
```

---

## Step 3: Start Development Servers

### Terminal 1: Backend (Port 3001)

```bash
npm run dev:backend

# Expected output:
# ✓ Calculation Engine initialized
# ✓ Server running on http://localhost:3001
```

### Terminal 2: Frontend (Port 3000)

```bash
npm run dev:frontend

# Expected output:
# VITE v4.5.0 ready in ... ms
# ➜  Local:   http://localhost:3000/
```

### Or Run Both Together

```bash
npm run dev

# Starts both in one command (requires concurrently)
```

---

## Step 4: Verify Setup

### Backend Check

```bash
# Test API is running
curl http://localhost:3001/health

# Expected: {"status": "ok"}
```

### Frontend Check

```bash
# Visit browser
# Go to http://localhost:3000
# Should see React app loading
```

---

## Development Commands

```bash
# Development
npm run dev              # Run both frontend & backend
npm run dev:backend     # Backend only
npm run dev:frontend    # Frontend only

# Building
npm run build           # Build both
npm run build:backend   # Build backend only
npm run build:frontend  # Build frontend only

# Testing
npm test               # Run all tests
npm run test:unit      # Unit tests only
npm run test:integration  # Integration tests
npm run test:coverage  # Coverage report
npm run test:watch     # Watch mode

# Code Quality
npm run lint           # Check code style
npm run lint:fix       # Fix code style
npm run format         # Format code
npm run type-check     # TypeScript check

# Utilities
npm start              # Same as dev:backend
```

---

## Folder Structure for Development

```
src/
├── backend/
│   ├── services/          ← Add new services here
│   │   ├── calculationEngine.ts
│   │   ├── goalService.ts
│   │   ├── feasibilityService.ts
│   │   └── ...
│   ├── api/              ← Add routes here
│   ├── models/           ← Add types here
│   └── utils/
│       └── logger.ts     ← Already created
│
└── frontend/
    ├── components/       ← Add components here
    ├── pages/            ← Add pages here
    ├── hooks/            ← Add hooks here
    └── services/         ← Add API clients
```

---

## Common Tasks

### Add a New Backend Service

1. Create file: `src/backend/services/myService.ts`
2. Import logger:
   ```typescript
   import { createLogger } from '../utils/logger';
   const logger = createLogger('MyService');
   ```
3. Implement service
4. Export service
5. Create tests: `tests/unit/services/myService.test.ts`

### Add a New React Component

1. Create folder: `src/frontend/components/MyComponent/`
2. Create file: `src/frontend/components/MyComponent/MyComponent.tsx`
3. Create styles: `src/frontend/components/MyComponent/MyComponent.css`
4. Export from index: `src/frontend/components/index.ts`
5. Create tests: `tests/unit/components/MyComponent.test.tsx`

### Add API Endpoint

1. Create route: `src/backend/api/myRoutes.ts`
2. Import in main app: `src/backend/index.ts`
3. Register route: `app.use('/api/my', myRoutes)`
4. Create tests: `tests/integration/api/myRoutes.test.ts`

---

## Debugging

### VS Code

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Backend",
      "program": "${workspaceFolder}/node_modules/.bin/ts-node",
      "args": ["src/backend/index.ts"],
      "cwd": "${workspaceFolder}"
    }
  ]
}
```

Then: F5 to debug

### Browser DevTools

- **Frontend:** F12 in browser → React DevTools extension recommended
- **Network:** See all API calls
- **Console:** Debug logs from React components

### Logs

```bash
# View logs in real-time
tail -f logs/combined.log

# View errors only
tail -f logs/error.log
```

---

## Troubleshooting

### "Cannot find module 'firebase'"

```bash
npm install firebase firebase-admin
```

### "Port 3001 already in use"

```bash
# Find what's using it
lsof -i :3001

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=3002
```

### "Firestore emulator not found"

```bash
firebase emulators:start --import ./seed-data

# Or disable emulator in .env:
DATABASE_EMULATOR=false
```

### TypeScript errors

```bash
npm run type-check

# Fix types in your code
```

---

## Firebase Emulator Commands

```bash
# Start emulator
firebase emulators:start

# Start with UI
firebase emulators:start --import ./seed-data

# Export data
firebase emulators:export ./backup

# Clear emulator
firebase emulators:start --only firestore --clear
```

---

## Next Steps

1. **Run Setup:** Follow steps 1-4 above
2. **Verify:** Test both backend and frontend are running
3. **Read Architecture:** Review `docs/TECHNICAL_ARCHITECTURE.md`
4. **Pick Task:** Choose a service/component from `DEVELOPMENT_ROADMAP.md`
5. **Start Coding:** Create new files and implement!

---

## Support

**Stuck?** Check these:

1. **Docs:** Read `MASTER_FRAMEWORK.md` for concepts
2. **Architecture:** Review `TECHNICAL_ARCHITECTURE.md` for system design
3. **Existing Code:** Check `src/backend/services/calculationEngine.ts` for patterns
4. **Database:** See `docs/DATABASE_SCHEMA.md` for data models
5. **Slack:** Post in #disha-stage3-dev

---

**Happy coding! 🚀**

---

**Last Updated:** August 27, 2026  
**Status:** Ready for Development
