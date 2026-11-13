# Stage 1: Build the React app
FROM node:22-alpine AS build
WORKDIR /app

# Railway passes service variables to the build only when they are declared as ARGs.
# Vite bakes this URL into the bundle at build time, so it must be set BEFORE building.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve the static build
FROM node:22-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist

# Railway injects $PORT; listen on all interfaces.
ENV PORT=3000
CMD ["sh", "-c", "serve -s dist -l tcp://0.0.0.0:${PORT}"]
