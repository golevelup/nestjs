export function matchesRoutingKey(
  routingKey: string,
  pattern: string[] | string | undefined
): boolean {
  if (!pattern) return false;
  const patterns = Array.isArray(pattern) ? pattern : [pattern];
  for (const pattern of patterns) {
    const splitKey = routingKey.split('.');
    const splitPattern = pattern.split('.');

    for (let i = 0; i < splitPattern.length; i++) {
      if (splitPattern[i] === '#') return true;
      if (splitPattern[i] !== '*' && splitPattern[i] !== splitKey[i]) break;
    }

    if (splitKey.length === splitPattern.length) return true;
  }

  return false;
}
