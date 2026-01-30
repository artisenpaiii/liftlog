#!/bin/bash

# Check if tmux is installed
if ! command -v tmux &> /dev/null; then
    echo "tmux is required but not installed."
    echo "Install it with: sudo apt install tmux"
    exit 1
fi

# Project root directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SESSION_NAME="liftlog"
PORT="${1:-3000}"

# Kill existing session if exists
tmux kill-session -t $SESSION_NAME 2>/dev/null

# Create new tmux session
tmux new-session -d -s $SESSION_NAME -x "$(tput cols)" -y "$(tput lines)"

# Enable mouse mode for scrolling
tmux set-option -t $SESSION_NAME -g mouse on

# Split horizontally (top for status, bottom for logs)
tmux split-window -v -t $SESSION_NAME

# Set pane sizes (top 30%, bottom 70%)
tmux resize-pane -t $SESSION_NAME:0.0 -y 10

# Top pane: Status dashboard
tmux send-keys -t $SESSION_NAME:0.0 "bash ${ROOT_DIR}/scripts/status.sh $PORT" Enter

# Bottom pane: Services and logs
tmux send-keys -t $SESSION_NAME:0.1 "bash ${ROOT_DIR}/scripts/services.sh $PORT" Enter

# Attach to session
tmux attach-session -t $SESSION_NAME
