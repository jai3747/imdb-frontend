FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Remove existing lock file to avoid conflicts
RUN rm -f package-lock.json

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Set environment variables for build
ARG REACT_APP_API_URL=http://imdb-app.jayachandran.xyz/api
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Update browserslist database
RUN npx update-browserslist-db@latest

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
