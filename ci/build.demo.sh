#!/bin/sh
set -e # Exit immediately on error

# Change current working directory to the script's directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

export COMPOSE_PROJECT_NAME=stockhub-demo
export API_URL=http://localhost:4000/
export APP_PORT=3000
export APP_PUBLIC_URL=/
export GIT_SHA=$(git rev-parse --short HEAD)
export DEMO_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJURVNUX1VJRCIsImVtYWlsIjoiVEVTVF9VSURAbG9jYWxob3N0LmNvbSIsImp0aSI6IjZhNTJkZWY1LThiN2MtNGE0OC04ZjdjLTZhY2E1YmUwMTgzMiIsImlzcyI6IlN0b2NrSHViIiwiYXVkIjoiU3RvY2tIdWJDbGllbnQiLCJleHAiOjIxMDE2NDg3ODB9.ZNQNovddmvnHo3aCcJHiebfiORmpMfLYEWR1WkmdEnU
GENERATE_SOURCEMAP=false

docker-compose -f docker-compose.yml up --build
docker-compose -f docker-compose.yml down --rmi local
