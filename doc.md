# Bat Knock Counter - Documentation & Developer Guide

## 1. Local Development
To run this project on your computer:
1. Open a terminal in the project folder.
2. Run `node server.js`.
3. Open your browser and go to `http://localhost:3000`.

## 2. Firebase Configuration
Because this app uses Firebase for cloud sync, you need a Firebase project.

### Getting your config keys:
1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Add a **Web App** (`</>`) to your project.
3. Firebase will generate a config object (containing `apiKey`, `projectId`, etc.).
4. Copy the `components/js/firebase-config.example.js` file and rename the copy to `firebase-config.js`.
5. Paste your real keys into that file.

*(Note: `firebase-config.js` is ignored by Git using `.gitignore` so your specific keys are never accidentally pushed to public repositories).*

## 3. Firebase Authentication (Google Login)
For the Google Login button to work:
1. Go to **Authentication** in the Firebase Console.
2. Click the **Sign-in method** tab.
3. Enable **Google**.
4. *(Mobile Testing Note)*: If you test on a phone via your computer's local IP address (e.g. `http://192.168.1.5:3000`), you must add that IP address to the **Authorized Domains** list in the Authentication Settings tab, otherwise the popup will be blocked.

## 4. Firestore Database & Security Rules
The app uses Firestore to save user data.
1. Go to **Firestore Database** in the Firebase Console.
2. Create a database.
3. Go to the **Rules** tab and paste the following to ensure users can only read/write their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only allow users to read/write their OWN document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 5. Deploying to Firebase Hosting (Going Live)
Firebase Hosting is the recommended way to host this app because it automatically uploads your hidden `firebase-config.js` file and natively supports secure `https://` Google Logins. GitHub Pages will not work because the config file is not pushed to GitHub.

### First-time Setup:
1. Install Firebase tools globally:
   ```bash
   npm install -g firebase-tools
   ```
2. Log in to your Google account:
   ```bash
   firebase login
   ```
3. Link your project (replace with your actual project ID):
   ```bash
   firebase use --add bat-knock-counter
   ```

### Deploying Changes:
Whenever you edit the code and want to push the updates live to your `https://bat-knock-counter.web.app` URL, simply run:
```bash
firebase deploy
```
