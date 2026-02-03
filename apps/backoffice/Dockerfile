# Dockerfile multi-stage pour Backoffice Nuxt 4

# Stage 1: Development
FROM node:20-slim AS development
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm install --force || (rm -rf node_modules package-lock.json && npm install --force)

# Copier le code source
COPY . .

# Exposer le port de développement
EXPOSE 3001

# Commande de développement avec hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3001"]

# Stage 2: Builder
FROM node:20-slim AS builder
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm install --force || (rm -rf node_modules package-lock.json && npm install --force)

# Copier le code source
COPY . .

# Build l'application
RUN npm run build

# Stage 3: Production
FROM node:20-slim AS production
WORKDIR /app

# Installer wget pour les health checks
RUN apt-get update && apt-get install -y --no-install-recommends wget && rm -rf /var/lib/apt/lists/*

# Installer seulement les dépendances de production
COPY package*.json ./
RUN npm install --production --force || (rm -rf node_modules package-lock.json && npm install --production --force)

# Copier les fichiers buildés depuis le builder
COPY --from=builder /app/.output ./.output

# Créer un utilisateur non-root
RUN groupadd -g 1001 nodejs && \
    useradd -m -u 1001 -g nodejs nuxtjs

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
