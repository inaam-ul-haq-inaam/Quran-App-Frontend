// audioUtils.js
export const pad = num => {
  if (num === 0 || num === '0') return '000';
  if (!num) return '000';
  return String(num).padStart(3, '0');
};
