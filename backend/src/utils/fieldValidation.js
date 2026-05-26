export const validateField = (field, value) => {
  const errors = [];

  if (field.required && (value === undefined || value === null || value === '')) {
    errors.push(`"${field.label || field.name}" is required`);
    return errors;
  }

  if (value === undefined || value === null || value === '') return errors;

  const str = String(value);

  if (field.type === 'String' || field.type === 'RichText') {
    if (field.minLength && str.length < field.minLength) {
      errors.push(`"${field.label || field.name}" must be at least ${field.minLength} characters`);
    }
    if (field.maxLength && str.length > field.maxLength) {
      errors.push(`"${field.label || field.name}" must be at most ${field.maxLength} characters`);
    }
    if (field.pattern) {
      try {
        const regex = new RegExp(field.pattern);
        if (!regex.test(str)) {
          errors.push(field.patternMessage || `"${field.label || field.name}" does not match required pattern`);
        }
      } catch {
        errors.push(`"${field.label || field.name}" has an invalid validation pattern`);
      }
    }
  }

  if (field.type === 'Number') {
    const num = Number(value);
    if (field.min !== undefined && num < Number(field.min)) {
      errors.push(`"${field.label || field.name}" must be at least ${field.min}`);
    }
    if (field.max !== undefined && num > Number(field.max)) {
      errors.push(`"${field.label || field.name}" must be at most ${field.max}`);
    }
  }

  return errors;
};

export const validateEntry = (fields, data) => {
  const allErrors = [];
  for (const field of fields) {
    const fieldErrors = validateField(field, data[field.name]);
    allErrors.push(...fieldErrors);
  }
  return allErrors;
};
