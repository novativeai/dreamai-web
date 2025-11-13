/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * Validate age (must be 18+)
 */
export function isValidAge(age: number): boolean {
  return age >= 18 && age <= 120;
}

/**
 * Validate required field
 */
export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}
