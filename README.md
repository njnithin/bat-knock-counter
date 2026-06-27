# Bat Knock Counter v2.0.0

Welcome to the **Bat Knock Counter**, a comprehensive tool for tracking, managing, and automating bat knocks with professional telemetry and a stunning modern UI!

This application is built for cricket bat makers, players, or enthusiasts who want to precisely track the number of knocks delivered to different portions of their cricket bat.

## Features & Functionalities

### 1. 🦇 Bat Profile Management
- **Multiple Bats**: Create and manage multiple bat profiles concurrently. Your data is isolated per bat.
- **Bat Weights**: Keep track of the exact weight of each bat. Seamlessly toggle between grams (g) and pounds (lbs) to suit your preference. The toggle dynamically hides if a bat has no weight.
- **Name Constraints**: Bat names are intelligently capped to 10 characters and enforce alphanumeric rules to keep UI presentation perfect.
- **Lock System**: Lock a specific bat to prevent accidental edits or recording when you are done tracking its knocks. The table automatically grays out and enters an inactive, read-only state.
- **Easy Switch**: Quickly switch between your active bats using the beautifully styled Neumorphic bat tabs.

### 2. 🎙️ Auto Knock Detection
- **Microphone Integration**: Built-in support to listen for physical knocks using your microphone.
- **Acoustic 'Sweet Spot' Analysis**: Real-time Fast Fourier Transform (FFT) analysis visualizes the audio waveform and determines the "Ping Quality" based on the bat's resonant frequency. It intelligently filters out human speech and accurately identifies Sweet Spot (>1200Hz), Solid Contact (>600Hz), and Edge/Toe hits.
- **Wake Lock Support**: Automatically prevents your device screen from sleeping or dimming while recording so you don't miss a single knock.
- **Sensitivity Slider**: Adjust how loud a knock needs to be to register, using a custom physical-groove style slider.
- **Visual Feedback**: The targeted row flashes dynamically instantly upon detecting a knock.
- **Live Counter**: A live partial counter tracks knocks as they happen. You can manually edit this counter on the fly to correct any miscounts.

### 3. ☁️ Cloud Sync & Accounts
- **Google Login**: Securely log in using your Google Account (powered by Firebase).
- **Cloud Firestore Storage**: Store your bat profiles and telemetry data securely in the cloud.
- **Cross-Device Syncing**: Seamlessly sync your data across all your devices in real-time (e.g., knocking on your phone, viewing stats on your laptop).

### 4. 🔄 Auto-Switch Target
- You can enable **Auto-Switch** mode to automatically advance to the next bat portion once 1000 knocks are recorded on the current one.
- Seamlessly loops from the first portion (1L) down to the last portion (4R) and cycles back, letting you knock your entire bat without constantly touching your computer.

### 5. 📊 Data Visualization & Tracking
- **Interactive Knock Heatmap**: A visual, responsive diagram of a cricket bat that dynamically illuminates to show knock density per-portion! Color intensity scales based on a 10k-knock golden rule.
- Tracks knocks across 12 predefined bat portions (1L to 4R).
- Shows live partial counters alongside the total recorded counts.
- **Floating Row Cards**: Instead of boring standard table lines, the data rows are separated into individual, floating 3D cards using neumorphic shadows.
- **Milestone Popups & Confetti**: 
  - Once a portion hits a multiple of 10,000 knocks, you'll be greeted with a celebratory muscle popup and a localized confetti burst!
  - **Mega Golden Confetti**: If every single portion on the bat reaches the 10,000 knock milestone, a massive golden confetti celebration will cover the entire screen!

### 6. 📤 Export Capabilities
- **Export to PDF (`.pdf`)**: Generate a clean, styled PDF document summarizing all knocks.
- **Export to Excel (`.xlsx`)**: Export the raw data into an Excel spreadsheet for your own record keeping or analysis.

### 7. 📱 Progressive Web App (PWA) Offline Mode
- **Offline Functionality**: Includes a custom Service Worker that intercepts network requests, caches assets, and allows the app to function 100% offline. Perfect for workshops and garages!
- **Installable**: Provides a web app manifest and high-res vector icons, allowing users to "Install App" and launch it natively from their desktop or mobile home screen.

### 8. 🎨 Dual Themes (Neumorphic Design)
- Features a highly responsive, modern interface powered by Tailwind CSS with custom styling, perfectly scaling to fit standard viewports.
- **Light Theme (Bright Neumorphic)**: A sleek, physical design where elements are softly extruded from or pressed into a bright, unified background using complex inner and outer shadows.
- **Dark Theme (Dark Neumorphic)**: A stealthy, high-contrast adaptation of the neumorphic physical aesthetic, featuring deep dark backgrounds and glowing neon accents.
- **Dynamic Brand Highlights**: Text colors, glow effects, and visual gradients auto-adapt based on the currently active theme context.
- **Custom Dropdowns**: Native selects have been completely replaced with animated, themed dropdown menus.

---

## Technical Stack
- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS (via CDN), Canvas Confetti, SheetJS (xlsx), html2pdf, html2canvas.
- **Backend & Auth**: Firebase Authentication (Google Auth) and Cloud Firestore for real-time NoSQL data syncing.

## Setup & Running Locally
Since the app relies on Firebase for its backend, it can be run using any static file server!

1. Ensure you have Node.js installed (or use any other static server like Python `http.server`).
2. Run `npx serve .` in the project directory.
3. Open your browser and navigate to the provided localhost URL (typically `http://localhost:3000`).
