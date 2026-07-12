# Checklist del Proyecto

## Producción y presentación

- [x] Producción funcionando en Vercel.
- [x] URL pública funcionando: https://doctordubon.vercel.app
- [x] Vercel confirmado como hosting; Firebase Hosting no se utiliza.
- [x] Favicon publicado y respondiendo correctamente.
- [x] Metadatos Open Graph e imagen social publicados y respondiendo correctamente.
- [x] Build local de producción confirmado.
- [ ] Confirmar variables del entorno Preview, si se utilizará para pruebas futuras.
- [ ] Confirmar manualmente el dominio autorizado para inicio de sesión.

## Acceso y navegación

- [x] Técnico operativo activo según confirmación operativa.
- [x] Login probado.
- [x] Login por correo o nombre de usuario implementado.
- [x] Registro con nombre de usuario único y normalizado implementado.
- [x] Registro y correo de verificación probados.
- [x] Estado de cuenta pendiente probado.
- [x] Dashboard probado.
- [x] Sidebar probado.
- [x] Topbar probado.
- [x] Navegación móvil probada.
- [x] Acceso a Usuarios y permisos protegido por rol.
- [x] Acceso a Configuración protegido por rol.
- [x] Usuarios deshabilitados muestran acción “Habilitar” cuando corresponde.
- [ ] Probar una cuenta deshabilitada en el flujo final.
- [ ] Probar en producción login por usuario y eliminación de una cuenta sin historial.
- [ ] Confirmar que una cuenta con historial no puede eliminarse.
- [ ] Probar cerrar sesión nuevamente durante la aceptación final.

## Datos y seguridad

- [x] Autenticación y base de datos integradas.
- [x] `firebase.json` limitado a reglas e índices, sin configuración de hosting.
- [x] El Administrador no puede administrar usuarios ni configuración.
- [x] El Administrador no puede editar ni eliminar movimientos.
- [x] El Dueño operativo ve su propia cuenta y el rol visible “Dueño operativo”.
- [x] El Dueño operativo solo puede administrar Administradores.
- [x] El Dueño operativo puede habilitar Administradores deshabilitados.
- [x] El Dueño operativo no ve ni puede modificar al Técnico operativo ni a otros Dueños operativos.
- [x] Solo el Técnico operativo puede asignar roles de mayor acceso.
- [x] Las cuentas pendientes o deshabilitadas solo pueden consultar su propio perfil.
- [x] Los usuarios sin historial pueden eliminarse únicamente mediante el endpoint server-side autorizado.
- [x] Los usuarios con historial financiero o actividad importante solo pueden deshabilitarse.
- [x] No existe eliminación física de movimientos.
- [x] La colección privada de nombres de usuario evita duplicados y no permite acceso directo desde cliente.
- [x] Reglas locales agregadas para `notifications`: lectura por rol, marcado como leído y sin borrado físico desde cliente.
- [ ] Confirmar manualmente que `firestore.rules` está publicado en el proyecto de producción.
- [ ] Confirmar manualmente que `firestore.indexes.json` está publicado en el proyecto de producción.

## Funciones operativas revisadas

- [x] Crear ingresos y gastos disponible para usuarios activos autorizados.
- [x] Libro diario y edición o retiro de movimientos revisados.
- [x] Reportes y estados vacíos revisados.
- [x] Exportación a PDF revisada.
- [x] Exportación a Excel revisada.
- [x] Configuración del consultorio revisada.
- [x] Diseño de computadora, tablet y celular revisado.

## Pendiente para aceptación final

- [ ] Prueba real del Dr. Oscar Dubon creando su cuenta.
- [ ] Verificar que la cuenta del Dr. Oscar Dubon quede pendiente.
- [ ] Asignar al Dr. Oscar Dubon el rol Dueño operativo mediante el Técnico operativo.
- [ ] Aprobar y mantener activa la cuenta del Dr. Oscar Dubon.
- [ ] Realizar prueba presencial de ingreso, gasto, libro diario y reporte.
- [ ] Exportar y revisar presencialmente un PDF con datos reales.
- [ ] Exportar y revisar presencialmente un Excel con datos reales.
- [ ] Confirmar en celular que el flujo principal sea cómodo para el doctor.
- [ ] Confirmar con la cuenta del doctor que no puede modificar al Técnico operativo.
- [ ] Resend: fase futura para correos personalizados; no implementado en esta entrega.
- [x] Centro interno de notificaciones implementado con Firestore.
- [ ] FCM y notificaciones push del navegador: fase futura; no implementado en esta entrega.
