export function matchesRoutingKey(
  routingKey: string,
  pattern: string[] | string | undefined
): boolean {
  if (!pattern) return false;
  const patterns = Array.isArray(pattern) ? pattern : [pattern];
  for (const pattern of patterns) {
    if (routingKey === pattern) return true;
    const splitKey = routingKey.split('.');
    const splitPattern = pattern.split('.');
    let starFailed = false;
    for (let i = 0; i < splitPattern.length; i++) {
      if (splitPattern[i] === '#') return true;

      if (splitPattern[i] !== '*' && splitPattern[i] !== splitKey[i]) {
        starFailed = true;
        break;
      }
    }

    if (!starFailed && splitKey.length === splitPattern.length) return true;
  }

  return false;
}
