# 🚨 Erreurs 500 en Production - Fix Rapide

## Solution en 1 Ligne

Sur votre serveur Dokploy, exécutez:

```bash
./fix-production-500.sh
```

**Durée**: 30 secondes | **Impact**: Résout les erreurs 500

---

## Que fait ce script ?

1. ✅ Crée le répertoire `/app/uploads` manquant
2. ✅ Crée la table `products` dans PostgreSQL
3. ✅ Redémarre le backend
4. ✅ Vérifie que l'API répond

---

## Problèmes Identifiés

### 1. Répertoire Uploads Manquant
Le Dockerfile de production ne créait pas `/app/uploads`, causant une erreur au démarrage de NestJS.

### 2. Table Products Inexistante
En production, TypeORM ne crée pas automatiquement les tables (sécurité).

---

## Après Correction

Vérifiez que tout fonctionne:

```bash
curl https://api.lebowvsky.com/api/health
curl https://api.lebowvsky.com/api/products
```

Résultat attendu:
- Health: `{"status":"ok","timestamp":"..."}`
- Products: `[]` ou liste de produits

---

## Documentation Complète

Pour plus de détails, consultez:

| Fichier | Description |
|---------|-------------|
| **PRODUCTION-DOCS-INDEX.md** | Index de toute la documentation |
| **PRODUCTION-500-SUMMARY.md** | Résumé exécutif complet |
| **QUICK-FIX-PRODUCTION.md** | Guide de correction rapide |
| **PRODUCTION-TROUBLESHOOTING.md** | Guide de diagnostic approfondi |
| **PRODUCTION-FIXES.md** | Détails techniques des corrections |

### Scripts Disponibles

| Script | Usage |
|--------|-------|
| `./fix-production-500.sh` | Applique les corrections automatiquement |
| `./diagnose-production.sh` | Diagnostic complet de l'environnement |

---

## Déploiement Permanent

Les corrections ont été appliquées au code. Pour les déployer de manière permanente:

```bash
# 1. Commit (en local)
git add .
git commit -m "fix(production): resolve 500 errors"
git push

# 2. Sur Dokploy
git pull
docker compose -f docker-compose.prod.yml build --no-cache backend
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

---

## Besoin d'Aide ?

1. **Diagnostic**: `./diagnose-production.sh`
2. **Logs**: `docker logs -f atelier-kaisla-backend-prod`
3. **Documentation**: Consultez `PRODUCTION-DOCS-INDEX.md`

---

**Note**: Le script `fix-production-500.sh` est non-destructif et peut être exécuté plusieurs fois sans risque.
