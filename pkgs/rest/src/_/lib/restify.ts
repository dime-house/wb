export function restify(): string {
  return 'restify';
}

import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export function useExpressServer(path: string) {
  const pathToSSRServer = pathToFileURL(
    join(dirname(fileURLToPath(path)), 'server.ssr.mjs')
  ).toString();

  const app = express();
  const angularApp = new AngularNodeAppEngine();

  app.use('/**', (req, res, next) => {
    angularApp
      .handle(req)
      .then((response) =>
        response ? writeResponseToNodeResponse(response, res) : next()
      )
      .catch(next);
  });

  if (isMainModule(pathToSSRServer)) {
    const port = process.env['PORT'] || 4000;
    app.listen(port, () => {
      console.log(`Node Express server listening on http://localhost:${port}`);
    });
  }

  const reqHandler = createNodeRequestHandler(app);

  return { reqHandler, app };
}
