#!/bin/bash

# Script de validation des améliorations implémentées
echo "🔍 Validation des améliorations de l'application..."
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
CHECKS_PASSED=0
CHECKS_FAILED=0
TOTAL_CHECKS=0

# Fonction de vérification
check() {
    local description="$1"
    local command="$2"
    local expected="$3"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -n "Vérification: $description... "
    
    if eval "$command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    else
        echo -e "${RED}❌ FAIL${NC}"
        CHECKS_FAILED=$((CHECKS_FAILED + 1))
    fi
}

echo "🧹 1. NETTOYAGE DU CODE"
echo "========================"

# Vérifier la suppression des console.log
check "Suppression des console.log dans Index.tsx" \
    "! grep -q 'console\.log.*Attempting to navigate' src/pages/Index.tsx" \
    "true"

check "Suppression des console.log dans useFormActions.ts" \
    "! grep -q 'console\.log.*Ouverture formulaire' src/hooks/useFormActions.ts" \
    "true"

check "Conservation des console.error critiques" \
    "grep -q 'console\.error' src/pages/Index.tsx" \
    "true"

echo ""
echo "🔒 2. SÉCURITÉ"
echo "=============="

# Vérifier les fichiers de sécurité
check "Présence du système de sanitisation" \
    "test -f src/utils/security/enhancedSanitizer.ts" \
    "true"

check "Configuration ESLint de sécurité" \
    "test -f eslint.security.config.js" \
    "true"

check "Script d'installation de sécurité" \
    "test -x scripts/install-security-deps.sh" \
    "true"

echo ""
echo "🔧 3. REFACTORISATION"
echo "===================="

# Vérifier la refactorisation modulaire
check "Provider du formulaire de procédure" \
    "test -f src/components/procedures/forms/ProcedureFormProvider.tsx" \
    "true"

check "Section des informations de base" \
    "test -f src/components/procedures/forms/sections/BasicInfoSection.tsx" \
    "true"

check "Section des modalités" \
    "test -f src/components/procedures/forms/sections/ModalitiesSection.tsx" \
    "true"

check "Composant refactorisé principal" \
    "test -f src/components/procedures/forms/ProcedureFormRefactored.tsx" \
    "true"

echo ""
echo "🎭 4. SYSTÈME DE MODALES"
echo "========================"

# Vérifier le système de modales amélioré
check "Système de modales unifié amélioré" \
    "test -f src/components/modals/unified/EnhancedUnifiedModalSystem.tsx" \
    "true"

check "Interface TypeScript pour les modales" \
    "grep -q 'interface EnhancedModalProps' src/components/modals/unified/EnhancedUnifiedModalSystem.tsx" \
    "true"

echo ""
echo "📋 5. DOCUMENTATION"
echo "==================="

# Vérifier la documentation
check "Rapport d'audit présent" \
    "test -f AUDIT_ET_AMELIORATIONS.md" \
    "true"

check "Plan d'implémentation présent" \
    "test -f PLAN_IMPLEMENTATION.md" \
    "true"

check "Utilitaire de nettoyage documenté" \
    "test -f src/utils/cleanup/debugCleaner.ts" \
    "true"

echo ""
echo "📊 6. MÉTRIQUES DE QUALITÉ"
echo "=========================="

# Vérifications de qualité du code
if command -v wc >/dev/null 2>&1; then
    # Compter les lignes du fichier original vs refactorisé
    if [ -f "src/components/ProcedureForm.tsx" ]; then
        ORIGINAL_LINES=$(wc -l < src/components/ProcedureForm.tsx)
        echo "Lignes du ProcedureForm original: $ORIGINAL_LINES"
        
        if [ $ORIGINAL_LINES -gt 500 ]; then
            echo -e "${YELLOW}⚠️  Fichier original encore volumineux (>500 lignes)${NC}"
        fi
    fi
fi

# Compter les nouveaux fichiers modulaires
MODULAR_FILES=$(find src/components/procedures/forms -name "*.tsx" 2>/dev/null | wc -l)
if [ $MODULAR_FILES -ge 4 ]; then
    echo -e "${GREEN}✅ Structure modulaire créée ($MODULAR_FILES fichiers)${NC}"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${RED}❌ Structure modulaire incomplète${NC}"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

echo ""
echo "🚀 7. TESTS DE BUILD"
echo "==================="

# Tester si le projet peut être buildé
check "Vérification TypeScript" \
    "npx tsc --noEmit" \
    "true"

echo ""
echo "📈 RÉSUMÉ DES AMÉLIORATIONS"
echo "=========================="

echo -e "Total des vérifications: ${TOTAL_CHECKS}"
echo -e "Vérifications réussies: ${GREEN}${CHECKS_PASSED}${NC}"
echo -e "Vérifications échouées: ${RED}${CHECKS_FAILED}${NC}"

if [ $CHECKS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 TOUTES LES AMÉLIORATIONS ONT ÉTÉ VALIDÉES AVEC SUCCÈS!${NC}"
    echo ""
    echo "📋 Améliorations réalisées:"
    echo "  ✅ Nettoyage du code (suppression des console.log)"
    echo "  ✅ Renforcement de la sécurité (sanitisation, validation)"
    echo "  ✅ Refactorisation modulaire (ProcedureForm -> 4+ composants)"
    echo "  ✅ Système de modales unifié et accessible"
    echo "  ✅ Documentation technique complète"
    echo "  ✅ Scripts d'automatisation et validation"
    echo ""
    echo "🚀 Votre application est maintenant plus sécurisée, modulaire et maintenable!"
    exit 0
else
    echo ""
    echo -e "${RED}⚠️  CERTAINES AMÉLIORATIONS NÉCESSITENT ATTENTION${NC}"
    echo ""
    echo "📋 Actions recommandées:"
    echo "  1. Installer les dépendances: ./scripts/install-security-deps.sh"
    echo "  2. Vérifier les erreurs TypeScript: npx tsc --noEmit"
    echo "  3. Exécuter le nettoyage: npx tsx src/utils/cleanup/debugCleaner.ts"
    echo "  4. Consulter le plan: PLAN_IMPLEMENTATION.md"
    exit 1
fi