Push notifications (client + helper)
=================================

This small guide explains how to configure push notifications for the web app.

Overview
--------

- The Vite PWA plugin is configured to use an `injectManifest` service worker located at `src/sw.ts`.
- The client helper `src/push.ts` subscribes the user to push (requests permission) and posts the subscription to `/api/push/subscribe`.
- A small helper script `push/send-push.mjs` shows how to send a push message from a server or locally using the `web-push` npm package.

Steps
-----

1. Generate VAPID keys (on your server machine) with `npx web-push generate-vapid-keys` or using `web-push` library. You'll get a public and private key.

2. Provide the public key to the client by setting the environment variable in Vite: create a `.env` or set in your environment

   VITE_VAPID_PUBLIC_KEY=your_public_key_here

   Then start the dev server (`npm run dev`) so `import.meta.env.VITE_VAPID_PUBLIC_KEY` is available.

3. Implement a backend endpoint (example: `POST /api/push/subscribe`) that stores the subscription JSON and allows your server to send pushes using the private key. The client `src/push.ts` will POST the subscription there.

4. To test sending a push locally, install `web-push` and run the helper script:

   npm install web-push --workspace=.
   export VAPID_PUBLIC_KEY=your_public
   export VAPID_PRIVATE_KEY=your_private
   node push/send-push.mjs '<subscription-json>' '{"title":"Hello","body":"Test","url":"/"}'

Notes
-----

- Replace icon paths in `src/sw.ts` to match your app assets.
- The server must use the VAPID private key to sign push messages it sends.
- The example `send-push.mjs` expects a subscription object as first CLI argument (copy from logs or server storage).
