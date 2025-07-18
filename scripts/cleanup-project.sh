#!/bin/bash

# Script de nettoyage ciblé pour optimiser le projet
echo "🧹 Nettoyage automatique du projet..."
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Compteurs
CLEANED_FILES=0
REMOVED_DUPLICATES=0
CLEANED_CONSOLE_LOGS=0

echo "🎯 ÉTAPE 1: SUPPRESSION DES FICHIERS DUPLIQUÉS"
echo "=============================================="

# Fonction de sauvegarde
backup_file() {
    local file="$1"
    local backup_dir="backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    cp "$file" "$backup_dir/$(basename "$file")"
    echo "  📦 Sauvegardé: $file"
}

# Supprimer les doublons identifiés (en gardant la version la plus récente/complète)
echo "Suppression des fichiers dupliqués..."

# 1. ApprovalQueueModal - garder la version dans modals/
if [ -f "src/components/ApprovalQueueModal.tsx" ] && [ -f "src/components/modals/ApprovalQueueModal.tsx" ]; then
    backup_file "src/components/ApprovalQueueModal.tsx"
    rm "src/components/ApprovalQueueModal.tsx"
    echo -e "${GREEN}✅ Supprimé: src/components/ApprovalQueueModal.tsx (doublon)${NC}"
    REMOVED_DUPLICATES=$((REMOVED_DUPLICATES + 1))
fi

# 2. ContentRenderer - garder la version dans layout/
if [ -f "src/layout/ContentRenderer.tsx" ] && [ -f "src/components/layout/ContentRenderer.tsx" ]; then
    backup_file "src/layout/ContentRenderer.tsx"
    rm "src/layout/ContentRenderer.tsx"
    echo -e "${GREEN}✅ Supprimé: src/layout/ContentRenderer.tsx (doublon)${NC}"
    REMOVED_DUPLICATES=$((REMOVED_DUPLICATES + 1))
fi

# 3. CSS non utilisé
if [ -f "src/styles/modalAnimations.css" ]; then
    backup_file "src/styles/modalAnimations.css"
    rm "src/styles/modalAnimations.css"
    echo -e "${GREEN}✅ Supprimé: src/styles/modalAnimations.css (non utilisé)${NC}"
    REMOVED_DUPLICATES=$((REMOVED_DUPLICATES + 1))
fi

echo ""
echo "🎯 ÉTAPE 2: NETTOYAGE DES CONSOLE.LOG"
echo "====================================="

# Nettoyer les console.log dans les fichiers prioritaires
priority_files=(
    "src/components/LegalTextFormEnhanced.tsx"
    "src/components/AILegalAssistant.tsx"
    "src/components/ai/AIAdvancedSection.tsx"
    "src/components/common/ActionHandler.tsx"
    "src/components/ProcedureForm.tsx"
    "src/components/AdministrativeProcedures.tsx"
    "src/utils/ocrFormFiller.ts"
)

for file in "${priority_files[@]}"; do
    if [ -f "$file" ]; then
        # Compter les console.log avant nettoyage
        before_count=$(grep -c "console\.log" "$file" 2>/dev/null || echo 0)
        
        if [ "$before_count" -gt 0 ]; then
            # Créer une sauvegarde
            backup_file "$file"
            
            # Supprimer les console.log (garder console.error)
            sed -i '/console\.log/d' "$file"
            
            # Compter après nettoyage
            after_count=$(grep -c "console\.log" "$file" 2>/dev/null || echo 0)
            cleaned=$((before_count - after_count))
            
            echo -e "${GREEN}✅ $file: $cleaned console.log supprimés${NC}"
            CLEANED_CONSOLE_LOGS=$((CLEANED_CONSOLE_LOGS + cleaned))
            CLEANED_FILES=$((CLEANED_FILES + 1))
        fi
    fi
done

echo ""
echo "🎯 ÉTAPE 3: OPTIMISATION DES TYPES TYPESCRIPT"
echo "============================================="

# Nettoyer quelques types 'any' simples dans des fichiers spécifiques
type_files=(
    "src/components/procedures/forms/ProcedureFormProvider.tsx"
    "src/components/modals/types/modalTypes.ts"
)

for file in "${type_files[@]}"; do
    if [ -f "$file" ]; then
        # Remplacer quelques 'any' évidents par des types plus spécifiques
        backup_file "$file"
        
        # Exemples de remplacement sécurisés
        sed -i 's/: any\[\]/: unknown[]/g' "$file"
        sed -i 's/: any;/: unknown;/g' "$file"
        
        echo -e "${YELLOW}⚠️  $file: Types 'any' basiques remplacés par 'unknown'${NC}"
    fi
done

