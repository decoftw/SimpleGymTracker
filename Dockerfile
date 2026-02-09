# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Ensure public directory exists (even if empty)
RUN mkdir -p public

# Build the Next.js app
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built application from builder
COPY --from=builder /app/.next ./.next

# Create public directory (will be empty but that's OK)
RUN mkdir -p public

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
