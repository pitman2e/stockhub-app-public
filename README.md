# Run Demo

## Commandline
```
cd ci
./build.demo.sh
```

## npm script
```
npm run start:demo
```

## Visual Studio Code
```
Run the "Run npm start (Demo)" Task, that call "npm run start:demo" for you
```

# Run locally

## JWT Auth Configuration

### Use Firebase Auth
- Create firebase config `src/auth/firebase.ts` (Use `src/auth/firebase.example.ts` as example)
### Use Custom JWT
- TODO
- Set Envs `VITE_DEMO_JWT`

# Run locally
## Configure build-time Envs
Modify `.env.dev` as needed

```
VITE_API_URL=http://localhost:4000/
VITE_APP_PUBLIC_URL=
```

Note that env starts with `VITE_` are intended to use locally.

`VITE_APP_PUBLIC_URL` cause Nginx to served the app at `http:\\localhost:3000\{VITE_APP_PUBLIC_URL}`

Run the following command:
```
npm run start
```

## Build Docker Image and run its container
Copy `ci/build.sh.example` to `ci/build.sh` and modify

Example of `ci/build.sh`
```
export COMPOSE_PROJECT_NAME=stockhub-uat
export API_URL=http://localhost:4000
export APP_PORT=4000
export APP_PUBLIC_URL=
export GIT_SHA=$(git rev-parse --short HEAD)
docker-compose -f ./ci/docker-compose.yml up --build -d
```

Execute the script:
```
./ci/build.sh
```

# Reverse Proxy

## Nginx Config
Note that `location` must be ended with forward slash

```
        location /sh/uat/app/ {
            access_log /var/log/nginx/sh_app_uat_access.log cuslogformat;
            error_log /var/log/nginx/sh_app_uat_error.log;

            proxy_pass http://127.0.0.1:9101/sh/uat/app/;
        }
```
