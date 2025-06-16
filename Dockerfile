# Multi-stage Docker build for Geo Pin Quest
# Stage 1: Builder - Install dependencies and build the app
FROM --platform=linux/arm64 node:20-alpine AS builder

# Set working directory
RUN mkdir -p /app
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies (cached if package.json hasn't changed)
RUN npm ci --no-audit --no-fund

# Copy source code
COPY . .

# Build with placeholder API key
ENV VITE_GOOGLE_MAPS_API_KEY=RUNTIME_REPLACEMENT_PLACEHOLDER
RUN npm run build

# Stage 2: Production - Minimal runtime image
FROM --platform=linux/arm64 node:20-alpine AS production

# Set working directory
WORKDIR /app

# Install only runtime dependencies
RUN npm install -g serve && apk add --no-cache curl

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create startup script for runtime API key injection
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'if [ -n "$VITE_GOOGLE_MAPS_API_KEY" ]; then' >> /app/start.sh && \
    echo '  echo "Injecting API key at runtime..."' >> /app/start.sh && \
    echo '  find /app/dist -name "*.js" -exec sed -i "s/RUNTIME_REPLACEMENT_PLACEHOLDER/$VITE_GOOGLE_MAPS_API_KEY/g" {} \;' >> /app/start.sh && \
    echo 'else' >> /app/start.sh && \
    echo '  echo "Warning: VITE_GOOGLE_MAPS_API_KEY not set"' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo 'serve -s dist -l 3000' >> /app/start.sh && \
    chmod +x /app/start.sh

# Expose port 3000
EXPOSE 3000

# Health check for container monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Use startup script that injects API key at runtime
CMD ["/app/start.sh"]
