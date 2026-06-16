# syntax=docker/dockerfile:1

###############################################################################
# Stage 1: builder — installs ALL deps and compiles TypeScript to JavaScript.
# Everything in this stage (dev dependencies, TS compiler, source files) stays
# behind and is never shipped in the final image.
###############################################################################
FROM node:20-alpine AS builder

WORKDIR /app

# Copy only the manifest files first. This layer is cached and only rebuilt
# when dependencies change — so editing TypeScript does NOT trigger a reinstall.
COPY package*.json ./

# Reproducible install of all deps (including devDeps needed to build).
RUN npm ci

# Now copy the source and build. Changing source invalidates from here on,
# but the expensive `npm ci` layer above is reused from cache.
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build

###############################################################################
# Stage 2: runtime — a clean, minimal image with ONLY production deps and the
# compiled output. No TS compiler, no dev tooling, no source files.
###############################################################################
FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

# Install production dependencies only — smaller node_modules.
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Bring in just the compiled JavaScript from the builder stage.
COPY --from=builder /app/dist ./dist

# Run as the unprivileged user that the node image already provides.
USER node

EXPOSE 4000

CMD ["node", "dist/main"]
