# Alerta Sismo

Aplicación web para alertas de sismos con notificaciones push.

## Requisitos

- Node.js instalado
- Navegador moderno con soporte para Service Workers y Push API

## Instalación

1. Clonar el repositorio
2. Ejecutar `npm install` para instalar dependencias
3. Ejecutar `node server.js` para iniciar el servidor en http://localhost:3000

## Uso

- Abrir http://localhost:3000 en el navegador
- Hacer clic en "Suscribirse a Notificaciones" y aceptar el permiso
- Para emitir una alerta, hacer clic en "Emitir Alerta" e ingresar la contraseña de administrador

## Pruebas manuales

### Probar suscripción

- Abrir la consola del navegador para ver mensajes de registro
- Verificar que el service worker se registre correctamente
- Verificar que la suscripción se realice sin errores

### Probar envío de alerta

- Desde el navegador, hacer clic en "Emitir Alerta" e ingresar la contraseña (por defecto: admin123)
- Verificar que se reciba la notificación push en los dispositivos suscritos

## Pruebas con curl en PowerShell

Para enviar una alerta desde PowerShell, usar el siguiente comando (ajustar la URL si es necesario):

```powershell
$body = '{ "password": "admin123" }'
Invoke-RestMethod -Uri http://localhost:3000/send-alert -Method POST -Body $body -ContentType "application/json"
```

## Notas

- Las notificaciones push requieren HTTPS en producción (localhost está permitido sin HTTPS)
- Cambiar la contraseña de administrador en `server.js` para mayor seguridad
- En producción, usar una base de datos para almacenar suscripciones en lugar de memoria
