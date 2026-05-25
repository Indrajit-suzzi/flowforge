export function validate(values, rules) {
  const errors = {};
  for (const [field, rule] of Object.entries(rules)) {
    const val = values[field];
    if (rule.required && (!val || (typeof val === 'string' && !val.trim()))) {
      errors[field] = rule.label ? `${rule.label} is required` : 'Required';
    } else if (val && rule.minLength && val.length < rule.minLength) {
      errors[field] = `${rule.label || 'This field'} must be at least ${rule.minLength} characters`;
    } else if (val && rule.maxLength && val.length > rule.maxLength) {
      errors[field] = `${rule.label || 'This field'} must be at most ${rule.maxLength} characters`;
    } else if (val && rule.pattern && !rule.pattern.test(val)) {
      errors[field] = rule.patternMessage || `Invalid format`;
    } else if (val && rule.url && !/^https?:\/\/.+/i.test(val)) {
      errors[field] = 'Must be a valid URL starting with http:// or https://';
    } else if (val && rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      errors[field] = 'Invalid email address';
    }
  }
  return errors;
}
