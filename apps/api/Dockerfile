# Set bun image version
ARG BUN_VERSION=1.1.8

# Use node 20 buster as base image
FROM node:20-buster AS base

# Install bash for base and clean cache for smaller image
RUN apt-get update && apt-get install -y && apt-get clean bash

# Install turbo for base
RUN npm install -g turbo@latest

# Install Bun for base
RUN curl -fsSL https://bun.sh/install | bash
RUN mv /root/.bun/bin/bun /usr/local/bin/
# Ensure Bun environment
ENV PATH="/usr/local/bin:$PATH"
# Check Bun installation
RUN bun -v

# Set working directory for base
WORKDIR /app

# Builder stage to compile the application
FROM base AS builder
COPY . .

# Prune and prepare the application
RUN turbo prune api --docker

# Installer stage to set up environment
FROM base AS installer
COPY --from=builder /app/.gitignore ./.gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/out/package-lock.json ./package-lock.json

# Install dependencies
RUN npm install

# Copy build artifacts
COPY --from=builder /app/out/full/ .
COPY --from=builder /app/turbo.json ./turbo.json

# FROM bun image AS runner stage to run the application
FROM oven/bun:${BUN_VERSION}-alpine AS runner

RUN apk update && \
  apk add --no-cache curl bash

# Set working directory
WORKDIR /app

# Set up non-root user
RUN addgroup --system honojs && \
  adduser --system --ingroup honojs honojs --uid 1001

USER honojs

# Copy application from the installer stage
COPY --from=installer /app .

CMD ["bun", "run", "./apps/api/src/main.ts"]
