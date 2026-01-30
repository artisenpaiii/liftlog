#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'
DIM='\033[2m'
BOLD='\033[1m'

# Port configuration
BASE_PORT="${1:-3000}"
FRONTEND_PORT=$BASE_PORT
BACKEND_PORT=$((BASE_PORT + 1))

# Check service status
check_postgres() {
    docker exec liftlog-postgres pg_isready -U liftlog -d liftlog_db &>/dev/null
}

check_redis() {
    docker exec liftlog-redis redis-cli ping &>/dev/null
}

check_backend() {
    curl -s http://localhost:$BACKEND_PORT/health &>/dev/null
}

check_frontend() {
    curl -s http://localhost:$FRONTEND_PORT &>/dev/null
}

# Wait for all services
echo -e "${CYAN}Waiting for services to start...${NC}"

# Wait for each service
while ! check_postgres; do sleep 1; done
while ! check_redis; do sleep 1; done
while ! check_backend; do sleep 1; done
while ! check_frontend; do sleep 1; done

# Clear and draw header
clear
echo -e "${MAGENTA}${BOLD}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}${BOLD}║${NC}                    ${MAGENTA}${BOLD}LiftLog Dev Server${NC}                        ${MAGENTA}${BOLD}║${NC}"
echo -e "${MAGENTA}${BOLD}╠════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${MAGENTA}${BOLD}║${NC}  ${GREEN}●${NC} PostgreSQL  ${DIM}localhost:5432${NC}     ${GREEN}●${NC} Redis     ${DIM}localhost:6379${NC}   ${MAGENTA}${BOLD}║${NC}"
printf "${MAGENTA}${BOLD}║${NC}  ${GREEN}●${NC} Backend     ${DIM}localhost:%-5s${NC}    ${GREEN}●${NC} Frontend  ${DIM}localhost:%-5s${NC}  ${MAGENTA}${BOLD}║${NC}\n" "$BACKEND_PORT" "$FRONTEND_PORT"
echo -e "${MAGENTA}${BOLD}╠════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${MAGENTA}${BOLD}║${NC}  ${YELLOW}pgAdmin${NC} ${DIM}http://localhost:5050${NC}   ${YELLOW}Ctrl+B then D${NC} ${DIM}to detach${NC}       ${MAGENTA}${BOLD}║${NC}"
echo -e "${MAGENTA}${BOLD}╚════════════════════════════════════════════════════════════════╝${NC}"

# Keep the pane alive
while true; do sleep 3600; done
