# Deployment Notes

## Deployment Architecture

The frontend is packaged as a Docker image containing:

- Vite-built React application
- Static assets under `/usr/share/nginx/html`
- Nginx serving the SPA
- Runtime configuration injected through environment variables

The same Docker image is designed to be deployable under different URL prefixes without rebuilding the image.

Example:

```text
Same Docker image
    │
    ├── UAT:        /sh/uat/app/
    └── Production: /sh/prod/app/
```

## Outer Nginx Reverse Proxy

The deployment server has an outer Nginx reverse proxy.

Example:

```nginx
location /sh/uat/app/ {
    proxy_pass http://127.0.0.1:9101/sh/uat/app/;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

The outer Nginx forwards the application subpath to the frontend container.

## Frontend Container / Inner Nginx

The container serves the application with:

```nginx
location /sh/uat/app/ {
    alias /usr/share/nginx/html/;
    index index.html index.htm;
    try_files $uri $uri/ /sh/uat/app/index.html;
}
```

The `alias` maps the public application path to the static files:

```text
/sh/uat/app/assets/foo.js
        ↓
/usr/share/nginx/html/assets/foo.js
```

The `try_files` fallback provides SPA routing:

```text
/sh/uat/app/ticker-overview
        ↓
/sh/uat/app/index.html
```

### Important behavior

The SPA fallback also causes nonexistent static assets to return `index.html`.

For example:

```text
/sh/uat/app/ticker-overview/assets/foo.js
        ↓
asset does not exist
        ↓
/sh/uat/app/index.html
        ↓
Content-Type: text/html
```

This can result in the browser error:

```text
Loading module ... was blocked because of a disallowed MIME type ("text/html")
```

Therefore, a `200` response for a JavaScript URL does not necessarily mean the JavaScript file was served.

## Vite Build-Time Configuration

Vite's `base` configuration is a **build-time setting**:

```js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig((mode) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [react()],
        base: env.VITE_APP_PUBLIC_URL ?? "./",
        server: {
            strictPort: true
        }
    };
});
```

The Docker image must remain independent of the environment-specific deployment path.

Therefore, the deployment URL is not hardcoded into the Docker image.

When the build uses the fallback:

```text
./
```

the generated `index.html` contains:

```html
<base href="./" />
```

and relative resource URLs such as:

```html
<script type="module" crossorigin src="./assets/index-CSH0lqGP.js"></script>
```

## Runtime `APP_PUBLIC_URL`

`APP_PUBLIC_URL` is a **runtime container environment variable**, supplied through Docker Compose.

Example:

```yaml
environment:
  - API_URL
  - APP_PUBLIC_URL=${APP_PUBLIC_URL:-/}
  - DEMO_JWT
```

This allows the same Docker image to be deployed under different URL prefixes.

For example:

```text
UAT:
APP_PUBLIC_URL=/sh/uat/app/

Another deployment:
APP_PUBLIC_URL=/some/other/app/
```

## Runtime `index.html` Modification

Because Vite's `base` is determined at build time but `APP_PUBLIC_URL` is only known at container runtime, `env.sh` modifies the generated `index.html` when the container starts.

The existing placeholder:

```html
<base href="./" />
```

is replaced with the runtime value of `APP_PUBLIC_URL`:

```sh
sed -i "s|<base href=\"\./\" />|<base href=\"${APP_PUBLIC_URL}\" />|" \
    /usr/share/nginx/html/index.html
```

For UAT, the resulting HTML becomes:

```html
<base href="/sh/uat/app/" />
```

The Vite-generated asset URL remains relative:

```html
<script type="module" crossorigin src="./assets/index-CSH0lqGP.js"></script>
```

but the `<base>` element now causes the browser to resolve it against:

```text
/sh/uat/app/
```

Therefore the browser requests:

```text
/sh/uat/app/assets/index-CSH0lqGP.js
```

instead of incorrectly requesting:

```text
/sh/uat/app/ticker-overview/assets/index-CSH0lqGP.js
```

This works correctly even when the user directly refreshes a nested SPA route.

## `env.sh`

The runtime environment configuration and `<base>` replacement are handled by the Nginx Docker entrypoint:

```sh
#!/bin/sh
# Use the environmental variable and inject env-config.js value to user browser

ENV_FILE="/usr/share/nginx/html/env-config.js"

rm -f $ENV_FILE
touch $ENV_FILE

echo "window.__ENV__ = {" >> $ENV_FILE
echo "  API_URL: \"$API_URL\"," >> $ENV_FILE
echo "  DEMO_JWT: \"$DEMO_JWT\"," >> $ENV_FILE
echo "};" >> $ENV_FILE

# Replace the base href in index.html with the runtime APP_PUBLIC_URL
sed -i "s|<base href=\"\./\" />|<base href=\"${APP_PUBLIC_URL}\" />|" \
    /usr/share/nginx/html/index.html
```

The script runs at container startup, before Nginx serves the application.

## Why the Hard-Refresh Error Happened

Before the runtime `<base>` replacement, the deployed `index.html` contained:

```html
<base href="./" />
<script type="module" crossorigin src="./assets/index-CSH0lqGP.js"></script>
```

When the application was loaded directly at:

```text
/sh/uat/app/ticker-overview
```

the browser resolved the relative asset URL to:

```text
/sh/uat/app/ticker-overview/assets/index-CSH0lqGP.js
```

However, the actual asset was:

```text
/usr/share/nginx/html/assets/index-CSH0lqGP.js
```

and was publicly available at:

```text
/sh/uat/app/assets/index-CSH0lqGP.js
```

The incorrect request therefore missed the asset.

Because of the Nginx SPA fallback:

```nginx
try_files $uri $uri/ /sh/uat/app/index.html;
```

the incorrect JavaScript request returned `index.html` instead of a 404.

This produced:

```text
HTTP 200
Content-Type: text/html
```

for a URL ending in `.js`, causing the browser's ES module MIME-type error.

## Diagnostic Verification

The deployed asset was confirmed to work:

```bash
curl -I https://www.example.com/sh/uat/app/assets/index-CSH0lqGP.js
```

Result:

```text
HTTP/2 200
content-type: application/javascript
```

The incorrect nested asset path returned the SPA HTML:

```bash
curl -I https://www.example.com/sh/uat/app/ticker-overview/assets/index-CSH0lqGP.js
```

Result:

```text
HTTP/2 200
content-type: text/html
```

This established that:

1. The JavaScript asset itself was valid and correctly served.
2. The double-Nginx proxy was not the root cause.
3. The browser was requesting the wrong asset URL because of the relative `<base href="./">`.
4. The inner Nginx SPA fallback masked the missing asset by returning `index.html`.
5. Replacing `<base href="./">` with the runtime `APP_PUBLIC_URL` fixed the issue.

## Design Principle

The deployment deliberately separates **build-time artifacts** from **runtime deployment configuration**.

```text
Build time
    │
    ├── React application
    ├── hashed JS/CSS assets
    └── deployment-independent Docker image
             │
             ▼
Runtime
    │
    └── APP_PUBLIC_URL
             │
             ▼
    modify <base href="./">
             │
             ▼
    <base href="/sh/uat/app/">
```

The Docker image remains immutable and reusable across environments. Only the runtime deployment prefix changes.

**Build artifacts are immutable; deployment location is runtime configuration.**