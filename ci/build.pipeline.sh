#!/bin/sh
set -e # Exit immediately on error

# Change current working directory to the script's directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

## Plugin those values in the Pipeline
#export COMPOSE_PROJECT_NAME=
#export API_URL=
#export APP_PORT=
#export APP_PUBLIC_URL=/
export GIT_SHA=$(git rev-parse --short HEAD)
docker-compose -f docker-compose.yml up --build -d
