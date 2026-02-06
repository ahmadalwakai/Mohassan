/**
 * Auth Validators
 */

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('يجب أن تكون كلمة المرور 8 أحرف على الأقل');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('يجب أن تحتوي على حرف كبير');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('يجب أن تحتوي على حرف صغير');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('يجب أن تحتوي على رقم');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function isValidName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 100;
}
