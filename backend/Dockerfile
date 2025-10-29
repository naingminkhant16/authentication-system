# Stage 1 — Build Stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the NestJS project
RUN npm run build

# Stage 2 — Runtime Stage
FROM node:20-alpine AS runner

WORKDIR /app

COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy the compiled build from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Generate prisma models
RUN npx prisma generate

# Expose backend port
EXPOSE 5000

# Start the application
CMD ["node", "dist/src/main.js"]

