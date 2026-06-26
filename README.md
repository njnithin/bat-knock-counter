# Bat Knock Counter v1.0.0

Welcome to the **Bat Knock Counter**, a comprehensive tool for tracking, managing, and automating bat knocks with professional telemetry and a stunning modern UI!

This application is built for cricket bat makers, players, or enthusiasts who want to precisely track the number of knocks delivered to different portions of their cricket bat.

## Features & Functionalities

### 1. 🦇 Bat Profile Management
- **Multiple Bats**: Create and manage multiple bat profiles concurrently. Your data is isolated per bat.
- **Lock System**: Lock a specific bat to prevent accidental edits or recording when you are done tracking its knocks. The table automatically grays out and enters an inactive, read-only state.
- **Easy Switch**: Quickly switch between your active bats using the beautifully styled Neumorphic bat tabs.

### 2. 🎙️ Auto Knock Detection
- **Microphone Integration**: Built-in support to listen for physical knocks using your microphone.
- **Sensitivity Slider**: Adjust how loud a knock needs to be to register, using a custom physical-groove style slider.
- **Visual Feedback**: The targeted row flashes dynamically instantly upon detecting a knock.
- **Live Counter**: A live partial counter tracks knocks as they happen. You can manually edit this counter on the fly to correct any miscounts.

### 3. 🔄 Auto-Switch Target
- You can enable **Auto-Switch** mode to automatically advance to the next bat portion once 1000 knocks are recorded on the current one.
- Seamlessly loops from the first portion (1L) down to the last portion (4R) and cycles back, letting you knock your entire bat without constantly touching your computer.

### 4. 📊 Data Visualization & Tracking
- Tracks knocks across 12 predefined bat portions (1L to 4R).
- Shows live partial counters alongside the total recorded counts.
- **Milestone Popups & Confetti**: 
  - Once a portion hits a multiple of 10,000 knocks, you'll be greeted with a celebratory muscle popup and a localized confetti burst!
  - **Mega Golden Confetti**: If every single portion on the bat reaches the 10,000 knock milestone, a massive golden confetti celebration will cover the entire screen!

### 5. 📤 Export Capabilities
- **Export to Image (`.png`)**: Save a beautiful snapshot of your bat's current knock table.
- **Export to PDF (`.pdf`)**: Generate a clean, styled PDF document summarizing all knocks.
- **Export to Excel (`.xlsx`)**: Export the raw data into an Excel spreadsheet for your own record keeping or analysis.

### 6. 🎨 Dual Themes (Neumorphic & Lumix)
- Features a highly responsive, modern interface powered by Tailwind CSS with custom styling.
- **Light Theme (Neumorphism)**: A sleek, physical design where elements are softly extruded from or pressed into a bright, unified background using complex inner and outer shadows.
- **Dark Theme (Lumix Glass)**: A high-contrast, glowing neon UI that perfectly pops against a deep dark background.
- **Custom Dropdowns**: Native selects have been completely replaced with animated, themed dropdown menus.

---

## Technical Stack
- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS (via CDN), Canvas Confetti, SheetJS (xlsx), html2pdf, html2canvas.
- **Backend (Optional API Sync)**: A simple Express server (`server.js`) stores state via `appData.json` so your data persists across page reloads and sessions.

## Setup & Running Locally
1. Ensure you have Node.js installed.
2. Run `npm install` to grab the server dependencies (Express, Cors).
3. Start the application:
   ```bash
   node server.js
   ```
4. Open your browser and navigate to `http://localhost:3000`.
