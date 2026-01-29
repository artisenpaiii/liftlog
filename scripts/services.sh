#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    docker-compose -f "$ROOT_DIR/docker-compose.yml" down 2>/dev/null
    echo -e "${GREEN}All services stopped.${NC}"
    # Kill the tmux session
    tmux kill-session -t liftlog 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Docker services
echo -e "${CYAN}[docker]${NC} Starting PostgreSQL and Redis..."
docker-compose -f "$ROOT_DIR/docker-compose.yml" up -d postgres redis 2>/dev/null

# Wait for PostgreSQL
echo -e "${CYAN}[docker]${NC} Waiting for PostgreSQL..."
until docker exec liftlog-postgres pg_isready -U liftlog -d liftlog_db &>/dev/null; do
    sleep 1
done
echo -e "${GREEN}[docker]${NC} PostgreSQL ready"

# Wait for Redis
echo -e "${CYAN}[docker]${NC} Waiting for Redis..."
until docker exec liftlog-redis redis-cli ping &>/dev/null; do
    sleep 1
done
echo -e "${GREEN}[docker]${NC} Redis ready"

# Generate Prisma client
echo -e "${BLUE}[prisma]${NC} Generating client..."
cd "$ROOT_DIR/backend"
npx prisma generate &>/dev/null
echo -e "${GREEN}[prisma]${NC} Client ready"

echo -e "${CYAN}─────────────────────────────────────────────────────────────────${NC}"
echo -e "${YELLOW}Starting servers... Logs below:${NC}"
echo -e "${CYAN}─────────────────────────────────────────────────────────────────${NC}"

# Create named pipes for log merging
PIPE_DIR=$(mktemp -d)
BACKEND_PIPE="$PIPE_DIR/backend"
FRONTEND_PIPE="$PIPE_DIR/frontend"
mkfifo "$BACKEND_PIPE" "$FRONTEND_PIPE"

# Start backend
cd "$ROOT_DIR/backend"
npm run dev > "$BACKEND_PIPE" 2>&1 &
BACKEND_PID=$!

# Start frontend
cd "$ROOT_DIR/frontend"
npm run dev > "$FRONTEND_PIPE" 2>&1 &
FRONTEND_PID=$!

# Read from pipes and prefix output
(
    while IFS= read -r line; do
        echo -e "${BLUE}[api]${NC} $line"
    done < "$BACKEND_PIPE"
) &

(
    while IFS= read -r line; do
        echo -e "${GREEN}[web]${NC} $line"
    done < "$FRONTEND_PIPE"
) &

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID

# Cleanup pipes
rm -rf "$PIPE_DIR"
