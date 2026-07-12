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
