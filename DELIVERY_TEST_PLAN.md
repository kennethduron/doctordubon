# Plan de prueba para aceptación de entrega

## Objetivo

Validar el flujo real del Dr. Oscar Dubon antes de aceptar la entrega del Centro Financiero del Consultorio.

## Preparación

- Tener disponible la cuenta activa del Técnico operativo.
- Usar el correo real que el doctor utilizará en el sistema.
- Tener a mano un ingreso y un gasto de prueba con datos autorizados por el doctor.
- Realizar la prueba en https://doctordubon.vercel.app

## Prueba manual

1. **Crear la cuenta del doctor.** En Registro, ingresar el nombre, usuario visible, correo y contraseña del Dr. Oscar Dubon. Verificar el correo si el sistema lo solicita.
2. **Verificar que quede pendiente.** Iniciar sesión con la cuenta recién creada y confirmar que se muestre el mensaje de cuenta pendiente de aprobación.
3. **Entrar como Técnico operativo.** Cerrar la sesión del doctor e iniciar sesión con la cuenta del Técnico operativo.
4. **Abrir Usuarios y permisos.** Confirmar que la cuenta del doctor aparezca en “Solicitudes pendientes”.
5. **Aprobar al doctor.** Usar la acción “Aprobar acceso” y confirmar que la cuenta pase a “Usuarios activos”.
6. **Asignar el rol Dueño operativo.** Seleccionar “Dueño operativo” para la cuenta del Dr. Oscar Dubon y verificar que el nombre del rol quede visible correctamente.
7. **Entrar como doctor.** Cerrar la sesión del Técnico operativo e iniciar sesión con la cuenta del doctor. Confirmar acceso al Dashboard.
8. **Crear un ingreso.** Registrar un ingreso de prueba y comprobar que aparezca en los totales y listados correspondientes.
9. **Crear un gasto.** Registrar un gasto de prueba y comprobar que aparezca en los totales y listados correspondientes.
10. **Ver el libro diario.** Confirmar que el ingreso y el gasto se muestren con fecha, categoría, descripción, método de pago y monto correctos.
11. **Generar un reporte.** Elegir un período que incluya ambos movimientos y comprobar los totales.
12. **Exportar PDF.** Descargar el reporte en PDF, abrirlo y revisar encabezado, fechas, movimientos y totales.
13. **Exportar Excel.** Descargar el reporte en Excel, abrirlo y revisar hojas, columnas, movimientos y totales.
14. **Probar en celular.** Repetir la navegación principal en un teléfono: Dashboard, ingreso, gasto, libro diario, reportes y menú móvil.
15. **Confirmar la protección del Técnico operativo.** Desde la cuenta del doctor, abrir Usuarios y permisos y comprobar que no puede cambiar el rol, deshabilitar ni eliminar al Técnico operativo.

## Criterio de aceptación

La entrega puede aceptarse cuando los 15 pasos finalicen sin errores que impidan el trabajo diario, los datos exportados sean correctos y la cuenta del doctor conserve el rol “Dueño operativo” con estado activo.

## Fuera de alcance de esta aceptación

- Correos personalizados mediante Resend: fase futura.
- Notificaciones push mediante FCM o permisos del navegador: fase futura. El centro interno de notificaciones en Firestore sí forma parte de esta entrega.

## Correos del sistema

Los correos de verificación y recuperación son enviados por Firebase Authentication. Para una presentación de correo más personalizada con la marca Dr. Dubon se recomienda una fase futura con Resend o una configuración avanzada de plantillas.

## Configuración obligatoria en Firebase Auth

Antes de probar registro, verificación de correo o recuperación de contraseña, confirmar:

- Firebase Console -> Authentication -> Settings -> Authorized domains incluye `doctordubon.vercel.app`.
- Vercel -> Project Settings -> Environment Variables incluye `NEXT_PUBLIC_APP_URL=https://doctordubon.vercel.app`.
- Si se cambia `NEXT_PUBLIC_APP_URL`, hacer redeploy en Vercel antes de probar.
- Firebase Console -> Authentication -> Templates permite personalizar las plantillas de verificación y recuperación en una fase de presentación.

## Prueba de correos profesionales

- Confirmar en Vercel `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL` y `FIREBASE_ADMIN_PRIVATE_KEY`.
- Confirmar que Resend tenga un dominio de envío verificado para mejorar entregabilidad.
- Crear una cuenta nueva y comprobar que el correo de verificación tenga botón “Verificar mi cuenta”.
- Verificar que el botón abra `/verificar-correo` dentro del sistema.
- Solicitar recuperación de contraseña y comprobar que el botón abra `/restablecer-contrasena` dentro del sistema.
- Si las variables de Resend o Firebase Admin faltan, confirmar que el flujo de Firebase Authentication siga funcionando como respaldo.

## Reglas de usuarios

Después de esta fase, publicar reglas de Firestore para que el Dueño operativo no pueda leer documentos del Técnico operativo:

```bash
firebase deploy --only firestore:rules
```

## Prueba de notificaciones internas

- Crear una cuenta nueva y confirmar que el Técnico operativo vea en la campana la notificación “Nueva solicitud de acceso”.
- Aprobar una cuenta y confirmar que el usuario aprobado vea “Acceso aprobado” al iniciar sesión.
- Registrar un ingreso y un gasto; confirmar que los responsables operativos vean las notificaciones correspondientes.
- Retirar un movimiento del listado activo y confirmar la notificación “Movimiento eliminado”.
- Usar “Marcar todas como leídas” y confirmar que el contador de la campana quede en cero.
- Entrar como Dueño operativo y confirmar que no aparecen notificaciones relacionadas con el Técnico operativo.

Después de publicar esta fase, desplegar reglas de Firestore:

```bash
firebase deploy --only firestore:rules
```