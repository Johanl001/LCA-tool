# Multi-stage build for production
FROM node:18-alpine as frontend-build

# Build frontend
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm install
RUN npm run build

# Backend stage
FROM node:18-alpine as backend

WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production

COPY server/ ./
COPY --from=frontend-build /app/dist ../dist

EXPOSE 5000

ENV NODE_ENV=production

CMD ["npm", "start"]