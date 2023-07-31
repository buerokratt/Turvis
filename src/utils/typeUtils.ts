export function isValue(variable: any): boolean {
  return typeof variable !== 'object' || variable === null;
}

export function isArray(variable: any) {
  return Array.isArray(variable);
}

export function isObject(variable: any): boolean {
  return typeof variable === 'object' && variable !== null;
}

export function isNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value);
}
