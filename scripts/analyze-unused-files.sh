#!/bin/bash

# Script d'analyse des fichiers non utilisés
echo "🔍 Analyse des fichiers potentiellement inutiles..."
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Compteurs
UNUSED_FILES=0
DUPLICATE_FILES=0
LARGE_FILES=0
OLD_FILES=0

echo "📊 ANALYSE GÉNÉRALE"
echo "==================="

# Compter les fichiers par type
echo "Fichiers TypeScript: $(find src -name "*.ts" | wc -l)"
echo "Fichiers React: $(find src -name "*.tsx" | wc -l)"
echo "Fichiers CSS: $(find src -name "*.css" | wc -l)"
echo "Fichiers JSON: $(find src -name "*.json" | wc -l)"
echo ""

echo "🔍 1. FICHIERS VOLUMINEUX (>1000 lignes)"
echo "=========================================="
find src -name "*.ts" -o -name "*.tsx" | while read file; do
    lines=$(wc -l < "$file" 2>/dev/null || echo 0)
    if [ "$lines" -gt 1000 ]; then
        echo -e "${YELLOW}⚠️  $file: $lines lignes${NC}"
        LARGE_FILES=$((LARGE_FILES + 1))
    fi
done

echo ""
echo "🔍 2. FICHIERS POTENTIELLEMENT NON UTILISÉS"
echo "============================================"

# Rechercher les fichiers qui ne sont pas importés
find src -name "*.ts" -name "*.tsx" | while read file; do
    filename=$(basename "$file" .ts)
    filename=$(basename "$filename" .tsx)
    
    # Ignorer certains fichiers système
    if [[ "$file" == *"App.tsx"* ]] || [[ "$file" == *"main.tsx"* ]] || [[ "$file" == *"index."* ]]; then
        continue
    fi
    
    # Chercher des imports de ce fichier
    imports_count=$(grep -r "import.*$filename" src/ 2>/dev/null | grep -v "$file" | wc -l)
    
    if [ "$imports_count" -eq 0 ]; then
        echo -e "${RED}❌ Potentiellement non utilisé: $file${NC}"
        UNUSED_FILES=$((UNUSED_FILES + 1))
    fi
done

echo ""
echo "🔍 3. FICHIERS DUPLIQUÉS OU SIMILAIRES"
echo "======================================"

# Rechercher des noms de fichiers similaires
find src -name "*.ts" -o -name "*.tsx" | sed 's/.*\///' | sort | uniq -d | while read duplicate; do
    echo -e "${YELLOW}🔄 Nom dupliqué: $duplicate${NC}"
    find src -name "$duplicate" -type f
    echo ""
    DUPLICATE_FILES=$((DUPLICATE_FILES + 1))
done

echo ""
echo "🔍 4. FICHIERS AVEC PATTERNS OBSOLÈTES"
echo "======================================"

# Rechercher des patterns obsolètes
echo "Fichiers avec 'any' TypeScript:"
grep -r ":\s*any" src/ --include="*.ts" --include="*.tsx" | cut -d: -f1 | sort | uniq | while read file; do
    count=$(grep -c ":\s*any" "$file" 2>/dev/null || echo 0)
    if [ "$count" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $file: $count occurrences de 'any'${NC}"
    fi
done

echo ""
echo "Fichiers avec console.log restants:"
grep -r "console\.log" src/ --include="*.ts" --include="*.tsx" | cut -d: -f1 | sort | uniq | while read file; do
    count=$(grep -c "console\.log" "$file" 2>/dev/null || echo 0)
    if [ "$count" -gt 0 ]; then
        echo -e "${RED}🐛 $file: $count console.log restants${NC}"
    fi
done

echo ""
echo "🔍 5. FICHIERS CSS NON UTILISÉS"
echo "==============================="

find src -name "*.css" | while read cssfile; do
    filename=$(basename "$cssfile" .css)
    
    # Chercher des imports de ce fichier CSS
    imports_count=$(grep -r "import.*$filename" src/ 2>/dev/null | wc -l)
    
    if [ "$imports_count" -eq 0 ]; then
        echo -e "${RED}❌ CSS non utilisé: $cssfile${NC}"
    fi
done

echo ""
echo "🔍 6. FICHIERS DE CONFIGURATION OBSOLÈTES"
echo "=========================================="

# Vérifier des fichiers de config potentiellement obsolètes
config_files=(
    ".babelrc"
    "webpack.config.js"
    "rollup.config.js"
    "parcel.config.js"
    "jest.config.js"
    ".eslintrc.js"
    ".eslintrc.json"
    "tsconfig.old.json"
)

for config in "${config_files[@]}"; do
    if [ -f "$config" ]; then
        echo -e "${YELLOW}⚠️  Fichier de config potentiellement obsolète: $config${NC}"
    fi
done

echo ""
echo "🧹 7. RECOMMANDATIONS DE NETTOYAGE"
echo "=================================="

echo -e "${BLUE}📋 Actions recommandées:${NC}"
echo ""

echo "1. 🗑️  SUPPRESSION SÉCURISÉE:"
echo "   - Sauvegarder le projet avant suppression"
echo "   - Tester après chaque suppression"
echo "   - Utiliser git pour tracer les changements"
echo ""

echo "2. 🔄 REFACTORISATION:"
echo "   - Diviser les gros fichiers (>1000 lignes)"
echo "   - Éliminer les types 'any' TypeScript"
echo "   - Supprimer les console.log restants"
echo ""

echo "3. 📦 OPTIMISATION:"
echo "   - Regrouper les fichiers similaires"
echo "   - Créer des index.ts pour les exports"
echo "   - Utiliser tree shaking pour le build"
echo ""

echo "4. 🛡️  SÉCURITÉ:"
echo "   - Supprimer les fichiers de test en production"
echo "   - Nettoyer les configurations obsolètes"
echo "   - Vérifier les dépendances inutiles"
echo ""

echo -e "${GREEN}✅ Analyse terminée!${NC}"
echo ""
echo "💡 Conseil: Commencez par les fichiers volumineux et les console.log restants."
echo "⚠️  Attention: Toujours tester après suppression d'un fichier!"