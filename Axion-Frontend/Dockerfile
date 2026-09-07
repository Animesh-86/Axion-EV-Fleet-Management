# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve stage
FROM nginx:alpine
# Create non-root nginx user
RUN addgroup -S nginxgroup && adduser -S nginxuser -G nginxgroup
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
# nginx master process must run as root to bind port 80,
# but worker processes run as the nginx user by default in alpine.
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
