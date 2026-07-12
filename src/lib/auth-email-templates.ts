import { APP_NAME, APP_URL, CLINIC_NAME, DOCTOR_NAME } from "@/lib/constants";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

type AuthEmailTemplateParams = {
  name?: string | null;
  actionUrl: string;
};

function baseEmail({ name, title, intro, buttonText, actionUrl, note }: AuthEmailTemplateParams & {
  title: string;
  intro: string;
  buttonText: string;
  note: string;
}) {
  const greeting = name?.trim() ? `Hola, ${escapeHtml(name.trim())}` : "Hola";
  const logoUrl = `${APP_URL}/images/doctordubon.jpg`;

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(APP_NAME)}</title>
  </head>
  <body style="margin:0;background:#eef7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef7fb;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #d9e6ef;border-radius:12px;overflow:hidden;box-shadow:0 16px 40px rgba(15,58,95,0.12);">
            <tr>
              <td style="padding:28px 28px 18px;text-align:center;background:#f8fcff;">
                <img src="${logoUrl}" width="84" height="84" alt="Dr. Oscar Dubon" style="border-radius:50%;border:4px solid #ffffff;display:block;margin:0 auto 14px;object-fit:cover;" />
                <div style="font-size:12px;font-weight:700;color:#12649b;text-transform:uppercase;">${escapeHtml(CLINIC_NAME)}</div>
                <h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;color:#0f172a;">${escapeHtml(title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 28px 8px;">
                <p style="margin:0 0 12px;font-size:16px;line-height:1.6;color:#334155;">${greeting},</p>
                <p style="margin:0;font-size:16px;line-height:1.7;color:#334155;">${escapeHtml(intro)}</p>
                <div style="text-align:center;margin:28px 0;">
                  <a href="${actionUrl}" style="display:inline-block;background:#0f4f7a;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;border-radius:8px;padding:14px 24px;">${escapeHtml(buttonText)}</a>
                </div>
                <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#64748b;">${escapeHtml(note)}</p>
                <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                <p style="word-break:break-all;margin:8px 0 0;font-size:12px;line-height:1.6;color:#12649b;">${actionUrl}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 28px 28px;">
                <div style="border-top:1px solid #e2e8f0;padding-top:18px;font-size:12px;line-height:1.6;color:#64748b;text-align:center;">
                  ${escapeHtml(APP_NAME)}<br />${escapeHtml(DOCTOR_NAME)}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildVerificationEmail(params: AuthEmailTemplateParams) {
  const intro = "Verifica tu correo para continuar con la solicitud de acceso al Centro Financiero del Consultorio.";

  return {
    subject: "Verifica tu cuenta del Centro Financiero",
    html: baseEmail({
      ...params,
      title: "Verifica tu cuenta",
      intro,
      buttonText: "Verificar mi cuenta",
      note: "Después de verificar tu correo, tu acceso quedará pendiente de aprobación por el responsable del sistema.",
    }),
    text: `${intro}\n\nVerificar mi cuenta: ${params.actionUrl}\n\nDespués de verificar tu correo, tu acceso quedará pendiente de aprobación.`,
  };
}

export function buildPasswordResetEmail(params: AuthEmailTemplateParams) {
  const intro = "Recibimos una solicitud para restablecer la contraseña de tu cuenta.";

  return {
    subject: "Restablece tu contraseña",
    html: baseEmail({
      ...params,
      title: "Restablecer contraseña",
      intro,
      buttonText: "Restablecer contraseña",
      note: "Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña actual seguirá funcionando.",
    }),
    text: `${intro}\n\nRestablecer contraseña: ${params.actionUrl}\n\nSi no solicitaste este cambio, puedes ignorar este correo.`,
  };
}
