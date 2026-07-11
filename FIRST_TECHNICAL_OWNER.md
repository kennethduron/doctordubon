# Autorizar el primer Técnico operativo

Esta guía sirve para autorizar la cuenta existente de Kenneth Asael Duron Paz como primer Técnico operativo del sistema.

No agregues lógica de autopromoción en el frontend. El cambio debe hacerse manualmente desde Firebase Console o con el script local de Firebase Admin SDK usando credenciales privadas fuera del repositorio.

## Cuenta a autorizar

- Nombre: Kenneth Asael Duron Paz
- Correo: kennethduron.paz@gmail.com
- Rol visible: Técnico operativo
- Rol técnico: technical_owner
- Estado: active
- Clínica: clinic_dr_oscar_dubon
- Firebase Auth: emailVerified = true

## Método A: Manual desde Firebase Console

1. Ir a Firebase Console.
2. Entrar al proyecto correcto del sistema `Centro Financiero del Consultorio`.
3. Ir a Authentication -> Users.
4. Buscar el usuario con correo `kennethduron.paz@gmail.com`.
5. Copiar su UID.
6. Confirmar o marcar el correo como verificado si Firebase Console lo permite para ese usuario.
7. Ir a Firestore Database.
8. Abrir la colección `users`.
9. Abrir el documento con ese UID. El documento debe estar en `users/{uid}`.
10. Actualizar o confirmar estos campos:

```txt
id = UID copiado desde Firebase Authentication
clinicId = clinic_dr_oscar_dubon
name = Kenneth Asael Duron Paz
email = kennethduron.paz@gmail.com
role = technical_owner
status = active
updatedAt = timestamp del servidor o fecha/hora actual
```

11. Si el documento no existe, créalo con el ID exacto del UID copiado y agrega también `createdAt`.
12. Guardar cambios.
13. Cerrar sesión e iniciar sesión de nuevo en:

https://doctordubon.vercel.app/login

## Método B: Automático local con Firebase Admin SDK

Este método ejecuta `scripts/bootstrap-technical-owner.mjs` localmente. No usa el frontend, no modifica Firestore Rules y no sube credenciales al repositorio.

1. Ir a Firebase Console.
2. Entrar al proyecto correcto.
3. Ir a Project Settings.
4. Ir a Service accounts.
5. Seleccionar Generate new private key.
6. Guardar el archivo JSON en una ruta segura fuera del repositorio, por ejemplo:

```txt
C:\Users\user\Documents\firebase-keys\doctordubon-service-account.json
```

7. En PowerShell, configurar la variable local:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\user\Documents\firebase-keys\doctordubon-service-account.json"
```

8. Ejecutar el bootstrap:

```powershell
npm run bootstrap:technical-owner
```

9. Confirmar que el comando imprima:

```txt
Buscando usuario...
Usuario encontrado
UID: ...
Correo marcado como verificado
Perfil de Firestore actualizado
Técnico operativo activado correctamente
```

10. Cerrar sesión en la app.
11. Iniciar sesión de nuevo en:

https://doctordubon.vercel.app/login

12. Nunca subir el JSON a GitHub.

## Documento esperado

```js
users/{uid} = {
  id: uid,
  clinicId: "clinic_dr_oscar_dubon",
  name: "Kenneth Asael Duron Paz",
  email: "kennethduron.paz@gmail.com",
  role: "technical_owner",
  status: "active",
  createdAt: /* conservar si ya existe; si se crea manualmente, usar fecha/hora actual */,
  updatedAt: /* FieldValue.serverTimestamp() en el script o fecha/hora actual en consola */
}
```

En Firebase Authentication, el mismo usuario debe quedar con:

```txt
emailVerified = true
```

## Acceso esperado

Después de iniciar sesión nuevamente, el usuario debe ver todas las secciones:

- Dashboard
- Resumen financiero
- Ingresos
- Gastos
- Libro diario
- Reportes
- Usuarios y permisos
- Configuración

## Nota sobre correos de Firebase Authentication

Firebase Authentication puede enviar correos de verificación sin Resend. Esos correos pueden caer en spam porque salen desde infraestructura y dominios de Firebase, como `firebaseapp.com`.

Para correos más profesionales se puede configurar:

- plantillas de Firebase Authentication
- dominios autorizados en Firebase Authentication
- Resend en una fase posterior para invitaciones y correos personalizados

No implementar Resend todavía para verificación de correo.

## Seguridad

Este proceso no modifica las reglas de Firestore y no crea una puerta trasera en el frontend. La promoción inicial se hace con acceso administrativo al proyecto, ya sea desde Firebase Console o desde Firebase Admin SDK local.

Nunca subas el JSON de la service account, `.env.local` ni credenciales privadas al repositorio.
