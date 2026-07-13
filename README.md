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

## Acceso con correo o usuario

El inicio de sesión acepta el correo electrónico o el nombre de usuario normalizado. Cuando se usa el nombre de usuario, un endpoint server-side consulta el índice privado de nombres de usuario y entrega únicamente el correo necesario al cliente; Firebase Authentication continúa validando internamente el correo y la contraseña.

El nombre de usuario es un identificador visual y de acceso. Se guarda en minúsculas, omite un @ inicial, admite de 3 a 30 letras, números, puntos, guiones bajos o guiones medios y se reserva de forma transaccional para evitar duplicados. La colección de nombres de usuario no tiene lectura ni escritura directa desde el cliente.

## Configuración del registro con usuario

Para crear la identidad, el perfil y la reserva del nombre de usuario, Vercel debe tener configuradas en Producción las variables FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY y NEXT_PUBLIC_APP_URL. La clave privada puede guardarse con saltos de línea reales o con \n escapados. Después de agregar o cambiar cualquiera de estas variables, se debe hacer Redeploy.

La creación directa de perfiles y la colección privada de nombres de usuario están bloqueadas para el cliente. Publica las reglas ejecutando firebase deploy --only firestore:rules.

Si una identidad quedó creada sin perfil antes de esta corrección, elimínala en Firebase Console -> Authentication -> Users. Después comprueba, solo para cuentas de prueba o sin historial, users/{uid} y usernames/{username}. El registro actual intenta limpiar automáticamente una reserva usernames/{username} cuando confirma que ya no existe el usuario en Authentication ni el perfil users/{uid}; si Auth o el perfil todavía existen, el usuario se considera ocupado. No elimines perfiles que tengan actividad financiera.

## Notificaciones internas

El sistema incluye un centro de notificaciones interno basado en la colección `notifications` de Cloud Firestore. La campana del encabezado muestra notificaciones no leídas, permite revisar las más recientes y marcarlas como leídas.

Eventos cubiertos en esta fase:

- Nueva solicitud de acceso para responsables operativos.
- Cuenta aprobada para el usuario aprobado.
- Acceso habilitado para la cuenta reactivada.
- Cuenta deshabilitada mediante un aviso operativo genérico.
- Cuenta sin historial eliminada mediante un aviso operativo genérico.
- Ingreso o gasto registrado para responsables operativos.
- Movimiento retirado del listado activo para responsables operativos.

Estas notificaciones no son correos ni avisos push: funcionan únicamente en la campana del sistema después de iniciar sesión y no solicitan permisos del navegador. FCM queda reservado para una fase futura. Si se modifican `firestore.rules`, se deben publicar manualmente con `firebase deploy --only firestore:rules`.


## Administración de usuarios

La pantalla `Usuarios y permisos` permite revisar solicitudes pendientes, usuarios activos y usuarios deshabilitados.

- El Técnico operativo puede ver todos los usuarios, aprobar solicitudes, asignar roles permitidos, deshabilitar cuentas y habilitar cuentas deshabilitadas.
- El Dueño operativo ve su propia cuenta y su rol visible, y administra únicamente cuentas de Administrador: puede aprobar solicitudes, deshabilitar Administradores y habilitarlos nuevamente.
- El Dueño operativo no ve al Técnico operativo ni a otros Dueños operativos en listas, conteos ni detalles.
- El Administrador no accede a la administración de usuarios.

Las reglas de Firestore deben estar publicadas para que estas restricciones también apliquen en la base de datos.

## Eliminación segura de usuarios

La eliminación completa se ejecuta únicamente desde un endpoint server-side autenticado con Firebase Admin. El Técnico operativo puede eliminar cuentas de Dueño operativo o Administrador, excepto su propia cuenta y cualquier Técnico operativo. El Dueño operativo solo puede eliminar cuentas de Administrador visibles. El Administrador no administra usuarios.

Antes de borrar, el servidor revisa con consultas limitadas si la cuenta creó, editó o retiró movimientos, o si registró cambios importantes de configuración. Si existe cualquier historial, la cuenta no se elimina y debe deshabilitarse. Si no existe historial, se eliminan la identidad de acceso, el perfil y la reserva del nombre de usuario; las notificaciones históricas no se borran. No se requieren índices compuestos adicionales.

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

Las variables FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL y FIREBASE_ADMIN_PRIVATE_KEY también son obligatorias para resolver nombres de usuario, reservar usuarios únicos y eliminar cuentas sin historial.

Para mejorar entregabilidad y reducir spam, configura y verifica un dominio de envío propio en Resend. Sin dominio verificado, los correos pueden seguir llegando a spam aunque el diseño y el flujo estén listos.

## Publicación de reglas

Si se modifican permisos de usuarios o reglas de Firestore, publicar manualmente:

```bash
firebase deploy --only firestore:rules
```

Vercel no publica reglas de Firestore automáticamente.
