# Fitwise iOS 🏋️‍♂️🥗💧🌙

Fitwise is a premium, feature-rich iOS fitness companion application built with React Native and Expo. It features a sleek, modern, glassmorphic dark-mode interface powered by an electric lime/coral color palette, designed to optimize workout logging, nutrition management, progress tracking, hydration, sleep, and physical recovery.

This application is built as a **100% offline-first, local-only** system. It does not use any cloud databases, external web services, or network calls, keeping your fitness and recovery logs entirely private to your device.

---

## ✨ Core Features

### 1. 👤 Profile & Setup
* Personalized onboarding form setting up Name, Age, Height, Weight, Activity Levels, and Fitness Goals (*Fat Loss*, *Muscle Gain*, *Weight Maintenance*).
* Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE) auto-calculations based on the **Mifflin-St Jeor** formula to estimate custom calorie and macronutrient targets (Protein, Carbs, Fats).
* Settings panel allowing quick profile details and targets updates.

### 2. 🏋️‍♂️ Workout Tracker & Active Logging
* **Collapsible Active Session Logging**: Log exercises, sets, reps, weight logs, and exercise notes instantly. Set metadata details are collapsed by default to keep the screen focused on active tracking.
* **Stopwatch Timer**: Shows a real-time running timer (e.g. `⏱️ 00:05`) at the top of active sessions.
* **Preloaded Exercise Library**: Comprehensive guide for standard gym movements with instructions and pro-tips.
* **History Pre-filling**: Automatically queries history to pre-fill sets, reps, and weights from your *most recent* completed workout session of the same exercise to minimize tracking friction.

### 3. 📅 Workout Calendar & Routines
* **Consistency Calendar**: Visual monthly view highlighting completed workout days.
* **GitHub-Style Heatmap**: Completed days are marked with green color-coded intensity mapping representing total set volumes.
* **Workout Templates**: Create, manage, edit, duplicate, and delete custom workout routines to start them with one click.

### 4. 📈 Volume Analytics & Muscle Balance
* **Volume Metrics**: Visual charts compiling total training volume (`sets * reps * weight`) grouped by weeks and months.
* **Muscle Group Breakdown**: Beautiful SVG bar charts highlighting weekly load distribution.
* **Muscle Balance Analysis**: Computes Upper Body, Lower Body, and Core balance scores and generates custom training recommendations.

### 5. 💧 Hydration Tracker
* **Hydration Dashboard**: Circular progress visual showing current intake against customizable daily targets.
* **Quick Log Actions**: Quick-add buttons (`+250ml`, `+500ml`, `+1000ml`) and manual text inputs.
* **Intake Trends**: Bar chart visualizing hydration totals over the last 7 days.
* **Hydration Badges**: Unlock achievements like *Hydration Starter* (7 days) and *Hydration Master* (30 days).

### 6. 🌙 Sleep Tracker & Recovery System
* **Manual Sleep Logging**: Log bedtime, wake-up time, quality rating (1-10), and custom notes. Autocalculates sleep duration, supporting sleep logs spanning across midnight.
* **Sleep Score System (0-100)**: Formulated from 50% sleep duration, 30% bedtime/wakeup consistency (calculating standard deviation over the last 5 logs), and 20% self-rated quality.
* **Recovery Score (0-100%)**: Dynamically computes preparation percentage using last night's sleep score (70%) and a penalty for recent workout loads (Yesterday -20%, 2 Days Ago -10%, 3 Days Ago -5%) to provide training advice.
* **Sleep-Workout Correlation**: Computes and compares average workout volume on days following 7h+ of sleep against poor sleep (<6h), providing custom training insights.
* **Weekly Report**: Details average sleep duration, average score, and best/worst sleep days of the week.

### 7. 🧍‍♂️ RPG-Style Body Visualizer
* **Interactive Mannequin Models**: Switch between FRONT and BACK views to inspect 15 detailed muscle subgroups drawn using interactive SVG polygons.
* **Vibrant Heatmap Tiers**: Polygons dynamically color-code themselves from Unused/Weak to Strong/Elite (Muted Gray, Rust Red, Bronze Orange, Electric Lime, Elite Cyan) based on development scores.
* **Muscle Detail Inspector**: Tap any muscle to inspect its rank (Bronze/Silver/Gold/Elite), weekly/monthly volumes, training frequency, and monthly growth percentage.
* **Volume Contributors**: Renders a clean progress bar list displaying exactly how much each exercise contributes to that muscle's development.
* **Growth Sparklines**: A local SVG line chart representing historical development scores over the last 6 months.
* **Balance Analysis & Insights**: Identifies lagging muscles and focus areas, generating tailored training recommendations (e.g. *"Leg volume is below your upper-body volume"*).
* **Physique Evolution**: Logs milestone milestones reached in your training journey.

### 8. 🎨 Today-First Companion Dashboard
* **Dynamic Header**: Warm greeting adapting to the time of day (`Good morning, Tung! 👋`).
* **Level & XP Gamification**: Earn XP and level up by logging workouts, hitting nutrition goals, drinking water, and meeting sleep goals.
* **Daily Score (0-100)**: Features a re-balanced daily target indicator: Workouts (25 pts), Calories (20 pts), Protein (20 pts), Hydration (15 pts), and Sleep (20 pts).
* **SVG Circular Progress Rings**: 5 interactive circular breakdown widgets representing workouts, calories, protein, hydration, and sleep. They draw **dynamic SVG border rings** matching category colors (Coral, Orange, Emerald, Cyan, Purple) to show exact completion percentages.
* **Quick Actions Grid**: One-tap access to *Start Gym*, *Calendar*, *Progress*, and *Log Water*.
* **Recent Achievements Cabinet**: Displays recently unlocked badges, including new *Iron Builder* and *Gym Legend* milestones.
* **Visualizer Status Card**: A compact card summarizing your Body Score, strongest muscle, lagging muscle, and recent improvement metrics with direct navigation links.

### 9. ⚙️ Data Portability & Settings
* **Dynamic Theme Switcher**: Toggle instantly between Light Mode and Dark Mode.
* **Data Portability (Backup & Import)**: Export your entire application state as a single JSON backup string, and restore it back anytime.
* **Clean Reset**: Purge all local data and configurations to start fresh.

---

## 🛠️ Technology Stack

* **Framework:** React Native (Expo SDK 54)
* **Language:** TypeScript
* **State Management:** React Context API + Reducer (`useReducer`)
* **Persistence:** `@react-native-async-storage/async-storage`
* **Navigation:** React Navigation (Bottom Tabs + Native Stacks)
* **Graphics/SVG:** `react-native-svg`

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
    ├── screens/               # Main view screens (Dashboard, SleepTracker, WorkoutCalendar, etc.)
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
