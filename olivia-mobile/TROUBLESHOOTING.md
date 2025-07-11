# Guide de Dépannage Expo - Connexion Mobile

## Solutions à essayer dans l'ordre :

### 1. Vérifier le réseau WiFi
- Assurez-vous que votre Mac ET votre téléphone sont connectés au **même réseau WiFi**
- Évitez les réseaux WiFi invités ou publics

### 2. Redémarrer Expo avec une IP spécifique
```bash
# Arrêter le serveur actuel
npx expo stop

# Redémarrer avec votre IP locale
REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.121 npx expo start --lan
```

### 3. Utiliser le QR Code depuis l'interface web
- Ouvrez http://localhost:8081 dans votre navigateur
- Scannez le QR code depuis cette page plutôt que depuis le terminal

### 4. Vérifier les paramètres du firewall Mac
```bash
# Vérifier le statut du firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# Temporairement désactiver le firewall (à réactiver après)
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
```

### 5. Essayer le mode développement
```bash
# Créer un build de développement
npx expo install expo-dev-client
npx expo run:ios --device
```

### 6. Alternative : Expo Go avec tunnel
```bash
# Installer ngrok globalement avec sudo
sudo npm install -g @expo/ngrok

# Puis relancer avec tunnel
npx expo start --tunnel
```

### 7. Vérifier les ports
Le serveur Expo utilise le port 8081. Vérifiez qu'il n'est pas bloqué :
```bash
# Vérifier que le port est ouvert
lsof -i :8081
```

## Commandes rapides de dépannage

```bash
# Reset complet
rm -rf node_modules
npm install
npx expo start --clear --lan

# Ou avec tunnel si le LAN ne fonctionne pas
npx expo start --tunnel