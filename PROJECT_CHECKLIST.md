# Checklist del Proyecto

## Producción

- [x] Variables reportadas como configuradas en Vercel para Production.
- [ ] Confirmar variables en Vercel para Preview.
- [x] URL final esperada: https://doctordubon.vercel.app
- [ ] Confirmar dominio autorizado en Firebase Auth: doctordubon.vercel.app
- [ ] Confirmar build final de Vercel después del próximo push.

## Firebase

- [x] Firebase Authentication integrado en el código.
- [x] Cloud Firestore integrado en el código.
- [ ] Publicar o confirmar publicación de `firestore.rules`.
- [ ] Publicar o confirmar publicación de `firestore.indexes.json`.
- [ ] Configurar manualmente el primer Técnico operativo en `users/{uid}`.
- [ ] Confirmar Email/Password habilitado en Firebase Authentication.

## Pruebas funcionales

- [ ] Probar registro y correo de verificación.
- [ ] Probar login.
- [ ] Probar cuenta pendiente.
- [ ] Probar cuenta deshabilitada.
- [ ] Probar aprobación de cuenta.
- [ ] Probar crear ingreso.
- [ ] Probar crear gasto.
- [ ] Probar libro diario.
- [ ] Probar reportes.
- [ ] Probar exportar PDF.
- [ ] Probar exportar Excel.
- [ ] Probar administración de usuarios por rol.
- [ ] Probar configuración del consultorio.
- [ ] Probar cerrar sesión.

## Seguridad por rol

- [ ] Confirmar que Admin no vea Usuarios ni Configuración.
- [ ] Confirmar que Admin no pueda editar ni eliminar movimientos.
- [ ] Confirmar que Dueño operativo no modifique Técnicos operativos.
- [ ] Confirmar que pending/disabled solo puedan leer su perfil.
- [ ] Confirmar que no exista delete físico de usuarios o movimientos.

## Responsive

- [ ] Probar en computadora.
- [ ] Probar en laptop.
- [ ] Probar en tablet.
- [ ] Probar en celular.
- [ ] Confirmar tablas y tarjetas sin desbordes.
- [ ] Confirmar navegación móvil filtrada por rol.
