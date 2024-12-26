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

import { ServeExecutorSchema } from './schema';
import { BuildExecutorSchema } from '../build/schema';
import { deepMergeObject, getMapName, patchBuilderContext, prepareConfig } from '../helpers';


function getBuilderAction() {
  return async function* (options, context, extensions) {
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

  const extensions = {
    middleware: [],
    buildPlugins: [],
  };

  const transforms = {
    indexHtml: async (input: string) => {
      return input;
    },
  };

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
