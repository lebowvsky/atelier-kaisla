# Dockerfile multi-stage pour Frontend Nuxt 4

# Stage 1: Development
FROM node:20-alpine AS development
WORKDIR /app

# Installer les dépendances nécessaires pour les modules natifs (sass-embedded)
# sass-embedded nécessite des outils de build natifs
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (y compris devDependencies)
RUN npm install

# Copier le code source
COPY . .

# Exposer le port de développement
EXPOSE 3000

# Commande de développement avec hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Installer les dépendances nécessaires pour les modules natifs (sass-embedded)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (npm ci installe aussi devDependencies par défaut)
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
EXPOSE 3000

# Variables d'environnement
ENV NODE_ENV=production \
    NUXT_HOST=0.0.0.0 \
    NUXT_PORT=3000

# Commande de production
CMD ["node", ".output/server/index.mjs"]
