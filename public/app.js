const publicVapidKey = 'BAkuify_rdiZPKzKwo3AB3zOupOTjrpmVteEYlS29M1SgghOJsl8CRboZnC2n1lUCPJIRRevxXgd1zvZOQ8rUaY';

const subscribeBtn = document.getElementById('subscribe-btn');
const alertBtn = document.getElementById('alert-btn');
const statusText = document.getElementById('status');

if ('serviceWorker' in navigator && 'PushManager' in window) {
  navigator.serviceWorker.register('service-worker.js')
    .then(registration => {
      console.log('Service Worker registrado', registration);
      subscribeBtn.disabled = false;
    })
    .catch(err => {
      console.error('Error al registrar el Service Worker', err);
      statusText.textContent = 'Error al registrar el Service Worker.';
    });
} else {
  statusText.textContent = 'Las notificaciones push no son soportadas en este navegador.';
  subscribeBtn.disabled = true;
}

subscribeBtn.addEventListener('click', async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      subscribeUser();
    } else {
      statusText.textContent = 'Permiso de notificaciones denegado.';
    }
  } catch (error) {
    console.error('Error al solicitar permiso de notificaciones', error);
    statusText.textContent = 'Error al solicitar permiso de notificaciones.';
  }
});

alertBtn.addEventListener('click', () => {
  const password = prompt('Ingrese la contraseña de administrador:');
  if (!password) {
    statusText.textContent = 'Contraseña requerida para emitir alerta.';
    return;
  }
  fetch('/send-alert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ password })
  })
    .then(res => res.json())
    .then(data => {
      statusText.textContent = data.message;
    })
    .catch(err => {
      console.error('Error al enviar la alerta', err);
      statusText.textContent = 'Error al enviar la alerta.';
    });
});

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function subscribeUser() {
  navigator.serviceWorker.ready.then(registration => {
    const subscribeOptions = {
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    };

    registration.pushManager.subscribe(subscribeOptions)
      .then(subscription => {
        fetch('/subscribe', {
          method: 'POST',
          body: JSON.stringify(subscription),
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(res => {
          if (!res.ok) {
            throw new Error('Error en la respuesta del servidor: ' + res.status);
          }
          return res.json();
        })
        .then(data => {
          statusText.textContent = 'Suscripción exitosa.';
          subscribeBtn.style.display = 'none';
          alertBtn.style.display = 'inline-block';
        })
        .catch(err => {
          console.error('Error al guardar la suscripción', err);
          statusText.textContent = 'Error al guardar la suscripción: ' + err.message;
        });
      })
      .catch(err => {
        console.error('Error durante la suscripción', err);
        statusText.textContent = 'Error al suscribirse a las notificaciones: ' + err.message;
      });
  });
}
