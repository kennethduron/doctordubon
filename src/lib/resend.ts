export function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export function getResendPlaceholder() {
  return {
    ready: isResendConfigured(),
    message: "Resend se conectara para correos personalizados en la siguiente fase.",
  };
}

