# -------------------------------------------
# STAGE 1: Development Environment (base)
# Note: To build and run just the development stage, use the following commands:
# 
# Build the development environment:
#   docker build --target base -t devswag-dev . \
#
# Run the development environment:
#   docker run -d -p 8000:8000 --name devswag-container devswag-dev \
#
# Attach to the running development container:
#   docker attach devswag-container
#
# In this stage, all project files are copied for development.
# -------------------------------------------
FROM debian:bullseye AS base

# Set ARG to avoid apt-get asking interactive prompts
ARG DEBIAN_FRONTEND=noninteractive

# Update and install necessary dependencies, including libvips
RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends \
        wget \
        ca-certificates \
        build-essential \
        libvips-dev \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /devswag

# Install and setup NVM (Node Version Manager) for managing Node.js versions
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

# Now copy all the other project files, including gulpfile.js
COPY . .

# Set environment variables for the app (modify according to the app’s needs)
ENV GULP_LISTEN_HOST=0.0.0.0
ENV GULP_LISTEN_PORT=8000

# Expose port for development
EXPOSE 8000

# Default command to start the development server
CMD ["/bin/bash", "-c", "source $NVM_DIR/nvm.sh && npm start"]

# -------------------------------------------
# STAGE 2: Build Environment (build)
# Note: To build the production stage, use the following commands:
# 
# Build the production environment:
#   docker build --target build -t devswag-build .
#
# This stage builds the production version of the app by copying all project files 
# and running the necessary build commands.
# -------------------------------------------
FROM base AS build

# Ensure working directory is correct
WORKDIR /devswag

# Copy all project files into the container
COPY . ./

# Build the production release (combine commands to ensure environment is loaded)
RUN ["/bin/bash", "-c", "source $NVM_DIR/nvm.sh && npm run build"]

# -------------------------------------------
# STAGE 3: Production Environment (runtime)
# Note: To build and run the production environment, use the following commands:
#
# Build the production image:
#   docker build -t devswag-prod .
#
# Run the production environment:
#   docker run -d -p 8000:80 devswag-prod
#
# In this stage, only the built assets from the build stage are copied, ensuring 
# a lightweight production image. The Nginx server is used to serve the built app.
# -------------------------------------------
FROM nginx:1-alpine AS runtime

# Copy custom nginx configuration into the container
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production build files from the build stage
COPY --from=build /devswag/dist /usr/share/nginx/html/devswag

# Expose port 80 for serving the production app
EXPOSE 80

# Start nginx server
CMD ["nginx", "-g", "daemon off;"]
