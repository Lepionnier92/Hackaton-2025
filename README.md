# TENEX Workforce - Projet Hackathon

## 📋 Vue d'ensemble

Ce repository contient l'application mobile pour techniciens de la plateforme TENEX Workforce, développée dans le cadre du hackathon.

## 📱 Application Mobile Techniciens

L'application mobile se trouve dans le dossier `/hackaton`.

### 🚀 Démarrage rapide

```bash
cd hackaton
npm install
npm start
```

Scannez le QR code avec l'application **Expo Go** sur votre téléphone.

### ✨ Fonctionnalités principales

- ✅ **Tableau de bord** avec statistiques et propositions de missions
- ✅ **Gestion des missions** (proposées, en cours, terminées)
- ✅ **Messagerie** pour communiquer avec les clients
- ✅ **Profil technicien** avec compétences et disponibilités

### 🏗️ Technologies

- React Native + Expo SDK 54
- TypeScript
- NativeWind (Tailwind CSS)
- Expo Router

## 📚 Documentation

Pour plus de détails, consultez le [README de l'application](./hackaton/README.md).

---

**Hackathon TENEX Workforce** - Décembre 2025

# TENEX WORKFORCE - SPÉCIFICATIONS COMPLÈTES FINALES

## Application Mobile Techniciens - Guide Complet de A à Z

-----

## 🎯 VISION & IDENTITÉ

### Brand Identity - TENEXA

**Logo** : Typographie moderne “Tenexa” en vert foncé (#1a5336)

- Style : Friendly tech, accessible, professionnel
- Le “T” majuscule avec empattement distinctif
- Police fluide et moderne pour le reste

**Palette de Couleurs (d’après vos croquis)**

- **Primaire** : `#006241` - Vert TENEX (confiance, croissance)
- **Secondaire** : `#2e3932` - Vert foncé (professionnalisme)
- **Accent bleu** : `#d4e9e2` - Bleu clair (notifications, info)
- **Accent orange** : `#d1f3ba` - Vert clair (succès, validation)
- **Branding** : Palette naturelle et technologique

### Philosophie UX

**“Votre 1st step to the innovation”** (d’après votre croquis)

- Simplicité avant tout
- Innovation guidée
- Accessibilité maximale
- Design conversationnel

-----

## 📱 ARCHITECTURE DE NAVIGATION

### Bottom Navigation (5 tabs principaux)

D’après votre wireframe :

```
┌─────────────────────────────────────┐
│ [Logo Tenexa] [🔔] [👤] │
│ │
│ [Zone de contenu principale] │
│ │
│ │
│ ┌───┬───┬───┬───┬───┐ │
│ │🏠 │🎯 │💬 │📊 │⚙️ │ │
│ │Home│Miss│Chat│Act│AI │ │
│ └───┴───┴───┴───┴───┘ │
└─────────────────────────────────────┘
```

**Onglets Bottom Tab** :

1. 🏠 **Home** - Dashboard principal
1. 🎯 **Missions** - Liste propositions/actives
1. 💬 **Chat** - Messagerie
1. 📊 **Activity** - Statistiques/Docs
1. 🤖 **AI Assistant** (Voice Call) - Support intelligent

-----

## 🔐 FLUX D’AUTHENTIFICATION

### Écran d’Accueil (d’après votre croquis)

```
┌─────────────────────────────────────┐
│ │
│ [Logo Tenexa] │
│ │
│ "Your 1st step │
│ to the innovation" │
│ │
│ ┌─────────────────────────────┐ │
│ │ Create an account │ │
│ └─────────────────────────────┘ │
│ │
│ ┌─────────────────────────────┐ │
│ │ Log in │ │
│ └─────────────────────────────┘ │
│ │
│ ┌─────────────────────────────┐ │
│ │ Scroll on TT │ │
│ └─────────────────────────────┘ │
│ │
│ │
│ [Tenexa] ← AI/AGENT/Voice Call │
└─────────────────────────────────────┘
```

### 1. Splash Screen (2 secondes)

- Logo Tenexa animé (fade in + scale)
- Couleur de fond : Blanc ou vert très clair
- Vérification token en arrière-plan

### 2. Welcome Screen (première visite uniquement)

**Layout** :

- Logo Tenexa centré en haut
- Tagline : “Your 1st step to the innovation”
- 3 points clés avec icônes :
- 🎯 Missions personnalisées par IA
- 💰 Gestion simplifiée de votre activité
- 🤝 Entreprises vérifiées et de confiance

**CTA Buttons** :

```
┌─────────────────────────────┐
│ Créer un compte [Nouveau] │ ← Primaire vert #006241
└─────────────────────────────┘

┌─────────────────────────────┐
│ Se connecter │ ← Secondaire bordure
└─────────────────────────────┘

────────── ou ──────────

[Continuer avec TikTok] ← OAuth (si "Scroll on TT")
```

### 3. Inscription (Wizard 4 étapes + photos)

#### Étape 1/4 - Informations Personnelles

```
┌─────────────────────────────────────┐
│ ← Inscription [1/4] │
│ ●───○───○───○ │
│ │
│ Créons votre profil │
│ │
│ Civilité │
│ ● M. ○ Mme │
│ │
│ Prénom * │
│ [________________] │
│ │
│ Nom * │
│ [________________] │
│ │
│ Email * │
│ [________________] │
│ ✓ Email disponible │
│ │
│ Téléphone * │
│ [+33][____________] │
│ │
│ Date de naissance * │
│ [JJ] [MM] [AAAA] │
│ │
│ [Continuer →] │
│ │
│ * Champs obligatoires │
└─────────────────────────────────────┘
```

**Validation temps réel** :

- Email : Format + unicité (API check)
- Téléphone : Format international
- Date : Âge minimum 18 ans
- Indicateurs visuels : ✓ vert, ✗ rouge, ⚠️ orange

#### Étape 2/4 - Sécurité

```
┌─────────────────────────────────────┐
│ ← Inscription [2/4] │
│ ●───●───○───○ │
│ │
│ Sécurisez votre compte │
│ │
│ Mot de passe * │
│ [________________] [👁️] │
│ │
│ Force du mot de passe : │
│ ████████░░░░ Fort │
│ │
│ Votre mot de passe doit contenir : │
│ ✓ Au moins 8 caractères │
│ ✓ 1 majuscule │
│ ✓ 1 minuscule │
│ ✓ 1 chiffre │
│ ✗ 1 caractère spécial │
│ │
│ Confirmer le mot de passe * │
│ [________________] [👁️] │
│ ✓ Les mots de passe correspondent │
│ │
│ [Continuer →] │
└─────────────────────────────────────┘
```

**Indicateur de force** :

- Faible (rouge) : < 6 caractères
- Moyen (orange) : 6-8 caractères, critères partiels
- Fort (vert) : 8+ caractères, tous critères
- Très fort (vert foncé) : 12+ caractères + symboles

#### Étape 3/4 - Profil Professionnel

```
┌─────────────────────────────────────┐
│ ← Inscription [3/4] │
│ ●───●───●───○ │
│ │
│ Votre profil professionnel │
│ │
│ Métier principal * │
│ [▼ Sélectionnez un métier] │
│ • Électricien │
│ • Plombier │
│ • Chauffagiste │
│ • Technicien CVC │
│ • ... (liste complète) │
│ │
│ Années d'expérience * │
│ 0 ────●───────────────── 30+ │
│ 8 ans │
│ │
│ Niveau de qualification * │
│ ○ CAP/BEP │
│ ● Bac Pro │
│ ○ BTS/DUT │
│ ○ Licence │
│ ○ Master/Ingénieur │
│ │
│ Statut professionnel * │
│ ○ Salarié │
│ ● Auto-entrepreneur │
│ ○ Freelance │
│ ○ En recherche d'emploi │
│ │
│ N° SIRET (si applicable) │
│ [___ ___ ___ _____] │
│ │
│ [Continuer →] │
└─────────────────────────────────────┘
```

#### Étape 4/4 - Préférences & CGU

```
┌─────────────────────────────────────┐
│ ← Inscription [4/4] │
│ ●───●───●───● │
│ │
│ Dernières informations │
│ │
│ Rayon de déplacement * │
│ 0 ──────●─────────────── 200 km │
│ 50 km │
│ │
│ Disponibilité générale * │
│ ○ Temps plein (35-40h/sem) │
│ ● Temps partiel (20-30h/sem) │
│ ○ Missions courtes uniquement │
│ ○ Totalement flexible │
│ │
│ ───────────────────────────── │
│ │
│ ✓ J'accepte les Conditions │
│ Générales d'Utilisation * │
│ [Lire les CGU] │
│ │
│ ✓ J'accepte la Politique de │
│ Confidentialité * │
│ [Lire la politique] │
│ │
│ ☐ J'accepte de recevoir la │
│ newsletter et les offres │
│ │
│ [🚀 Créer mon compte] │
│ │
│ En créant un compte, vous rejoignez │
│ 10 000+ techniciens sur TENEX │
└─────────────────────────────────────┘
```

#### Post-Inscription : Vérification Email

```
┌─────────────────────────────────────┐
│ │
│ [Icône Email 📧] │
│ │
│ Vérifiez votre email │
│ │
│ Nous avons envoyé un email à : │
│ jean.dupont@email.com │
│ │
│ Cliquez sur le lien dans l'email │
│ pour activer votre compte. │
│ │
│ Vous n'avez pas reçu l'email ? │
│ [Renvoyer] (disponible dans 60s) │
│ │
│ ───────────────────────────── │
│ │
│ [Modifier l'email] │
│ [Retour à l'accueil] │
│ │
└─────────────────────────────────────┘
```

### 4. Connexion

```
┌─────────────────────────────────────┐
│ ← Connexion │
│ │
│ [Logo Tenexa] │
│ │
│ Heureux de vous revoir ! │
│ │
│ Email │
│ [________________] │
│ │
│ Mot de passe │
│ [________________] [👁️] │
│ │
│ ☐ Se souvenir de moi │
│ │
│ [Se connecter] │
│ │
│ [Mot de passe oublié ?] │
│ │
│ ────────── ou ────────── │
│ │
│ [📱 Face ID / Touch ID] │
│ │
│ ───────────────────────────── │
│ │
│ Pas encore inscrit ? │
│ [Créer un compte] │
└─────────────────────────────────────┘
```

**Features connexion** :

- Biométrie (si activée et supportée)
- Remember me (token 30 jours)
- Rate limiting : 5 tentatives / 15 min
- Captcha après 3 échecs

### 5. Mot de Passe Oublié

```
Étape 1 : Email
┌─────────────────────────────────────┐
│ ← Mot de passe oublié │
│ │
│ Réinitialisez votre mot de passe │
│ │
│ Entrez votre adresse email et nous │
│ vous enverrons un code de │
│ vérification. │
│ │
│ Email │
│ [________________] │
│ │
│ [Envoyer le code] │
│ │
│ [← Retour à la connexion] │
└─────────────────────────────────────┘

Étape 2 : Code OTP
┌─────────────────────────────────────┐
│ ← Vérification │
│ │
│ Entrez le code à 6 chiffres │
│ │
│ Code envoyé à jean.d***@email.com │
│ │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐│
│ │ 4 │ │ 7 │ │ 2 │ │ 8 │ │ 1 │ │ 6 ││
│ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘│
│ │
│ Code expire dans : 04:38 │
│ │
│ [Vérifier] │
│ │
│ Vous n'avez pas reçu le code ? │
│ [Renvoyer] (60s) │
└─────────────────────────────────────┘

Étape 3 : Nouveau mot de passe
┌─────────────────────────────────────┐
│ ← Nouveau mot de passe │
│ │
│ Créez un nouveau mot de passe │
│ │
│ Nouveau mot de passe │
│ [________________] [👁️] │
│ │
│ Force : ████████░░░░ Fort │
│ │
│ Confirmer le mot de passe │
│ [________________] [👁️] │
│ │
│ [Réinitialiser] │
└─────────────────────────────────────┘
```

-----

## 🏠 DASHBOARD PRINCIPAL (Home)

### Vue d’ensemble (d’après vos croquis)

```
┌─────────────────────────────────────┐
│ [Logo] Bonjour Jean ! [🔔3] [👤] │
├─────────────────────────────────────┤
│ │
│ 📊 STATUT ACTUEL │
│ ┌─────────────────────────────────┐ │
│ │ 🎯 Mission en cours │ │
│ │ Maintenance électrique │ │
│ │ Client : Entreprise ABC │ │
│ │ │ │
│ │ Progression : ██████░░░░ 65% │ │
│ │ Jour 13/20 - Fin : 28/12/2024 │ │
│ │ │ │
│ │ [Voir mission] [Contacter] │ │
│ └─────────────────────────────────┘ │
│ │
│ 🆕 NOUVELLES PROPOSITIONS (2) │
│ ┌─────────────────────────────────┐ │
│ │ [NOUVEAU] Installation PV │ │
│ │ 📍 Paris 15e (12 km) │ │
│ │ 💰 350€/jour · 📅 Dès lundi │ │
│ │ ⏰ Répond avant : 18h demain │ │
│ │ [Voir] [Accepter] [Refuser] │ │
│ └─────────────────────────────────┘ │
│ │
│ 📈 APERÇU ACTIVITÉ │
│ ┌────────┐ ┌────────┐ │
│ │ 24 │ │ 2850€ │ │
│ │Missions│ │Ce mois │ │
│ └────────┘ └────────┘ │
│ │
│ [Voir toutes les stats →] │
│ │
│ 🎯 ACTIONS RAPIDES │
│ [📅 Dispo] [📄 Docs] [⚙️ Profil] │
└─────────────────────────────────────┘
│ [🏠][🎯][💬][📊][🤖] │
└─────────────────────────────────────┘
```

### Détail des Sections

#### Header Personnalisé

```
┌─────────────────────────────────────┐
│ [Logo Bonjour Jean ! [●] │
│ Tenexa] Électricien [👤] │
│ 3 │
└─────────────────────────────────────┘
```

- **Logo** : Tenexa (cliquable → refresh)
- **Salutation** : Contextuelle (Bonjour/Bonsoir + prénom)
- **Métier** : Badge sous le nom
- **Notifications** : Badge avec compteur
- **Profil** : Photo avatar cliquable

#### Card Statut Actuel (si mission active)

**Mission en cours** :

```
┌─────────────────────────────────────┐
│ 🔥 MISSION EN COURS │
├─────────────────────────────────────┤
│ Installation système électrique │
│ Entreprise ABC · Secteur Industrie │
│ │
│ 📍 75015 Paris · 📞 Contact dispo │
│ │
│ Progression : ██████████░░ 85% │
│ Jour 17/20 │
│ │
│ ⏰ Fin prévue : 28/12/2024 │
│ 💰 Rémunération : 2 000€ │
│ │
│ ┌──────────────┐ ┌───────────────┐ │
│ │ Voir mission │ │ Contacter │ │
│ └──────────────┘ └───────────────┘ │
│ │
│ Dernière activité : │
│ ✓ Pointage aujourd'hui 08:15 │
└─────────────────────────────────────┘
```

**Si aucune mission** :

```
┌─────────────────────────────────────┐
│ 🎯 PRÊT POUR UNE NOUVELLE MISSION ? │
├─────────────────────────────────────┤
│ Vous êtes actuellement disponible │
│ │
│ Votre profil est complété à 85% │
│ ████████████████░░░░ │
│ │
│ ⚠️ Complétez votre profil pour │
│ recevoir +30% de propositions ! │
│ │
│ Points à améliorer : │
│ • Ajouter 2-3 certifications │
│ • Compléter vos disponibilités │
│ │
│ [Améliorer mon profil →] │
└─────────────────────────────────────┘
```

#### Section Nouvelles Propositions

```
┌─────────────────────────────────────┐
│ 🆕 NOUVELLES PROPOSITIONS (3) │
│ │
│ ┌─────────────────────────────────┐ │
│ │[NOUVEAU] 🔥 Top Match 92% │ │
│ │ │ │
│ │ Installation panneaux solaires │ │
│ │ SolarTech Solutions │ │
│ │ │ │
│ │ 📍 Paris 15e (12 km de vous) │ │
│ │ 📅 Début : Lundi 18/12 │ │
│ │ ⏱️ Durée : 3 jours │ │
│ │ 💰 350€/jour (1 050€ total) │ │
│ │ │ │
│ │ [Électricité PV] [Habilitation] │ │
│ │ │ │
│ │ ⏰ Répondre avant : 17h demain │ │
│ │ │ │
│ │ [Voir] [Accepter] [Refuser] │ │
│ └─────────────────────────────────┘ │
│ │
│ [Voir toutes les propositions (3)] │
└─────────────────────────────────────┘
```

**Badges propositions** :

- 🆕 NOUVEAU (< 24h)
- 🔥 TOP MATCH (> 85% compatibilité)
- ⚡ URGENT (réponse < 24h)
- 💎 PREMIUM (client premium)
- 🌟 RECOMMANDÉ (par l’algo)

#### Section Activité Rapide

Grid 2x2 ou 2x3 selon l’espace :

```
┌─────────────────────────────────────┐
│ 📈 APERÇU ACTIVITÉ │
│ │
│ ┌──────────────┐ ┌──────────────┐ │
│ │ 📅 Missions │ │ 💰 Revenus │ │
│ │ 24 │ │ 28 450€ │ │
│ │ Cette année │ │ Cette année │ │
│ └──────────────┘ └──────────────┘ │
│ │
│ ┌──────────────┐ ┌──────────────┐ │
│ │ ⭐ Note │ │ ⏱️ Ce mois │ │
│ │ 4.8/5 │ │ 156 h │ │
│ │ Satisfaction │ │ Temps travail│ │
│ └──────────────┘ └──────────────┘ │
│ │
│ [Voir statistiques complètes →] │
└─────────────────────────────────────┘
```

#### Actions Rapides (Horizontal Scroll)

```
┌─────────────────────────────────────┐
│ 🎯 ACTIONS RAPIDES │
│ │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ │
│ │ 📅 │ │ 📄 │ │ ⚙️ │ │ 💳 │ → │
│ │Dispo│ │ Docs│ │Comp │ │Paie │ │
│ └─────┘ └─────┘ └─────┘ └─────┘ │
│ │
│ Glissez pour voir plus → │
└─────────────────────────────────────┘
```

**Actions disponibles** :

- 📅 Mes disponibilités
- 📄 Mes documents
- ⚙️ Mes compétences
- 💳 Info paiement
- 🏆 Badges & certifications
- 📊 Statistiques détaillées
- 🎓 Formations disponibles
- 💬 Support / FAQ

#### Section Actualités (optionnelle, collapsible)

```
┌─────────────────────────────────────┐
│ 📰 ACTUALITÉS TENEX [▼] │
│ │
│ ┌─────────────────────────────────┐ │
│ │ [Image] │ │
│ │ Nouveau : Assurance missions │ │
│ │ Protégez-vous avec notre... │ │
│ │ Il y a 2 jours │ │
│ └─────────────────────────────────┘ │
│ │
│ [Voir toutes les actus] │
└─────────────────────────────────────┘
```

#### Floating Action Button (FAB)

Bouton flottant coin inférieur droit :

```
┌─────┐
│ ? │ ← Support / AI Assistant
│ 💬 │
└─────┘
```

Au tap : Bottom sheet avec options :

- 🤖 Parler à l’assistant IA
- 📞 Appeler le support
- 💬 Chat en direct
- 📧 Envoyer un email
- ❓ FAQ

-----

## 🎯 MODULE MISSIONS DÉTAILLÉ

### Liste des Missions (Tab Missions)

```
┌─────────────────────────────────────┐
│ ← Missions [🔍] [⚙️] │
│ │
│ ● Nouvelles (2) ○ En attente (1) │
│ ○ En cours (1) ○ Terminées │
│ │
│ ┌─────────────────────────────────┐ │
│ │ [🔥 TOP MATCH 92%] [NOUVEAU] │ │
│ │ │ │
│ │ Installation panneaux solaires │ │
│ │ ⭐⭐⭐⭐⭐ SolarTech Solutions │ │
│ │ │ │
│ │ 📍 Paris 15e - 12 km │ │
│ │ 📅 Lun 18/12 · ⏱️ 3 jours │ │
│ │ 💰 350€/j (1050€ total) │ │
│ │ │ │
│ │ [Électricité] [PV] [B2] │ │
│ │ │ │
│ │ Match : ██████████░ 92% │ │
│ │ ⏰ Réponse avant : 17h demain │ │
│ │ │ │
│ │ [Détails] [Accepter] [Refuser] │ │
│ └─────────────────────────────────┘ │
│ │
│ ┌─────────────────────────────────┐ │
│ │ [URGENT ⚡] │ │
│ │ Dépannage système électrique │ │
│ │ ... (même structure) │ │
│ └─────────────────────────────────┘ │
│ │
│ [Voir missions archivées] │
└─────────────────────────────────────┘
│ [🏠][🎯][💬][📊][🤖] │
└─────────────────────────────────────┘
```

### Filtres & Recherche

**Icône filtre (⚙️)** → Bottom Sheet :

```
┌─────────────────────────────────────┐
│ Filtres [×] │
├─────────────────────────────────────┤
│ │
│ 📍 Localisation │
│ [Dans un rayon de... ] [×] │
│ 0 ────●──────────── 200 km │
│ 50 km │
│ │
│ 📅 Date de début │
│ ○ Cette semaine │
│ ● Ce mois │
│ ○ Dans 3 mois │
│ ○ Personnalisé : [__/__/__] │
│ │
│ ⏱️ Durée │
│ ☐ Court terme (1-5 jours) │
│ ☐ Moyen terme (1-4 semaines) │
│ ☐ Long terme (1+ mois) │
│ │
│ 💰 Rémunération │
│ Minimum : 200€ ────●──── 500€/jour │
│ 300€ │
│ │
│ 🏢 Type
```