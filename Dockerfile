# Use lightweight Node.js image optimized for ARM64 (Raspberry Pi 5)
FROM --platform=linux/arm64 node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build the application
COPY . .
RUN npm run build

# Install serve globally and curl for health checks
RUN npm install -g serve && apk add --no-cache curl

# Expose port 3000 (serves the built React app)
EXPOSE 3000

# Health check for container monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Serve the built application using serve
CMD ["serve", "-s", "dist", "-l", "3000"]
