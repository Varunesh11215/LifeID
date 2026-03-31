export const validateIndianPhone = (v) => /^\+91\s[6-9]\d{9}$/.test(v.trim());

export const formatIndianPhone = (raw) => {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return `+91 ${digits.slice(2)}`;
  if (digits.length === 10 && /^[6-9]/.test(digits)) return `+91 ${digits}`;
  return raw;
};
