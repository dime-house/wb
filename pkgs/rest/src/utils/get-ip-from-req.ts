import { useEnv } from '@wb/env';
import { logWarn } from '@wb/log';
import { isIP } from 'net';
import express from 'express';

export function getIPFromReq(req: express.Request): string | null {
  const env = useEnv();

  let ip = req.ip;

  if (env['IP_CUSTOM_HEADER']) {
    const customIPHeaderValue = req.get(
      env['IP_CUSTOM_HEADER'] as string
    ) as unknown;

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
