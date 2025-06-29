#!/bin/bash

# Script pour résoudre les problèmes NPM courants
# Utilisation: ./fix-npm-issues.sh

echo "🔧 Résolution des problèmes NPM pour Olivia APP"
echo "================================================"

# Fonction pour afficher les messages en couleur
print_info() {
    echo -e "\033[34mℹ️  $1\033[0m"
}

print_success() {
    echo -e "\033[32m✅ $1\033[0m"
}

print_error() {
    echo -e "\033[31m❌ $1\033[0m"
}

print_warning() {
    echo -e "\033[33m⚠️  $1\033[0m"
}

# Vérifier Node.js version
print_info "Vérification de la version Node.js..."
NODE_VERSION=$(node -v)
echo "Version Node.js détectée: $NODE_VERSION"

if [[ "$NODE_VERSION" < "v20.0.0" ]]; then
    print_warning "Version Node.js < 20.0.0 détectée. Mise à jour recommandée."
    echo "Utilisation: nvm use 20 (si nvm est installé)"
fi

# Nettoyer le cache NPM
print_info "Nettoyage du cache NPM..."
npm cache clean --force
print_success "Cache NPM nettoyé"

# Configuration SSL temporaire pour les problèmes de certificats
print_info "Configuration temporaire pour résoudre les problèmes SSL..."

# Sauvegarder la configuration actuelle
npm config get registry > .npm-config-backup.txt
npm config get strict-ssl >> .npm-config-backup.txt

# Configuration temporaire
npm config set registry http://registry.npmjs.org/
npm config set strict-ssl false

print_warning "Configuration SSL temporairement désactivée"

# Installation des dépendances
echo ""
print_info "Installation des dépendances Frontend..."
cd frontend

# Supprimer node_modules et package-lock.json s'ils existent
if [ -d "node_modules" ]; then
    print_info "Suppression de node_modules existant..."
    rm -rf node_modules
fi

if [ -f "package-lock.json" ]; then
    print_info "Suppression de package-lock.json existant..."
    rm -f package-lock.json
fi

# Installation
npm install

FRONTEND_EXIT_CODE=$?

cd ..

if [ $FRONTEND_EXIT_CODE -eq 0 ]; then
    print_success "Installation Frontend réussie"
else
    print_error "Échec de l'installation Frontend"
fi

# Installation Backend
print_info "Installation des dépendances Backend..."
cd backend

if [ -d "node_modules" ]; then
    print_info "Suppression de node_modules backend existant..."
    rm -rf node_modules
fi

if [ -f "package-lock.json" ]; then
    print_info "Suppression de package-lock.json backend existant..."
    rm -f package-lock.json
fi

npm install

BACKEND_EXIT_CODE=$?

cd ..

if [ $BACKEND_EXIT_CODE -eq 0 ]; then
    print_success "Installation Backend réussie"
else
    print_error "Échec de l'installation Backend"
fi

# Restaurer la configuration SSL
print_info "Restauration de la configuration SSL sécurisée..."
npm config set registry https://registry.npmjs.org/
npm config set strict-ssl true
print_success "Configuration SSL restaurée"

# Résumé
echo ""
echo "📋 RÉSUMÉ DE L'INSTALLATION"
echo "=========================="

if [ $FRONTEND_EXIT_CODE -eq 0 ] && [ $BACKEND_EXIT_CODE -eq 0 ]; then
    print_success "✅ Installation complète réussie!"
    echo ""
    echo "🚀 PROCHAINES ÉTAPES:"
    echo "1. Configurer les variables d'environnement:"
    echo "   cp frontend/.env.example frontend/.env"
    echo "   # Éditer frontend/.env avec vos valeurs"
    echo ""
    echo "2. Créer le fichier backend/.env:"
    echo "   cd backend && touch .env"
    echo "   # Ajouter GEMINI_API_KEY=your-api-key"
    echo ""
    echo "3. Lancer l'application:"
    echo "   Terminal 1: cd backend && npm run dev"
    echo "   Terminal 2: cd frontend && npm run dev"
    echo ""
    echo "4. Ouvrir http://localhost:5173"
else
    print_error "❌ Échec de l'installation"
    echo ""
    echo "🔍 SOLUTIONS ALTERNATIVES:"
    echo "1. Vérifier votre connexion internet"
    echo "2. Essayer avec un autre réseau (hotspot mobile)"
    echo "3. Contacter votre administrateur réseau pour les proxies"
    echo "4. Utiliser yarn au lieu de npm:"
    echo "   npm install -g yarn"
    echo "   cd frontend && yarn install"
    echo "   cd ../backend && yarn install"
fi

# Nettoyer le fichier de sauvegarde
rm -f .npm-config-backup.txt

echo ""
print_info "Script terminé."