export function matchesRoutingKey(
  routingKey: string,
  pattern: string[] | string | undefined
): boolean {
  // An empty string is a valid pattern therefore
  // we should only exclude null values and empty array
  if (pattern === undefined || (Array.isArray(pattern) && pattern.length === 0))
    return false;

  const patterns = Array.isArray(pattern) ? pattern : [pattern];
  for (const p of patterns) {
    if (routingKey === p) return true;
    const splitKey = routingKey.split('.');
    const splitPattern = p.split('.');
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
