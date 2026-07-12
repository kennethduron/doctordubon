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
- [x] Registro y correo de verificación probados.
- [x] Estado de cuenta pendiente probado.
- [x] Dashboard probado.
- [x] Sidebar probado.
- [x] Topbar probado.
- [x] Navegación móvil probada.
- [x] Acceso a Usuarios y permisos protegido por rol.
- [x] Acceso a Configuración protegido por rol.
- [ ] Probar una cuenta deshabilitada en el flujo final.
- [ ] Probar cerrar sesión nuevamente durante la aceptación final.

## Datos y seguridad

- [x] Autenticación y base de datos integradas.
- [x] `firebase.json` limitado a reglas e índices, sin configuración de hosting.
- [x] El Administrador no puede administrar usuarios ni configuración.
- [x] El Administrador no puede editar ni eliminar movimientos.
- [x] El Dueño operativo solo puede administrar Administradores.
- [x] El Dueño operativo no puede modificar ni deshabilitar al Técnico operativo.
- [x] Solo el Técnico operativo puede asignar roles de mayor acceso.
- [x] Las cuentas pendientes o deshabilitadas solo pueden consultar su propio perfil.
- [x] No existe eliminación física de usuarios ni movimientos.
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
- [ ] FCM: fase futura para notificaciones; no implementado en esta entrega.
