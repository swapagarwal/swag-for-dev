# Development environment
FROM node:10-alpine as base

RUN mkdir -p /swag-for-dev/site
WORKDIR /swag-for-dev/site

# Install vips library (requirement for sharp)
RUN apk add --no-cache vips-dev \
  --repository http://dl-cdn.alpinelinux.org/alpine/edge/testing

COPY site/package.json site/package-lock.json ./

RUN set -x \
  # Install npm & node gyp deps \
  && apk add --no-cache --virtual .gyp git python2 make g++ fftw-dev \
  # Install project dependencies \
  && npm install \
  # Clean npm cache \
  && npm cache clean --force \
  # Delete gyp deps \
  && apk del .gyp

CMD ["npm", "start"]

COPY data.json /swag-for-dev
COPY site ./

### Stop here for development only
### (use '--target base' on build)

# Build environment
FROM base as build
RUN npm run build

# Prod environment
FROM nginx:1-alpine as runtime
COPY --from=build /swag-for-dev/site/dist /usr/share/nginx/html
