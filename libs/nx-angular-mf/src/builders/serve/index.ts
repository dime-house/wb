import {
  BuilderContext,
  createBuilder,
  targetFromTargetString,
} from '@angular-devkit/architect';
import { normalizeOptions } from '@angular-devkit/build-angular/src/builders/dev-server/options';
import {
  serveWithVite,
  buildApplicationInternal,
} from '@angular/build/private';
import { Plugin } from 'esbuild';

import { ServeExecutorSchema } from './schema';
import { BuildExecutorSchema } from '../build/schema';
import {
  deepMergeObject,
  getMapName,
  getPathForRegister,
  indexHtml,
  loadModule,
  patchBuilderContext,
  prepareConfig
} from '../helpers';
import { entryPointForExtendDependencies, importMapConfigPlugin } from '../es-plugin';
import { register } from 'node:module';

const { port1, port2 } = new MessageChannel();


function getBuilderAction() {
  return async function* (options, context, pluginsOrExtensions) {

    let extensions;
    if (pluginsOrExtensions && Array.isArray(pluginsOrExtensions)) {
      extensions = {
        codePlugins: pluginsOrExtensions,
      };
    } else {
      extensions = pluginsOrExtensions;
    }

    for await (const result of buildApplicationInternal(
      options,
      context,
      extensions
    )) {
      yield result;
    }
  };
}

export async function* runBuilder(
  options: ServeExecutorSchema,
  context: BuilderContext
) {
  context.logger.info('Run serve mf');

  const {mf: defaultOptionsMfe, ...defaultOptions} = options;

  const buildTarget = targetFromTargetString(options.buildTarget);
  const targetOptions = (await context.getTargetOptions(
    buildTarget
  )) as unknown as BuildExecutorSchema;

  const resultMfeOptions = deepMergeObject(
    targetOptions['mf'] || {},
    defaultOptionsMfe || {}
  );

  const optionsMfe = await prepareConfig(
    resultMfeOptions,
    targetOptions,
    context
  );

  if (!optionsMfe.deployUrl) {
    const deployUrl = new URL('http://localhost');
    deployUrl.port = options.port.toString();
    deployUrl.hostname = options.host;
    deployUrl.protocol = options.ssl ? 'https' : 'http';
    optionsMfe.deployUrl = deployUrl.toString();
  }

  const mapShareObject = getMapName(
    optionsMfe.shared,
    optionsMfe.sharedMappings
  );

  const externalDependencies = [...mapShareObject.values()].map(
    (i) => i.packageName
  );

  patchBuilderContext(context, buildTarget, externalDependencies);

  const normalizeOuterOptions = await normalizeOptions(
    context,
    context.target.project,
    defaultOptions
  );

  const esPluginPromise = optionsMfe.esPlugins.map((item) =>
    loadModule<Plugin>(item, targetOptions.tsConfig, context.logger)
  );
  const esPlugins = await Promise.all(esPluginPromise);

  const resultEsBuild = [
    ...esPlugins,
    importMapConfigPlugin(optionsMfe),
    entryPointForExtendDependencies(optionsMfe)
  ]

  const extensions = {
    middleware: [],
    buildPlugins: resultEsBuild,
  };

  const mainTransform = await indexHtml(optionsMfe);


  const transforms = {
    indexHtml: async (input: string) => {
      const mainTransformResult = await mainTransform(input);
      return optionsMfe.indexHtmlTransformer(mainTransformResult);
    },
  };

  if (targetOptions['ssr']) {
    const { parentUrl, fileName } = getPathForRegister('custom-loader-serve');
    register(fileName, {
      parentURL: parentUrl,
      data: { port: port2 },
      transferList: [port2],
    });
  }

  const runServer = serveWithVite(
    normalizeOuterOptions,
    '@angular-devkit/build-angular:application',
    getBuilderAction(),
    context,
    transforms,
    extensions
  );
  for await (const output of runServer) {
    yield output;
  }
}

export default createBuilder(runBuilder);
