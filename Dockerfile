# Stage 1: Build
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

# RUN npm ci
RUN npm ci


# Stage 2: builder
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

RUN npm ci --omit=dev && npm cache clean --force;


# stage 2: Production (just use dist and prod deps)
FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/node_modules ./dist/node_modules

USER node

CMD ["node", "dist/main.js"]