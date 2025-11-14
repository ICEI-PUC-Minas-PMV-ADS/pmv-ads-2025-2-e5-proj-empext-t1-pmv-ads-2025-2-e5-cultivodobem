/* Service worker — handles push events and notification clicks.
   This file will be used by VitePWA with `injectManifest`.
*/

self.addEventListener('install', (event) => {
  // Activate immediately
  // @ts-ignore
  self.skipWaiting?.();
});

self.addEventListener('activate', (event) => {
  // @ts-ignore
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event: any) => {
  // use a permissive type for incoming push payloads
  let data: any = { title: 'Notification', body: 'You have a new message', url: '/' };
  try {
    if (event.data) data = event.data.json();
  } catch (e) {
    // fallback: text
    try {
      if (event.data) data = { title: 'Notification', body: event.data.text() };
    } catch (e2) {
      // ignore
    }
  }

  const title = data.title || 'Notification';
  const options: any = {
    body: data.body,
    data: { url: data.url },
    // example icon; replace with your app icon path if you have one
    icon: '/assets/logo-192.png',
    badge: '/assets/logo-96.png',
  };

  // @ts-ignore
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event: any) => {
  event.notification.close();
  const notificationUrl = (event.notification.data && event.notification.data.url) || '/';
  
  // Build the full URL based on the current origin
  // @ts-ignore
  const fullUrl = new URL(notificationUrl, self.location.origin).href;
  
  event.waitUntil(
    // @ts-ignore
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients: any[]) => {
      // First, try to find a client with the same origin and focus it
      for (const client of clients) {
        // @ts-ignore
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          // Navigate the existing client to the notification URL
          return client.focus().then(() => {
            // @ts-ignore
            return client.navigate ? client.navigate(fullUrl) : client;
          });
        }
      }
      // If no suitable client found, open a new window
      // @ts-ignore
      return self.clients.openWindow ? self.clients.openWindow(fullUrl) : Promise.resolve();
    })
  );
});

// Optionally handle pushsubscriptionchange to re-subscribe on VAPID key rotation
self.addEventListener('pushsubscriptionchange', (event: any) => {
  console.log('[sw] pushsubscriptionchange', event);
  // Ideally, re-subscribe and send to server here.
});
