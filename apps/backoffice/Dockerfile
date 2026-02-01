# Dockerfile multi-stage pour Backoffice Nuxt 4

# Stage 1: Development
FROM node:20-alpine AS development
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm install

# Copier le code source
COPY . .

# Exposer le port de développement
EXPOSE 3001

# Commande de développement avec hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3001"]

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
COPY --from=builder /app/.output ./.output

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nuxtjs -u 1001

# Changer la propriété des fichiers
RUN chown -R nuxtjs:nodejs /app

# Utiliser l'utilisateur non-root
USER nuxtjs

# Exposer le port
EXPOSE 3001

# Variables d'environnement
ENV NODE_ENV=production \
    NUXT_HOST=0.0.0.0 \
    NUXT_PORT=3001

# Commande de production
CMD ["node", ".output/server/index.mjs"]
