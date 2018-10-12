# STAGE dev: Development environment
FROM node:10-alpine@sha256:fcd9b3cb2fb21157899bbdb35d1cdf3d6acffcd91ad48c1af5cb62c22d2d05b1 \
  AS base

WORKDIR /swag-for-dev/site

COPY site/package.json site/package-lock.json ./

# Install dev dependencies
RUN apk add --no-cache vips-dev=8.6.3-r0 \
  --repository http://dl-cdn.alpinelinux.org/alpine/edge/testing

RUN set -x \
  # Install gyp dependencies
  && apk add --no-cache --virtual .gypdeps \
  fftw-dev \
  g++ \
  git \
  make \
  python2 \
  # Install npm dependencies
  && npm ci \
  # Cleanup
  && npm cache clean --force \
  && apk del .gypdeps

CMD ["npm", "start"]

################################
# Developement image stops here
# use '--target base' on build to break here

# STAGE build: Build environment
FROM base AS build

COPY data.json /swag-for-dev
COPY site ./

RUN set -x \
  # Install build dependencies
  && apk add --no-cache --virtual .vipsdeps vips-dev=8.6.3-r0 \
  --repository http://dl-cdn.alpinelinux.org/alpine/edge/testing \
  # Build production release
  && npm run build \
  # Cleanup
  && apk del .vipsdeps

# STAGE runtime: Production environment
FROM nginx:1-alpine@sha256:ae5da813f8ad7fa785d7668f0b018ecc8c3a87331527a61d83b3b5e816a0f03c \
  AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build --chown=nginx:nginx \
  /swag-for-dev/site/dist /usr/share/nginx/html/devswag
