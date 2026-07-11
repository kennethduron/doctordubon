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
