# Centro Financiero del Consultorio

Libro Diario Digital para el Consultorio Dr. Oscar Dubon.

URL de producción esperada:

https://doctordubon.vercel.app

## Comandos de validación

```bash
npm run build
npx tsc --noEmit
npx eslint src
```

## Vercel

El repositorio ya está conectado a Vercel. Si el build pasa correctamente y las variables de entorno están configuradas, Vercel debe publicar automáticamente en la URL de producción.

## Firebase

Vercel no publica reglas ni índices de Firestore automáticamente. Revisa `FIREBASE_DEPLOY.md` para publicar:

- `firestore.rules`
- `firestore.indexes.json`

## Checklist

Revisa `PROJECT_CHECKLIST.md` antes de entregar el sistema.