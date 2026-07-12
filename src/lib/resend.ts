type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

export function getResendPlaceholder() {
  return {
    ready: isResendConfigured(),
    message: "Resend está listo para correos personalizados cuando las variables estén configuradas.",
  };
}

export async function sendResendEmail({ to, subject, html, text }: SendEmailParams) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    throw new Error("Resend no está configurado.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend no pudo enviar el correo: ${response.status} ${details}`);
  }

  return response.json() as Promise<{ id: string }>;
}
