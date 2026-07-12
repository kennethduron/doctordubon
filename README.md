# Centro Financiero del Consultorio

Libro Diario Digital para el Consultorio Dr. Oscar Dubon.

URL de producción:

https://doctordubon.vercel.app

## Comandos de validación

```bash
npm run build
npx tsc --noEmit
npx eslint src
```

## Vercel

Vercel es el único hosting de la app Next.js y sirve todas las rutas del sistema desde el dominio gratuito:

https://doctordubon.vercel.app

El repositorio está conectado a Vercel. Si el build pasa correctamente y las variables de entorno están configuradas, Vercel publica automáticamente con cada `git push` a `main`.

## Firebase

Firebase se usa para Authentication, verificación de correo, recuperación de contraseña y Cloud Firestore. También queda reservado para FCM/notificaciones push en una fase futura.

Firebase no se usa como hosting, dominio ni deploy de la app web. Vercel no publica reglas ni índices de Firestore automáticamente. Revisa `FIREBASE_DEPLOY.md` para publicar:

- `firestore.rules`
- `firestore.indexes.json`

## Notificaciones internas

El sistema incluye un centro de notificaciones interno basado en la colección `notifications` de Cloud Firestore. La campana del encabezado muestra notificaciones no leídas, permite revisar las más recientes y marcarlas como leídas.

Eventos cubiertos en esta fase:

- Nueva solicitud de acceso para responsables operativos.
- Cuenta aprobada para el usuario aprobado.
- Ingreso o gasto registrado para responsables operativos.
- Movimiento retirado del listado activo para responsables operativos.

Esta fase no usa FCM, notificaciones push del navegador ni permisos del navegador. Las notificaciones son visibles únicamente dentro del sistema después de iniciar sesión. Si se modifican `firestore.rules`, se deben publicar manualmente con `firebase deploy --only firestore:rules`.


## Administración de usuarios

La pantalla `Usuarios y permisos` permite revisar solicitudes pendientes, usuarios activos y usuarios deshabilitados.

- El Técnico operativo puede ver todos los usuarios, aprobar solicitudes, asignar roles permitidos, deshabilitar cuentas y habilitar cuentas deshabilitadas.
- El Dueño operativo administra únicamente cuentas de Administrador: puede aprobar solicitudes, deshabilitar Administradores y habilitarlos nuevamente.
- El Dueño operativo no ve al Técnico operativo en listas, conteos ni detalles.
- El Administrador no accede a la administración de usuarios.

Las reglas de Firestore deben estar publicadas para que estas restricciones también apliquen en la base de datos.

## Checklist

Revisa `PROJECT_CHECKLIST.md` antes de entregar el sistema.

## Configuración obligatoria en Firebase Auth

En Firebase Console, revisa `Authentication` -> `Settings` -> `Authorized domains` y confirma que esté autorizado:

- `doctordubon.vercel.app`

En Vercel, revisa `Project Settings` -> `Environment Variables` y confirma:

```bash
NEXT_PUBLIC_APP_URL=https://doctordubon.vercel.app
```

Después de cambiar variables de entorno en Vercel, haz redeploy para que Next.js incluya el valor público correcto en el build.

Los correos de verificación y recuperación los envía Firebase Authentication. La personalización visual se realiza en Firebase Console -> `Authentication` -> `Templates`.

## Correos profesionales

El flujo principal de verificación y recuperación usa Firebase Admin del lado servidor para generar códigos seguros y Resend para enviar correos HTML con la marca del consultorio. El flujo nativo de Firebase Authentication queda como respaldo si las variables server-side no están configuradas.

Variables necesarias en Vercel:

```bash
RESEND_API_KEY=
RESEND_FROM_EMAIL="Centro Financiero del Consultorio <notificaciones@tudominio.com>"
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
NEXT_PUBLIC_APP_URL=https://doctordubon.vercel.app
```

`FIREBASE_ADMIN_PRIVATE_KEY` debe guardarse solo en Vercel, con saltos de línea escapados como `\n` si Vercel lo requiere. No se debe subir al repositorio.

Para mejorar entregabilidad y reducir spam, configura y verifica un dominio de envío propio en Resend. Sin dominio verificado, los correos pueden seguir llegando a spam aunque el diseño y el flujo estén listos.

## Publicación de reglas

Si se modifican permisos de usuarios o reglas de Firestore, publicar manualmente:

```bash
firebase deploy --only firestore:rules
```

Vercel no publica reglas de Firestore automáticamente.
