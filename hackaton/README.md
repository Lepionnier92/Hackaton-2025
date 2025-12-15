# TENEXA Workforce - Application Mobile Techniciens

Application mobile React Native pour les techniciens de la plateforme TENEXA Workforce.

## 🎯 Objectif

TENEXA Workforce est une plateforme de mise en relation entre techniciens et entreprises pour la gestion et l'exécution de missions techniques. Cette application mobile permet aux techniciens de :

- Gérer leur profil et leurs disponibilités
- Recevoir des propositions de missions personnalisées (via algorithme de matching)
- Accepter ou refuser des missions
- Communiquer avec les clients et TENEXA
- Suivre leur activité et leurs revenus

## 🏗️ Architecture

L'application est construite avec :

- **React Native** + **Expo** : Framework de développement mobile
- **NativeWind** : Tailwind CSS pour React Native
- **TypeScript** : Typage statique
- **Expo Router** : Navigation basée sur le système de fichiers

## 📱 Fonctionnalités implémentées

### 1. Tableau de bord
- Vue d'ensemble du profil technicien
- Statistiques d'activité (missions, revenus)
- Nouvelles propositions de missions
- Actions rapides

### 2. Gestion des missions
- **Proposées** : Missions proposées par l'algorithme
- **En cours** : Missions acceptées
- **Terminées** : Historique
- Vue détaillée avec toutes les informations
- Acceptation/Refus de missions

### 3. Messagerie
- Liste des conversations par mission
- Chat en temps réel avec clients/TENEX
- Notifications de nouveaux messages

### 4. Profil technicien
- Informations personnelles
- Compétences et certifications
- Zones d'intervention
- Disponibilités temporelles
- Documents (CV, pièces d'identité, fiches de paie)
- Toggle disponibilité

## 🚀 Installation et lancement

### Installation

```bash
cd hackaton
npm install
```

### Lancement

```bash
# Démarrer le serveur de développement
npx expo start

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
