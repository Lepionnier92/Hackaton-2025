# 📂 Structure du projet et explications détaillées

Voici un récapitulatif de l’architecture du dossier `hackaton/` et le rôle de chaque dossier/fichier principal :

## Racine du projet

- **README.md** : Présentation générale, instructions d’installation et d’utilisation.
- **app.json, babel.config.js, eslint.config.js, metro.config.js, tailwind.config.js, tsconfig.json** : Fichiers de configuration pour Expo, Babel, ESLint, Metro, Tailwind CSS et TypeScript.
- **global.css** : Feuille de style globale (web ou composants partagés).

## Dossier `hackaton/`

### 1. `app/`
Contient la structure des pages/écrans de l’application, organisée par routes (Expo Router) :
- **(tabs)/** : Ecrans principaux accessibles via la barre d’onglets (accueil, missions, profil, etc.).
- **(admin)/** : Ecrans d’administration (gestion utilisateurs, missions, etc.).
- **mission/** : Détail d’une mission (`[id].tsx`).
- **modal.tsx** : Modales globales (popups).
- **_layout.tsx** : Layout général de l’application (navigation, header, etc.).

### 2. `components/`
Composants réutilisables dans toute l’application :
- **external-link.tsx** : Lien externe stylisé.
- **haptic-tab.tsx** : Onglet avec retour haptique.
- **hello-wave.tsx** : Animation d’accueil.
- **parallax-scroll-view.tsx** : ScrollView avec effet parallaxe.
- **themed-text.tsx, themed-view.tsx** : Composants qui s’adaptent au thème (clair/sombre).
- **ui/** : Composants UI spécifiques (collapsible, icônes, etc.).

### 3. `constants/`
- **theme.ts** : Définition des couleurs, thèmes, et constantes visuelles.

### 4. `contexts/`
- **AuthContext.tsx** : Gestion de l’authentification, session utilisateur, et méthodes associées.
- **ThemeContext.tsx** : Gestion du thème (clair/sombre) et accès aux couleurs.

### 5. `hooks/`
Hooks personnalisés pour la gestion du thème, couleurs, etc.

### 6. `services/`
- **database.ts** : Service principal de gestion des données (utilisateurs, missions, amis, messages, etc.) via AsyncStorage. Contient toute la logique métier :
	- CRUD utilisateurs/missions
	- Gestion des amis (demandes, acceptation, recherche par username)
	- Système de messagerie (conversations, messages, suppression, etc.)
	- Attribution automatique des missions
	- Statistiques technicien
	- Réinitialisation de la base

### 7. `assets/`
- **images/** : Images et ressources statiques.

### 8. `scripts/`
- **reset-project.js** : Script pour réinitialiser la base de données locale (utile pour repartir de zéro).

### Plateformes natives
- **android/** : Fichiers de configuration et code natif Android (build.gradle, manifest, ressources, etc.).
- **ios/** : Fichiers de configuration et code natif iOS (Podfile, Info.plist, AppDelegate.swift, etc.).

---

## Fonctionnalités principales de l’application

- **Authentification** : connexion, gestion de session, changement de mot de passe, suppression de compte.
- **Gestion des missions** : création, édition, suppression, attribution automatique selon profil/compétences/localisation.
- **Gestion des utilisateurs** : création, édition, suppression, rôles (admin/technicien).
- **Système d’amis** : ajout par nom d’utilisateur, demandes, acceptation/refus.
- **Messagerie** : chat temps réel entre amis, envoi/suppression de messages, support des emojis, envoi par touche Entrée.
- **Statistiques et fiches de paie** : pour les techniciens.
- **Thème clair/sombre** : personnalisable, persistant.
- **Interface admin** : gestion avancée des utilisateurs et missions.

---

N’hésitez pas à consulter chaque fichier/dossier pour plus de détails ou demander un focus sur une fonctionnalité précise !
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
