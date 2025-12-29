# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source files (exclude .env to avoid conflicts)
COPY package.json package-lock.json* tsconfig.json ./
COPY public ./public
COPY src ./src

# Copy and use .env.production as .env for build
COPY .env.production .env

# Set environment variables for build
ENV NODE_ENV=production
ENV PUBLIC_URL=/
ENV REACT_APP_API_URL=/api

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
