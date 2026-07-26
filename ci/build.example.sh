#!/bin/sh
set -e # Exit immediately on error

# Change current working directory to the script's directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

export COMPOSE_PROJECT_NAME=stockhub-uat
export API_URL=http://localhost:4000
export APP_PORT=4000
export APP_PUBLIC_URL=/
export GIT_SHA=$(git rev-parse --short HEAD)
docker-compose -f docker-compose.yml up --build -d
