const usernamePattern = /^[a-z0-9._-]{3,30}$/;

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase().replace(/^@+/, "");
}

export function isValidUsername(username: string) {
  return usernamePattern.test(normalizeUsername(username));
}

export function getUsernameValidationMessage(username: string) {
  const cleanUsername = normalizeUsername(username);

  if (!cleanUsername) return "Ingrese un usuario.";
  if (cleanUsername.length < 3) return "El usuario debe tener al menos 3 caracteres.";
  if (cleanUsername.length > 30) return "El usuario no puede tener más de 30 caracteres.";
  if (!usernamePattern.test(cleanUsername)) {
    return "El usuario solo puede contener letras, números, punto, guion bajo o guion medio.";
  }

  return null;
}
