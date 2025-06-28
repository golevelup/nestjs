import {
  RabbitMQUriConfig,
  RabbitMQUriConfigObject,
} from '../rabbitmq.interfaces';

export function matchesRoutingKey(
  routingKey: string,
  pattern: string[] | string | undefined,
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

/**
 * Validates a rabbitmq uri
 * @see https://www.rabbitmq.com/docs/uri-spec#the-amqps-uri-scheme
 * @param uri
 * @returns
 */
export const validateRabbitMqUris = (uri: string[]) => {
  for (const u of uri) {
    const rmqUri = new URL(u);

    if (!rmqUri.protocol.startsWith('amqp')) {
      throw new Error('RabbitMQ URI protocol must start with amqp or amqps');
    }
  }
};

export const converUriConfigObjectsToUris = (
  uri: RabbitMQUriConfig | RabbitMQUriConfig[],
): string[] => {
  const uris = [uri].flat();

  return uris.map((u) => {
    if (typeof u == 'string') return u;
    return amqplibUriConfigToUrl(u);
  });
};

const amqplibUriConfigToUrl = ({
  host,
  username,
  password,
  frameMax,
  heartbeat,
  protocol = 'amqp',
  vhost = '/',
  port = 5672,
}: RabbitMQUriConfigObject): string => {
  if (!host) {
    throw new Error("Configuration object must contain a 'host' key.");
  }

  const auth =
    username && password
      ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`
      : '';

  const params = new URLSearchParams();
  if (frameMax) params.set('frameMax', frameMax.toString());
  if (heartbeat) params.set('heartbeat', heartbeat.toString());

  return `${protocol}://${auth}${host}:${port}${vhost}?${params.toString()}`;
};
