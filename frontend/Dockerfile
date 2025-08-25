# Frontend Dockerfile: build with Node, serve with Nginx
FROM node:20-alpine AS build
WORKDIR /app

# Pass Vite env at build time
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_YWS_URL
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
ENV VITE_YWS_URL=${VITE_YWS_URL}

# Dependencies
COPY package*.json ./
RUN if [ -f package-lock.json ] || [ -f npm-shrinkwrap.json ]; then \
      npm ci || npm install; \
    else \
      npm install; \
    fi

# Sources
COPY . .

# Build
RUN npm run build

# Runtime image
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
