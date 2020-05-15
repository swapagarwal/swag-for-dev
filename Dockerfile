# STAGE base: Development environment
FROM debian:buster AS base

ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
	&& apt-get upgrade -y \
	&& apt-get install -y --no-install-recommends \
		wget \
		ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /devswag

# Install and setup NVM
SHELL ["/bin/bash", "--login", "-c"]
RUN wget -O- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
COPY .nvmrc ./
RUN nvm install && nvm use

COPY package.json package-lock.json ./
RUN set -x \
	# Install npm dependencies
	&& npm ci \
	# Cleanup
	&& npm cache clean --force

ENV GULP_LISTEN_HOST=0.0.0.0
ENV GULP_LISTEN_PORT=8000

CMD ["npm", "start"]

################################
# Developement image stops here
# use '--target base' on build to break here

# STAGE build: Build environment
FROM base AS build

WORKDIR /devswag

COPY . ./

# Build production release
RUN npm run build

# STAGE runtime: Production environment
FROM nginx:1-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build --chown=nginx:nginx \
	/devswag/dist /usr/share/nginx/html/devswag
