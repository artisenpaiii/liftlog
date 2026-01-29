# LiftLog

A workout tracking application to log exercises, track progress, and achieve fitness goals.

## Tech Stack

**Frontend**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4

**Backend**
- Fastify 5
- Prisma ORM
- PostgreSQL
- Redis
- JWT Authentication

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm or yarn

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/artisenpaii/liftlog.git
cd liftlog
```

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure environment variables

**Backend** (`backend/.env`):
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://liftlog:liftlog_dev_password@localhost:5432/liftlog_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Start the database

```bash
docker-compose up -d postgres redis
```

### 5. Run database migrations

```bash
cd backend
npx prisma generate
npx prisma db push
```

## Usage

### Development

Start all services with the dev script:

```bash
./run.sh
```

This launches a tmux session with:
- Top pane: Service status dashboard
- Bottom pane: Backend and frontend logs

**Manual start:**

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Access

| Service    | URL                      |
|------------|--------------------------|
| Frontend   | http://localhost:3000    |
| Backend    | http://localhost:3001    |
| pgAdmin    | http://localhost:5050    |

### Tmux Controls

- `Ctrl+B` then `D` - Detach from session
- `Ctrl+B` then `[` - Scroll mode (arrow keys to scroll, `q` to exit)
- Mouse scroll enabled in log pane

## API Endpoints

### Authentication

| Method | Endpoint             | Description          |
|--------|----------------------|----------------------|
| POST   | /api/auth/register   | Register new user    |
| POST   | /api/auth/login      | Login user           |
| GET    | /api/auth/profile    | Get current user     |

## Project Structure

```
liftlog/
├── backend/
│   ├── src/
│   │   ├── config/       # Environment and database config
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Custom middleware
│   │   ├── plugins/      # Fastify plugins (JWT, CORS)
│   │   ├── routes/       # API route definitions
│   │   ├── services/     # Business logic
│   │   ├── types/        # TypeScript types
│   │   └── index.ts      # App entry point
│   └── prisma/
│       └── schema.prisma # Database schema
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js pages and layouts
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities and API client
│   │   └── types/        # TypeScript types
│   └── public/           # Static assets
├── docker-compose.yml    # Docker services
├── run.sh                # Dev startup script
└── README.md
```

## License

MIT
