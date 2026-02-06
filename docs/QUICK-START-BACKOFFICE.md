# Quick Start - Backoffice avec API URL Corrigée

## Problème Résolu ✅

Le backoffice essayait d'utiliser `http://backend:4000/api` depuis le navigateur en développement, ce qui causait des erreurs CORS.

**Solution** : Le code détecte maintenant automatiquement si on est dans le navigateur ou en SSR, et utilise l'URL correcte.

## Test Rapide

### 1. Démarrer l'environnement

```bash
cd /Users/bricelegallo/dev/side-projects/atelier-kaisla
make dev-up-d
```

### 2. Ouvrir le backoffice

```
http://localhost:3001
```

### 3. Se connecter

- **Username** : `admin`
- **Password** : `admin123`

### 4. Vérifier dans la console du navigateur

Vous devriez voir :

```
[useAuth] Logging in to: http://localhost:4000/api/auth/login
[useAuth] Context: { client: true, env: 'development', url: 'http://localhost:4000/api' }
✓ Login successful
```

✅ **URL correcte** : `http://localhost:4000/api` (pas `http://backend:4000/api`)

## Comment Ça Marche

### En Développement

**Dans le navigateur** :
- URL utilisée : `http://localhost:4000/api`
- Raison : Le navigateur ne peut pas résoudre `backend` (hostname Docker)

**En SSR (serveur Nuxt dans Docker)** :
- URL utilisée : `http://backend:4000/api`
- Raison : Le container Nuxt peut accéder au container backend via le réseau Docker

### En Production

**Partout** (navigateur et SSR) :
- URL utilisée : `https://api.lebowvsky.com`
- Raison : URL publique accessible par tous

## Variables d'Environnement

### Fichier `.env` (déjà configuré)

```bash
# Pour SSR dans Docker
NUXT_PUBLIC_API_URL=http://backend:4000/api
```

### Fichier `.env.prod` (pour production)

```bash
# Pour SSR et client-side
NUXT_PUBLIC_API_URL=https://api.lebowvsky.com
```

## Dépannage

### Erreur CORS Persistante

**Symptôme** :
```
Access to fetch at 'http://backend:4000/api/auth/login' has been blocked by CORS
```

**Solution** :
1. Vider le cache du navigateur : `Ctrl+Shift+R` (ou `Cmd+Shift+R` sur Mac)
2. Reconstruire le backoffice :
   ```bash
   make dev-down
   make dev-rebuild
   make dev-up-d
   ```
3. Vérifier les logs dans la console

### URL Incorrecte dans la Console

**Symptôme** : La console affiche `http://backend:4000/api`

**Solution** :
1. S'assurer que le code est à jour :
   ```bash
   cd apps/backoffice
   git pull
   ```
2. Vérifier que `useAuth.ts` et `useProducts.ts` ont la nouvelle logique
3. Redémarrer le container :
   ```bash
   make dev-down
   make dev-up-d
   ```

### Backend Non Accessible

**Symptôme** : Timeout ou connection refused

**Solution** :
1. Vérifier que le backend est démarré :
   ```bash
   make dev-logs-backend
   ```
2. Tester l'accès au backend :
   ```bash
   curl http://localhost:4000/api/health
   ```
3. Si erreur, redémarrer tout :
   ```bash
   make clean-dev
   make init
   ```

## Commandes Utiles

```bash
# Démarrer en arrière-plan
make dev-up-d

# Voir les logs
make dev-logs-backoffice
make dev-logs-backend

# Reconstruire après modification
make dev-rebuild

# Nettoyer complètement
make clean-dev

# Réinitialiser
make init
```

## Logs de Debug

Les logs apparaissent dans la console du navigateur pour chaque appel API :

```javascript
[useAuth] Logging in to: http://localhost:4000/api/auth/login
[useAuth] Context: {
  client: true,
  env: 'development',
  url: 'http://localhost:4000/api'
}

[useProducts] Fetching from: http://localhost:4000/api/products
[useProducts] Context: {
  client: true,
  env: 'development',
  url: 'http://localhost:4000/api'
}
```

Ces logs vous permettent de vérifier que l'URL correcte est utilisée.

## Fichiers Modifiés

Les fichiers suivants ont été mis à jour :

1. `/apps/backoffice/app/composables/useAuth.ts`
   - Fonction `getApiUrl()` intelligente
   - Logs de debug

2. `/apps/backoffice/app/composables/useProducts.ts`
   - Fonction `getApiUrl()` intelligente
   - Logs de debug dans toutes les méthodes

3. `/.env`
   - Ajout de `NUXT_PUBLIC_API_URL=http://backend:4000/api`

## Documentation Complète

Pour plus de détails, consultez :

- `/BACKOFFICE-API-URL-FIX.md` - Explication détaillée du problème et de la solution
- `/BACKOFFICE-API-URL-COMPLETE.md` - Récapitulatif complet des modifications
- `/apps/backoffice/README.md` - Documentation du backoffice

## Test Automatisé

Un script de test est disponible :

```bash
./test-backoffice-api-url.sh
```

Il vérifie :
- Configuration de `.env`
- Présence du code corrigé dans les composables
- Disponibilité du backend
- Configuration Nuxt

## Support

Si vous rencontrez des problèmes :

1. Consulter la documentation complète
2. Vérifier les logs : `make dev-logs-backoffice`
3. Nettoyer et réinitialiser : `make clean-dev && make init`

---

**Date** : 2026-02-06
**Status** : ✅ Testé et fonctionnel
