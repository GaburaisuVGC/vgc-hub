# Utilisez une image de base appropriée pour votre application back-end (ici, nous utilisons Node.js 18.9.0 sur Alpine Linux 3.14)
FROM node:18.9.0 AS build

# Définir le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copiez le package.json et package-lock.json (ou yarn.lock) dans le conteneur
COPY package*.json ./

# Installez les dépendances
RUN npm install

# Copiez le reste du code de votre application dans le conteneur
COPY . .

# Étape 2 : Compiler les binaires "bcrypt" pour l'environnement du conteneur
FROM build AS compile-bcrypt

# Installer les dépendances de compilation (le paquet 'build-essential' est utilisé ici pour Debian/Ubuntu)
RUN apt-get update && apt-get install -y build-essential

# Compiler les binaires "bcrypt" pour l'environnement du conteneur
RUN npm rebuild bcrypt --build-from-source

# Étape 3 : Utiliser une image légère pour exécuter l'application
FROM node:18.9.0-slim

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Copier les fichiers de package.json et package-lock.json (ou yarn.lock)
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm install --production

# Copier le reste du code de l'application depuis l'étape de compilation
COPY --from=compile-bcrypt /usr/src/app/node_modules ./node_modules
COPY ./src ./src

# Exposez le port sur lequel votre application back-end écoute (par défaut, c'est le port 8080 pour Cloud Run)
EXPOSE 8080

# Commande pour démarrer votre application back-end
CMD ["npm", "start"]
