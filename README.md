# Run Demo

## TL;DR
- Following the instruction of `TL;DR` section in the `stockhub-api-public` repo

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
Run the "Run npm start (Demo)" launch configuration, that calls `npm run start:demo` for you

# Run locally

## JWT Auth Configuration

### Use Firebase Auth
- Create firebase config `src/auth/firebase.ts` (Download from Firebase, see `src/auth/firebase.example.ts` as example)
### Use Custom JWT
- For Vite dev server, set build-time `VITE_DEMO_JWT`

## Configure build-time Envs
Modify `.env.dev` as needed

`VITE_APP_PUBLIC_URL` sets Vite `base` for dev assets at `http://localhost:3000/{VITE_APP_PUBLIC_URL}`

Run the following command:
```
npm run start
```

## Build Docker Image and run its container
Copy `ci/build.example.sh` to `ci/build.sh` and modify accordingly

Execute the script:
```
./ci/build.sh
```

# Outer Reverse Proxy

## Nginx Config
Note that `location` must be ended with forward slash

```
location /sh/uat/app/ {
    access_log /var/log/nginx/sh_app_uat_access.log cuslogformat;
    error_log /var/log/nginx/sh_app_uat_error.log;

    proxy_pass http://127.0.0.1:9101/sh/uat/app/;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```
