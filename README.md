# ⚡ Cypher AI

Application d'Intelligence Artificielle Grand Public pour **discuter**, **faire des recherches en direct avec sources** et **coder**.

Propulsée par les modèles ouverts d'élite **100% gratuits** d'OpenRouter, avec régulation équitable de consommation (50 requêtes/jour) et garde-fous de sécurité intégrés.

---

## 🚀 Fonctionnalités Clés

### 1. 💬 Mode Discussion (Chat Naturel)
- Modèle : `nvidia/nemotron-3-ultra-550b-a55b:free`
- Conversation fluide, explications claires, vulgarisation scientifique et assistance quotidienne.
- Streaming SSE en temps réel instantané.

### 2. 🔍 Mode Recherche Web (Deep Search & Citations)
- Modèle : `nvidia/nemotron-3.5-lightning:free`
- Interrogation du Web en temps réel, extraction de sources vérifiées et insertion automatique de citations cliquables `[1]`, `[2]`.
- Cartes de sources interactives avec nom de domaine, résumé et lien externe direct.

### 3. 💻 Mode Code Studio (Programmation & Bac à sable)
- Modèle : `cohere/north-mini-code:free` (avec fallback automatique haute disponibilité).
- Blocs de code avec coloration syntaxique, détection du langage, bouton copier en un clic.
- **Bac à sable interactif intégré** : aperçu en direct des composants HTML, CSS et JavaScript dans un iframe sécurisé.

### 4. 🛡️ Limite d'Utilisation Grand Public & Sécurité
- **Quota équitable** : 50 messages gratuits par jour par utilisateur, avec compteur visuel en temps réel et réinitialisation automatique chaque nuit à minuit UTC.
- **Protection contre les attaques par injection** : Détection et blocage des tentatives de détournement de prompt (*prompt injection*, *DAN*, *system prompt extraction*).
- **Protection des clés** : La clé OpenRouter reste strictement sur le backend, inaccessible au client.
- **Optimisé mobile & PWA** : Compatible tactile, support des encoches d'écran (`viewport-fit=cover`), navigation mobile dédiée.

---

## 🛠️ Démarrage Rapide

### 1. Installation des dépendances
```bash
npm install
```

### 2. Lancement en mode Développement (Client + Serveur)
```bash
npm run dev
```
- Frontend : `http://localhost:5173`
- Backend API : `http://localhost:3001`

### 3. Exécution des Tests Automatisés
```bash
npm test
```

### 4. Construction pour la Production
```bash
npm run build
npm start
```
