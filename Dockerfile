# pull official base image
FROM node:26.4-bookworm-slim as reactbuilder

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# Instruct NPM not to emit spinner in output (https://github.com/nodejs/docker-node/issues/225)
ENV NPM_CONFIG_PROGRESS false

# Disable ANSI color codes for compilers and build tools
ENV FORCE_COLOR 0
ENV NO_COLOR 1

# Install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm clean-install
COPY . ./

RUN npm run build

FROM nginx:1.31-alpine
COPY ./nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=reactbuilder /app/dist /usr/share/nginx/html

COPY ./ci/env.sh /docker-entrypoint.d/env.sh
RUN chmod +x /docker-entrypoint.d/env.sh

CMD ["nginx", "-g", "daemon off;"]

#HEALTHCHECK --interval=300s --timeout=4s CMD curl --fail curl -f http://localhost || exit 1
