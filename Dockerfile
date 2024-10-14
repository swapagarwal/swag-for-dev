# STAGE base: Development environment
FROM debian:bullseye AS base

ARG DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends \
        wget \
        ca-certificates \
        build-essential \
        libvips-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /devswag

# Install and setup Node Version Manager
SHELL ["/bin/bash", "--login", "-c"]
RUN wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash

# Set the environment variable for NVM
ENV NVM_DIR="/root/.nvm"
RUN ["/bin/bash", "-c", "source $NVM_DIR/nvm.sh && nvm install 14"]

# Load NVM and install Node.js from .nvmrc
COPY .nvmrc ./
RUN ["/bin/bash", "-c", "source $NVM_DIR/nvm.sh && nvm install $(cat .nvmrc) && nvm alias default $(cat .nvmrc)"]

# Copy package files and install npm dependencies
COPY package.json package-lock.json ./
RUN ["/bin/bash", "-c", "source $NVM_DIR/nvm.sh && npm ci && npm cache clean --force"]

COPY . .

ENV GULP_LISTEN_HOST=0.0.0.0
ENV GULP_LISTEN_PORT=8000

EXPOSE 8000

CMD ["/bin/bash", "-c", "source $NVM_DIR/nvm.sh && npm start"]

################################
# Development image stops here
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

EXPOSE 80 
