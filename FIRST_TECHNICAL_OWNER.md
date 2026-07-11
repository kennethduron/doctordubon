# Autorizar el primer Técnico operativo

Esta guía sirve para autorizar manualmente la cuenta existente de Kenneth Asael Duron Paz como primer Técnico operativo del sistema.

No agregues lógica de autopromoción en el frontend. El cambio debe hacerse manualmente en Firebase Console o con credenciales administrativas privadas fuera del cliente.

## Cuenta a autorizar

- Nombre: Kenneth Asael Duron Paz
- Correo: kennethduron.paz@gmail.com
- Rol visible: Técnico operativo
- Rol técnico: technical_owner
- Estado: active
- Clínica: clinic_dr_oscar_dubon

## Pasos en Firebase Console

1. Ir a Firebase Console.
2. Entrar al proyecto correcto del sistema `Centro Financiero del Consultorio`.
3. Ir a Authentication -> Users.
4. Buscar el usuario con correo `kennethduron.paz@gmail.com`.
5. Copiar su UID.
6. Ir a Firestore Database.
7. Abrir la colección `users`.
8. Abrir el documento con ese UID. El documento debe estar en `users/{uid}`.
9. Actualizar o confirmar estos campos:

```txt
id = UID copiado desde Firebase Authentication
clinicId = clinic_dr_oscar_dubon
name = Kenneth Asael Duron Paz
email = kennethduron.paz@gmail.com
role = technical_owner
status = active
updatedAt = timestamp del servidor o fecha/hora actual
```

10. Si el documento no existe, créalo con el ID exacto del UID copiado y agrega también `createdAt`.
11. Guardar cambios.
12. Cerrar sesión e iniciar sesión de nuevo en:

https://doctordubon.vercel.app/login

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
  updatedAt: /* usar timestamp del servidor o fecha/hora actual */
}
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

## Seguridad

Este proceso no modifica las reglas de Firestore y no crea una puerta trasera en el frontend. La promoción inicial se hace desde Firebase Console con acceso administrativo al proyecto.