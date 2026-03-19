export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateFullName(fullName) {
  if (!fullName || !String(fullName).trim()) return "Full Name is required.";
  return null;
}

export function validateEmail(email) {
  if (!email || !String(email).trim()) return "Email is required.";
  if (!EMAIL_REGEX.test(String(email).trim())) return "Email format is invalid.";
  return null;
}

