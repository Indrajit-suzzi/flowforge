export function validate(values, rules) {
  const errors = {};
  for (const [field, rule] of Object.entries(rules)) {
    const val = values[field];
    const isStr = typeof val === 'string';
    if (rule.required && (val === undefined || val === null || (isStr && !val.trim()))) {
      errors[field] = rule.label ? `${rule.label} is required` : 'Required';
    } else if (val && rule.minLength && isStr && val.length < rule.minLength) {
      errors[field] = `${rule.label || 'This field'} must be at least ${rule.minLength} characters`;
    } else if (val && rule.maxLength && isStr && val.length > rule.maxLength) {
      errors[field] = `${rule.label || 'This field'} must be at most ${rule.maxLength} characters`;
    } else if (val && rule.pattern && isStr && !rule.pattern.test(val)) {
      errors[field] = rule.patternMessage || `Invalid format`;
    } else if (val && rule.url && isStr && !/^https?:\/\/.+/i.test(val)) {
      errors[field] = 'Must be a valid URL starting with http:// or https://';
    } else if (val && rule.email && isStr && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      errors[field] = 'Invalid email address';
    }
  }
  return errors;
}
