-- Script d'initialisation de la base de données PostgreSQL
-- Ce script est exécuté automatiquement au premier démarrage du conteneur

-- Créer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vous pouvez ajouter ici vos tables, données initiales, etc.
-- Exemple :
-- CREATE TABLE IF NOT EXISTS users (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   email VARCHAR(255) NOT NULL UNIQUE,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
