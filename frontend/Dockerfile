# 🍳 KitchenCraft Frontend Dockerfile
# Multi-stage build: React build + Nginx production server

# Stage 1: Build React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci --silent

# Copy source code
COPY . .

# Build the React application (skip TypeScript check for Docker)
RUN npm run build:docker

# Stage 2: Nginx production server
FROM nginx:1.26-alpine

# Install curl for health checks
RUN apk --no-cache add curl

# Remove default Nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy built React app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user for security
RUN addgroup -S kitchencraft && adduser -S -G kitchencraft kitchencraft

# Change ownership of Nginx directories
RUN chown -R kitchencraft:kitchencraft /var/cache/nginx \
    && chown -R kitchencraft:kitchencraft /var/log/nginx \
    && chown -R kitchencraft:kitchencraft /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown -R kitchencraft:kitchencraft /var/run/nginx.pid \
    && chown -R kitchencraft:kitchencraft /usr/share/nginx/html

# Switch to non-root user
USER kitchencraft

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]