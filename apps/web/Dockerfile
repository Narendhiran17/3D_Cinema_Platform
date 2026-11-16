# Multi-stage production build for 3D Cinema Web Client
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root monorepo files
COPY package*.json ./
COPY packages/shared-types ./packages/shared-types
COPY apps/web ./apps/web

# Install and build
RUN npm ci
RUN npm --workspace=apps/web run build

# Stage 2: Minimal static production server (Nginx)
FROM nginx:alpine

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
