# Fitwise iOS 🏋️‍♂️🥗

Fitwise is a premium, feature-rich iOS fitness companion application built with React Native and Expo. It features a sleek, modern, glassmorphic dark-mode interface powered by an electric lime/coral color palette, designed to optimize workout logging, nutrition management, and progress tracking.

---

## ✨ Features

### 1. 👤 Profile & Fitness Goals Configuration
* Personalized onboarding form setting up Name, Age, Height, Weight, Activity Levels, and Fitness Goals (*Fat Loss*, *Muscle Gain*, *Maintenance*).
* Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE) auto-calculations based on the **Mifflin-St Jeor** formula to estimate custom calorie and macronutrient targets (Protein, Carbs, Fats).
* Settings panel allowing quick profile details and targets updates.

### 2. 🏋️‍♂️ Gym Workout Logger & Exercise Library
* **Fast Workout Session Tracker**: Log exercises, sets, reps, weight logs, and exercise notes instantly. Includes one-tap set completions.
* **Preloaded Exercise Library**: Comprehensive guide for standard gym movements with instructions and pro-tips.
* **Custom Movements**: Create and save custom exercises directly into your search list.
* **Log History Viewer**: Review past workouts grouped with date range filters (*Day*, *Week*, *Month*, *All*) and collapsible cards.

### 3. 🍎 Calorie Counter & Nutrition Tracker
* Log consumed meals throughout the day with precise calorie and macronutrient inputs.
* **Quick Add Presets suggestions**: Instantly log common fitness food items (e.g. Chicken Breast, Egg, Rice, Whey Shake) with pre-filled macros for frictionless logging.
* **Custom Food Presets**: Save and delete custom preset items in the Settings panel.
* **Date Switcher**: Flip between days to review previous dates' calorie logs and progress.

### 4. 📈 Transformation Progress & Reminders
* Log body weight and core tape measurements (Waist, Chest, Biceps, Thighs).
* **Dynamic Weight Charts**: Sleek weight change trend visualization drawn using custom `react-native-svg` line paths.
* **Daily Alerts**: Toggle in-app reminders for workout times, hydration, and meal trackers.

### 5. ⚙️ Settings, Themes & Data Portability
* **Dynamic Theme Switcher**: Toggle instantly between Light Mode and Dark Mode.
* **Data Portability (Backup & Import)**: Export your entire application state as a single JSON backup string, and verify/import it back anytime to restore data.
* **Clean Reset**: Purge all local data and configurations to start fresh.

---

## 🛠️ Technology Stack

* **Framework:** React Native (Expo SDK 54)
* **Language:** TypeScript
* **State Management:** React Context API + Reducer (`useReducer`)
* **Persistence:** `@react-native-async-storage/async-storage`
* **Navigation:** React Navigation (Bottom Tabs + Native Stacks)
* **Graphics/Charts:** `react-native-svg`

---

## 📂 Project Structure

```
fitwise-ios/
├── App.tsx                    # Root App Entry wrapping providers
├── index.ts                   # Bootstrapping script
├── tsconfig.json              # TypeScript compiler settings
├── package.json               # Package configuration
├── CLAUDE.md                  # Developer CLI command guide
├── AGENTS.md                  # Versioning constraints rule
└── src/
    ├── components/            # Reusable UI elements (AppText, Cards, Buttons, ProgressBars)
    ├── data/                  # Static exercise library and food presets suggestions
    ├── models/                # TypeScript type definitions (fitness.ts)
    ├── navigation/            # Navigation structure and router parameter types
    ├── screens/               # Main view screens (Dashboard, Workouts, Nutrition, Settings, etc.)
    ├── store/                 # State reducer engine and AsyncStorage helpers
    ├── theme/                 # Dark/Light color schemes and theme provider
    └── utils/                 # Date helpers and calorie math formula utilities
```

---

## 🚀 Getting Started

### 1. Prerequisite
Ensure you have Node.js (v20+) and `npm` installed.

### 2. Installation
Run npm install with legacy peer-deps to resolve peer dependencies:
```bash
npm install --legacy-peer-deps
```

### 3. Run Dev Server
```bash
npm run start
```

* **Physical iPhone:** Install **Expo Go** from the App Store, and scan the QR code printed in the terminal.
* **iOS Simulator:** Press `i` to launch on a Mac emulator.
* **Web App:** Press `w` to run directly in your web browser.
