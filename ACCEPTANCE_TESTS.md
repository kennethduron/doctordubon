# Pruebas automatizadas de aceptación

Estas pruebas usan Playwright para validar el flujo principal del sistema en producción o en un entorno local.

## Variables requeridas

Configura las variables en `.env.local` o en la sesión de la terminal. No guardes credenciales reales en archivos versionados.

```powershell
$env:TEST_BASE_URL="https://doctordubon.vercel.app"
$env:TEST_TECH_EMAIL="correo-del-tecnico@ejemplo.com"
$env:TEST_TECH_PASSWORD="contrasena-del-tecnico"
```

`TEST_BASE_URL` es opcional. Si no se define, las pruebas usan:

```text
https://doctordubon.vercel.app
```

Si faltan `TEST_TECH_EMAIL` o `TEST_TECH_PASSWORD`, las pruebas públicas se ejecutan y el flujo autenticado se omite con el mensaje:

```text
Faltan TEST_TECH_EMAIL y TEST_TECH_PASSWORD.
```

## Comandos

```powershell
npm run test:acceptance
```

Para ver el navegador:

```powershell
npm run test:acceptance:headed
```

## Alcance

Las pruebas cubren:

- Rutas públicas: `/`, `/health`, `/login`, `/registro`, `/recuperar-contrasena`.
- Login del Técnico operativo.
- Dashboard.
- Creación de ingreso y gasto de prueba.
- Libro diario.
- Exportación PDF y Excel.
- Reportes.
- Usuarios y permisos.
- Configuración.
- Responsive básico en desktop, tablet y mobile.
- Cerrar sesión.

## Datos de prueba

El flujo autenticado crea movimientos con estas descripciones:

```text
Prueba automatizada - ingreso
Prueba automatizada - gasto
```

Al finalizar, la prueba intenta hacer soft delete únicamente sobre registros con esas descripciones. No debe eliminar ni modificar registros reales que no sean de prueba.

## Seguridad

- No se usa Resend.
- No se implementa FCM.
- No se cambian roles reales.
- No se guardan credenciales en el repositorio.
- No se debe subir `.env.local`.
