// Client-side push registration helper

export async function initPush(vapidPublicKey: string | undefined) {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers not supported.');
    return;
  }
  if (!('PushManager' in window)) {
    console.warn('Push not supported in this browser.');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    if (Notification.permission !== 'granted') {
      console.warn('Notifications permission not granted.');
      return;
    }

    if (!vapidPublicKey) {
      console.warn('VAPID public key is not set (VITE_VAPID_PUBLIC_KEY). Subscription will not be secure.');
    }

    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      console.log('Already subscribed to push. Returning existing subscription.');
      // Return existing subscription so caller can save it to the server
      return existing;
    }

    const convertedVapidKey = vapidPublicKey ? urlBase64ToUint8Array(vapidPublicKey) : undefined;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    } as any);

    // Send to server: prefer convexClient if provided, otherwise POST to /api/push/subscribe
    const subJson = subscription.toJSON ? subscription.toJSON() : subscription;
    // Caller: send `subJson` to your backend (Convex mutation `push.subscribe`).
    console.log('Push subscription created; send this to your backend to save it:', subJson);
    return subscription;
  } catch (err) {
    console.error('initPush error', err);
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default initPush;
