# Push Notification Setup Guide

## Step 1: Generate VAPID Keys

Run this command in the terminal:

```bash
npx web-push generate-vapid-keys
```

You'll get output like:
```
=======================================

Public Key:
BFB...your-public-key...

Private Key:
abc...your-private-key...

=======================================
```

## Step 2: Set Environment Variables in Convex

You need to set the VAPID keys in your Convex deployment. You can do this in two ways:

### Option A: Via Convex Dashboard
1. Go to https://dashboard.convex.dev
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add two variables:
   - `VAPID_PUBLIC_KEY` = your public key
   - `VAPID_PRIVATE_KEY` = your private key

### Option B: Via CLI
```bash
cd packages/backend
npx convex env set VAPID_PUBLIC_KEY "BFB...your-public-key..."
npx convex env set VAPID_PRIVATE_KEY "abc...your-private-key..."
```

## Step 3: Set Environment Variable in Frontend

The **same** public key needs to be in your frontend `.env` file:

1. Edit `apps/web/.env`
2. Add or update:
   ```
   VITE_VAPID_PUBLIC_KEY=BFB...your-public-key...
   ```

**IMPORTANT**: The public key in the frontend MUST match the one in Convex!

## Step 4: Restart Development Servers

After setting environment variables:

1. Restart Convex: Stop and restart `npx convex dev`
2. Restart Vite: Stop and restart your frontend dev server

## Step 5: Test the Flow

1. Open your app in the browser
2. Go to Edit Profile page (`/editusers`)
3. Click "Ativar notificações" → Grant permission when browser asks
4. Check browser console for logs showing subscription was created
5. Click "Testar notificação" → You should receive a push notification

## Debugging

### Check if subscription was saved:
Open browser console and run:
```javascript
// In the browser console
const registration = await navigator.serviceWorker.ready;
const sub = await registration.pushManager.getSubscription();
console.log('Current subscription:', sub?.toJSON());
```

### Check Convex database:
You can check if subscriptions are being saved by looking at the Convex dashboard → Data → pushSubscriptions table.

### Check Convex logs:
In the Convex dashboard, go to "Logs" to see server-side console.log output from the push functions.

### Common Issues:

1. **"VAPID keys not set"** → Make sure you ran `npx convex env set` and restarted Convex
2. **No subscription in database** → Check browser console for errors when clicking "Ativar notificações"
3. **Notification not received** → Check that service worker is registered and push permission is granted
4. **Keys mismatch** → The VITE_VAPID_PUBLIC_KEY in frontend must match VAPID_PUBLIC_KEY in Convex

### Verify VAPID keys are set in Convex:
```bash
cd packages/backend
npx convex env list
```

You should see VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in the output.
