const express = require('express');
const webpush = require('web-push');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// VAPID keys (generate your own for production)
const vapidKeys = {
  publicKey: 'BAkuify_rdiZPKzKwo3AB3zOupOTjrpmVteEYlS29M1SgghOJsl8CRboZnC2n1lUCPJIRRevxXgd1zvZOQ8rUaY',
  privateKey: 'Gv2azuPwggDkFXfsC7VKnRqdPP2rjchMIWP4PpPUExY'
};

webpush.setVapidDetails(
  'mailto:alerta-sismo@university.edu',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// In-memory storage for subscriptions (use a database in production)
let subscriptions = [];

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve service-worker.js explicitly to fix 404 error
app.get('/service-worker.js', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'service-worker.js'));
});

// Route to subscribe to notifications
app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ message: 'Suscripción inválida' });
  }
  // Evitar suscripciones duplicadas
  const exists = subscriptions.find(sub => sub.endpoint === subscription.endpoint);
  if (!exists) {
    subscriptions.push(subscription);
  }
  res.status(201).json({ message: 'Suscripción exitosa' });
});

const ADMIN_PASSWORD = 'admin123'; // Change this to a secure password

// Route to send alert to all subscribers with admin authentication
app.post('/send-alert', (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) {
    return res.status(403).json({ message: 'Unauthorized: Incorrect password' });
  }

  const payload = JSON.stringify({
    title: 'Alerta Sismo',
    body: '¡Alerta de sismo! Tome precauciones.',
    icon: '/icon.png'
  });

  const promises = subscriptions.map(sub =>
    webpush.sendNotification(sub, payload).catch(err => console.error(err))
  );

  Promise.all(promises).then(() =>
    res.status(200).json({ message: 'Alert sent to all subscribers' })
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
