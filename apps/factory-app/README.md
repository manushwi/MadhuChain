# HoneyChain Factory App

Expo SDK 54 application for authenticated HoneyChain factory operations.

## Configuration

Set `EXPO_PUBLIC_API_BASE_URL` to the backend origin, without an `/api` suffix:

```bash
EXPO_PUBLIC_API_BASE_URL=https://honeychain.example.com
```

During local Expo development, the app derives `http://<metro-host>:4000` when the variable is not set. Standalone builds require the variable and report a configuration error instead of connecting to device-local `localhost`.

## Commands

```bash
npm install
npm start
npm run lint
npx tsc --noEmit
```
