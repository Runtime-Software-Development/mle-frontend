# Use the official Node.js image as the build stage
FROM node:22-alpine AS build

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the frontend app (React)
RUN npm run build

# Use nginx to serve the built files
FROM nginx:alpine AS production

# 1. Create a non-root setup
# Nginx alpine has a default 'nginx' user with UID 101. 
# We need to give this user ownership of the directories nginx uses.
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

# 2. Switch to the non-root user
USER nginx

# 3. Copy built assets
COPY --from=build --chown=nginx:nginx /app/build /usr/share/nginx/html

# 4. Copy a custom config that uses port 8080 (Crucial!)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the new non-privileged port
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]