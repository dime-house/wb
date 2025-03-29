import { useEnv } from '@dime/env';
import { logWarn } from '@dime/log';
import { isIP } from 'net';
import http from 'http';

export function getIPFromReq(req: http.IncomingMessage): string {
  const env = useEnv();

  let ip = req.ip;

  if (env['IP_CUSTOM_HEADER']) {
    const customIPHeaderValue = req.headers[env['IP_CUSTOM_HEADER']] as unknown;

    if (
      typeof customIPHeaderValue === 'string' &&
      isIP(customIPHeaderValue) !== 0
    ) {
      ip = customIPHeaderValue;
    } else {
      logWarn(
        `Custom IP header didn't return valid IP address: ${JSON.stringify(
          customIPHeaderValue
        )}`
      );
    }
  }

  return ip?.startsWith('::ffff:') ? ip.substring(7) : ip ?? null;
}
