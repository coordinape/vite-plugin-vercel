import { ResolvedConfig } from 'vite';
import * as glob from 'fast-glob';
import path from 'path';
import { getRoot, pathRelativeToApi } from './utils';
import { build } from 'esbuild';
import { FunctionsManifest } from './types';

function getApiEndpoints(resolvedConfig: ResolvedConfig) {
  const apiEndpoints = (resolvedConfig.vercel?.apiEndpoints ?? []).map((p) =>
    path.isAbsolute(p) ? p : path.resolve(getRoot(resolvedConfig), p),
  );

  return new Set(apiEndpoints);
}

export function getApiEntries(resolvedConfig: ResolvedConfig) {
  const apiEndpoints = getApiEndpoints(resolvedConfig);

  const apiEntries = glob
    .sync(`${getRoot(resolvedConfig)}/api/**/*.*([a-zA-Z0-9])`)
    // from Vercel doc: Files with the underscore prefix are not turned into Serverless Functions.
    .filter((filepath) => !path.basename(filepath).startsWith('_'));

  return apiEntries.reduce((entryPoints, filePath) => {
    const prefix = apiEndpoints.has(filePath) ? 'api/' : '';
    const outFilePath = pathRelativeToApi(filePath, resolvedConfig);
    const parsed = path.parse(outFilePath);
    entryPoints[`${prefix}${path.join(parsed.dir, parsed.name)}`] = filePath;

    return entryPoints;
  }, {} as Record<string, string>);
}

// TODO build all targets at once, with shared code in [function].nft.json files
export async function buildFn(
  resolvedConfig: ResolvedConfig,
  source: string,
  filepath: string,
) {
  await build({
    bundle: true,
    target: 'es2020',
    format: 'cjs',
    platform: 'node',
    outfile: path.join(
      getRoot(resolvedConfig),
      '.output/server/pages',
      source + '.js',
    ),
    entryPoints: [filepath],
    logLevel: 'info',
    minify: true,
  });
}

export async function buildApiEndpoints(
  resolvedConfig: ResolvedConfig,
): Promise<FunctionsManifest['pages']> {
  const entries = getApiEntries(resolvedConfig);
  const pages = resolvedConfig.vercel?.functionsManifest?.pages ?? {};
  const fnManifests: FunctionsManifest['pages'] = {};

  for (const [key, val] of Object.entries(entries)) {
    await buildFn(resolvedConfig, key, val);
    const keyJs = key + '.js';

    fnManifests[keyJs] = {
      maxDuration: 10,
      ...pages[keyJs],
    };
  }

  return fnManifests;
}
