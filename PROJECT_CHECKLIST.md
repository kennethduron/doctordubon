# Checklist del Proyecto

## Producción

- [x] Variables reportadas como configuradas en Vercel para Production.
- [ ] Confirmar variables en Vercel para Preview.
- [x] URL final esperada: https://doctordubon.vercel.app
- [x] Hosting definido en Vercel, no Firebase Hosting.
- [ ] Confirmar dominio autorizado en Firebase Auth: doctordubon.vercel.app
- [x] Build final local confirmado para producción.

## Firebase

- [x] Firebase Authentication integrado en el código.
- [x] Cloud Firestore integrado en el código.
- [x] `firebase.json` limitado a reglas e índices de Firestore, sin sección `hosting`.
- [ ] Publicar o confirmar publicación de `firestore.rules`.
- [ ] Publicar o confirmar publicación de `firestore.indexes.json`.
- [x] Primer Técnico operativo activo según confirmación operativa.
- [ ] Confirmar Email/Password habilitado en Firebase Authentication.
- [x] FCM/notificaciones push queda como funcionalidad futura, sin implementación actual.

## Pruebas funcionales

- [x] Probar registro y correo de verificación.
- [x] Probar login.
- [x] Probar cuenta pendiente.
- [ ] Probar cuenta deshabilitada.
- [ ] Probar aprobación de cuenta.
- [ ] Probar crear ingreso con datos reales.
- [ ] Probar crear gasto con datos reales.
- [x] Revisar libro diario y flujo de edición/eliminación lógica.
- [x] Revisar reportes y estados vacíos.
- [x] Revisar exportar PDF.
- [x] Revisar exportar Excel.
- [x] Revisar administración de usuarios por rol.
- [x] Revisar configuración del consultorio.
- [ ] Probar cerrar sesión en producción.

## Seguridad por rol

- [x] Confirmar que Admin no vea Usuarios ni Configuración en navegación.
- [x] Confirmar que Admin no pueda entrar manualmente a Usuarios ni Configuración.
- [x] Confirmar que Admin no pueda editar ni eliminar movimientos.
- [x] Confirmar que Dueño operativo no modifique Técnicos operativos.
- [x] Confirmar que pending/disabled solo puedan leer su perfil.
- [x] Confirmar que no exista delete físico de usuarios o movimientos.

## Responsive

- [x] Revisar layout de computadora.
- [x] Revisar layout de tablet por estructura responsive.
- [x] Revisar layout de celular por navegación móvil y tarjetas.
- [x] Confirmar formularios en una columna en móvil.
- [x] Confirmar tablas con scroll o tarjetas en móvil.
- [x] Confirmar navegación móvil filtrada por rol.

## Pendiente de aceptación presencial

- [ ] Crear ingreso real frente al Dr. Oscar Dubon.
- [ ] Crear gasto real frente al Dr. Oscar Dubon.
- [ ] Exportar PDF real y revisar contenido descargado.
- [ ] Exportar Excel real y revisar hojas descargadas.
- [ ] Confirmar reglas e índices publicados en Firebase Console.
