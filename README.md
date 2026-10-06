# Recall

Active-recall study app (Expo / React Native, iOS + Android). Notes in, flashcards out, reviewed on a spaced-repetition schedule.

## What works now
- **Notes**: write/paste notes, autosaved on device (SQLite).
- **Definition extraction**: offline; finds `Term: definition`, `Term - definition`, `X is/means/refers to ...` lines and proposes cards you approve before adding.
- **Flashcards**: SM-2 spaced repetition (Forgot / Hard / Good / Easy), "Today" queue, optional daily 7 pm reminder.
- **Test**: multiple-choice quiz built from your cards.
- **Photo scan**: camera/library picker is wired up; needs the OCR backend below.

## Run it
```bash
npm install
npx expo start      # scan the QR with Expo Go (SQLite/notifications work on device)
npm test && npm run typecheck
```

## Photo scanning backend (not built yet)
Never put an AI API key inside the app; anyone can extract it. Deploy a tiny endpoint that takes
`{ imageBase64, mimeType }`, sends the image to a vision model (e.g. Claude) with "transcribe this note", and returns `{ text }`.
Set `EXPO_PUBLIC_OCR_URL` to its URL. Rate-limit it per user: it's your main running cost and what a paid tier should cover.

## Ship to the App Store
1. Apple Developer Program ($99/yr). Change `ios.bundleIdentifier` / `android.package` in `app.json` from `com.example.recall` to yours.
2. `npm i -g eas-cli && eas login && eas build -p ios --profile production` (builds in the cloud, no Mac needed).
3. `eas submit -p ios` then fill in App Store Connect (screenshots, privacy policy URL, "Data not collected" if you keep it on-device).

## Monetization plan
Free: unlimited notes + typed cards. Pro subscription (RevenueCat): photo scanning, AI card generation, sync. Add a real icon/splash before submitting.
