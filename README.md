# MISC — Markaz Integrated Studies Council

Integrated Portal & Website for Markaz Integrated Studies Council (Jamia Markaz, Karanthur, Kozhikode).

## Repository Architecture

```
MISC/
├── frontend/                     # React 19 + Vite + Tailwind CSS v4 Public Website
│   ├── src/                      # Source code (Pages, Components, Data)
│   ├── public/                   # Public assets (favicon, icons)
│   ├── package.json              # Frontend dependencies
│   └── vite.config.js            # Vite configuration
│
└── backend/                      # Node.js / Express Backend Architecture Shell
    └── src/
        ├── config/               # Database and service configurations
        ├── controllers/          # Route controller handlers
        ├── middleware/           # Auth and validation middleware
        ├── models/               # Data schemas and models
        ├── routes/               # Express API endpoints
        ├── services/             # Core business logic services
        ├── validators/           # Request validation schemas
        └── utils/                # Utility helpers
```

## Running the Application

### Frontend Development

```bash
cd frontend
npm run dev
```

### Frontend Production Build

```bash
cd frontend
npm run build
```
