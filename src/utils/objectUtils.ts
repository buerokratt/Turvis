export function hasSingleKey(obj: object): boolean {
  const keys = Object.keys(obj);
  return keys.length === 1;
}

export function mapToKeyValue(obj: Record<string, any>): { key: string; value: any } | null {
  const keys = Object.keys(obj);
  if (keys.length === 1) {
    const key = keys[0];
    const value = obj[key];
    return { key, value };
  }
  return null;
}

export function hasElement(object: any, key: string): boolean {
  const keys = Object.keys(object);
  if (keys.includes(key)) {
    return true;
  }
  return false;
}

export function hasElements(object: any, keys: string[]): boolean {
  const objectKeys = Object.keys(object);
  const hasAllKeys = keys.every((key) => objectKeys.includes(key));
  return hasAllKeys;
}

export function canConvertToString(value: any): boolean {
  if (typeof value === 'string') {
    return true; // Already a string
  }

  if (typeof value.toString === 'function') {
    const stringValue = value.toString();
    return typeof stringValue === 'string';
  }

  return false;
}

export function isJSON(value: any): boolean {
  try {
    JSON.parse(value);
    return true;
  } catch (error) {
    return false;
  }
}
