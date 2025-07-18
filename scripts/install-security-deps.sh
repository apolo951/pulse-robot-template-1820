#!/bin/bash

# Script d'installation des dépendances de sécurité
echo "🔒 Installation des dépendances de sécurité..."

# Installation de DOMPurify pour la sanitisation HTML
echo "📦 Installation de DOMPurify..."
npm install dompurify
npm install --save-dev @types/dompurify

# Installation d'autres dépendances de sécurité utiles
echo "📦 Installation des dépendances de sécurité supplémentaires..."
npm install helmet
npm install express-rate-limit
npm install cors

# Installation des outils de développement
echo "🛠️ Installation des outils de développement..."
npm install --save-dev eslint-plugin-security
npm install --save-dev @typescript-eslint/eslint-plugin

echo "✅ Installation terminée avec succès!"
echo ""
echo "📚 Dépendances installées:"
echo "  - dompurify: Sanitisation HTML sécurisée"
echo "  - helmet: Protection des headers HTTP"
echo "  - express-rate-limit: Limitation du taux de requêtes"
echo "  - cors: Gestion CORS sécurisée"
echo "  - eslint-plugin-security: Linting de sécurité"
echo ""
echo "🚀 Vous pouvez maintenant utiliser le système de sanitisation amélioré!"