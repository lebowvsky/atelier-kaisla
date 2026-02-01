# Dockerfile multi-stage pour Backend NestJS

# Stage 1: Development
FROM node:20-alpine AS development
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm install

# Copier le code source
COPY . .

# Exposer le port de développement
EXPOSE 4000

# Commande de développement avec hot reload
CMD ["npm", "run", "start:dev"]

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm ci

# Copier le code source
COPY . .

# Build l'application
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS production
WORKDIR /app

# Installer seulement les dépendances de production
COPY package*.json ./
RUN npm ci --omit=dev

# Copier les fichiers buildés depuis le builder
COPY --from=builder /app/dist ./dist

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Changer la propriété des fichiers
RUN chown -R nestjs:nodejs /app

# Utiliser l'utilisateur non-root
USER nestjs

# Exposer le port
EXPOSE 4000

# Variables d'environnement
ENV NODE_ENV=production

# Commande de production
CMD ["node", "dist/main.js"]
