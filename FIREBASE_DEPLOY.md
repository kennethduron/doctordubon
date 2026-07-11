# Publicar reglas e índices de Cloud Firestore

Vercel es el hosting de la aplicación web Next.js y sirve la URL pública `https://doctordubon.vercel.app`.

Firebase no se usa para hosting, dominio ni deploy del frontend. Firebase se usa para Authentication, Cloud Firestore y, en una fase futura, FCM/notificaciones push.

Vercel no publica las reglas ni los índices de Cloud Firestore automáticamente. Este paso debe ejecutarse manualmente contra el proyecto Firebase correcto.

## 1. Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

## 2. Iniciar sesión

```bash
firebase login
```

## 3. Vincular el proyecto correcto

El repositorio incluye `firebase.json`, pero no incluye `.firebaserc` porque el ID real del proyecto no debe inventarse.

```bash
firebase use --add
```

Selecciona el proyecto Firebase de producción y asigna un alias reconocible, por ejemplo `default`.

Si Firestore todavía no fue inicializado localmente, ejecuta:

```bash
firebase init firestore
```

Conserva los archivos existentes cuando el asistente pregunte:

- `firestore.rules`
- `firestore.indexes.json`

## 4. Publicar reglas

```bash
firebase deploy --only firestore:rules
```

Este comando solo publica reglas de Cloud Firestore. No publica la app web.

## 5. Publicar índices

```bash
firebase deploy --only firestore:indexes
```

Este comando solo publica índices de Cloud Firestore. No publica la app web.

## 6. Validación posterior obligatoria

Después de publicar:

- Confirmar que Email/Password esté habilitado en Firebase Authentication.
- Autorizar el dominio `doctordubon.vercel.app`.
- Configurar manualmente al primer usuario con rol `technical_owner` y estado `active` en `users/{uid}`.
- Probar registro y verificación de correo.
- Probar login de una cuenta `pending` y confirmar que solo vea el mensaje de espera.
- Probar una cuenta `disabled` y confirmar que no vea datos del consultorio.
- Probar aprobación de cuenta con Técnico operativo y Dueño operativo.
- Probar crear, editar y hacer soft delete de movimientos según cada rol.

No ejecutes estos comandos contra producción sin confirmar antes el proyecto seleccionado con `firebase use`.