echo ""
echo "🎯 ÉTAPE 4: CRÉATION D'INDEX FILES"
echo "=================================="

# Créer des fichiers index pour optimiser les imports
create_index_file() {
    local dir="$1"
    local index_file="$dir/index.ts"
    
    if [ -d "$dir" ] && [ ! -f "$index_file" ]; then
        echo "// Auto-generated index file" > "$index_file"
        
        # Exporter tous les fichiers .ts et .tsx du dossier
        find "$dir" -maxdepth 1 -name "*.ts" -o -name "*.tsx" | while read file; do
            filename=$(basename "$file" .ts)
            filename=$(basename "$filename" .tsx)
            
            # Ignorer le fichier index lui-même
            if [ "$filename" != "index" ]; then
                echo "export * from './$filename';" >> "$index_file"
            fi
        done
        
        echo -e "${BLUE}📁 Créé: $index_file${NC}"
    fi
}

# Créer des index files dans les dossiers importants
directories=(
    "src/components/modals/types"
    "src/components/procedures/forms/sections"
    "src/utils/security"
    "src/hooks"
)

for dir in "${directories[@]}"; do
    create_index_file "$dir"
done

echo ""
echo "🎯 ÉTAPE 5: VÉRIFICATION PACKAGE.JSON"
echo "====================================="

# Vérifier les dépendances inutilisées (simulation)
echo "Vérification des dépendances inutilisées..."

unused_deps=()

# Vérifier quelques dépendances couramment inutilisées
if ! grep -r "pdf-poppler" src/ >/dev/null 2>&1; then
    unused_deps+=("pdf-poppler")
fi

if ! grep -r "react-window" src/ >/dev/null 2>&1; then
    unused_deps+=("react-window")
fi

if [ ${#unused_deps[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Dépendances potentiellement inutilisées détectées:${NC}"
    for dep in "${unused_deps[@]}"; do
        echo "   - $dep"
    done
    echo "   💡 Vérifiez manuellement avant suppression"
else
    echo -e "${GREEN}✅ Aucune dépendance manifestement inutilisée détectée${NC}"
fi

echo ""
echo "🎯 ÉTAPE 6: CRÉATION DE SCRIPTS D'OPTIMISATION"
echo "=============================================="

# Créer un script package.json pour tree-shaking
if ! grep -q "analyze" package.json; then
    echo "💡 Suggestion: Ajouter des scripts d'analyse au package.json:"
    echo '  "scripts": {'
    echo '    "analyze": "npx vite-bundle-analyzer",'
    echo '    "clean": "./scripts/cleanup-project.sh",'
    echo '    "type-check": "npx tsc --noEmit"'
    echo '  }'
fi

echo ""
echo "📊 RAPPORT DE NETTOYAGE"
echo "======================="
echo -e "Fichiers nettoyés: ${GREEN}$CLEANED_FILES${NC}"
echo -e "Doublons supprimés: ${GREEN}$REMOVED_DUPLICATES${NC}"
echo -e "Console.log supprimés: ${GREEN}$CLEANED_CONSOLE_LOGS${NC}"

echo ""
echo "📋 ACTIONS MANUELLES RECOMMANDÉES"
echo "================================="
echo "1. 🔍 Réviser les fichiers avec beaucoup de types 'any':"
echo "   - src/components/LegalTextFormEnhanced.tsx (10 occurrences)"
echo "   - src/utils/unifiedCacheManager.ts (10 occurrences)"
echo "   - src/components/procedures/forms/ProcedureFormProvider.tsx (15 occurrences)"
echo ""

echo "2. 🗂️  Fusionner les fichiers dupliqués restants:"
echo "   - ComparisonModal.tsx (2 versions)"
echo "   - FilterModal.tsx (2 versions)"
echo "   - PDFViewerModal.tsx (2 versions)"
echo ""

echo "3. 🧪 Tester l'application après nettoyage:"
echo "   - npm run dev"
echo "   - npm run build"
echo "   - npm run type-check"
echo ""

echo "4. 📦 Considérer la suppression de dépendances inutilisées:"
for dep in "${unused_deps[@]}"; do
    echo "   - npm uninstall $dep"
done

echo ""
if [ $CLEANED_FILES -gt 0 ] || [ $REMOVED_DUPLICATES -gt 0 ]; then
    echo -e "${GREEN}🎉 Nettoyage terminé avec succès!${NC}"
    echo -e "${BLUE}💡 Conseil: Testez l'application pour valider les changements.${NC}"
else
    echo -e "${YELLOW}ℹ️  Projet déjà relativement propre.${NC}"
fi

echo ""
echo "⚠️  IMPORTANT: Les fichiers modifiés ont été sauvegardés dans backup_*/"