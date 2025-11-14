import webpush from 'web-push';

const [,, subscriptionArg, payloadArg] = process.argv;

const vapidPublic = process.env.VAPID_PUBLIC_KEY;
const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

if (!vapidPublic || !vapidPrivate) {
  console.error('Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables.');
  process.exit(1);
}

if (!subscriptionArg) {
  console.error('Provide subscription JSON as first argument.');
  process.exit(1);
}

const subscription = JSON.parse(subscriptionArg);
const payload = payloadArg || JSON.stringify({ title: 'Test', body: 'This is a test push', url: '/' });

webpush.setVapidDetails('mailto:you@example.com', vapidPublic, vapidPrivate);

webpush.sendNotification(subscription, payload)
  .then((res) => {
    console.log('Push sent', res.statusCode);
  })
  .catch((err) => {
    console.error('Error sending push', err);
  });
