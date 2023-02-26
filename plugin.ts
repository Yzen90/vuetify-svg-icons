import { appendFile } from 'fs/promises';
import { parse } from 'path';

import { createFilter, PluginOption, FilterPattern } from 'vite';
import c from 'picocolors';

import { stripImports, useReplacer, difference } from './utils.js';

export interface ExtractionOptions {
  /** Package that provides the icons that will be embeded. */
  iconsPkg: string;
  /** Name of the export that provides the icons, e.g. `'default'`. */
  iconsExport: string;
  /** Name of the function that at each call in the target will be replaced with the string literal that it returns. */
  extractor: string;
  /** Package that exports the extractor as it is imported in the target, e.g. `'./my-extractor'` or `'other-package'`. */
  extractorPkg: string;
}

export type Preset = 'fas' | 'far' | 'mdi' | 'mdil' | 'hio' | 'his' | 'him';

export interface IconEmbedOptions {
  /** Target files for the plugin. */
  include: FilterPattern;
  /**
   * Icons package(s) for extraction and embedding.
   * @default ['fas']
   */
  embed?: Array<ExtractionOptions | Preset>;
  /**
   * Remove the first import of `extractorPkg` and of `iconsPkg` from the target.
   * @default true
   */
  removeImports?: boolean;
  /**
   * Show replacement information.
   * @default false
   */
  showReplacements?: boolean;
  /** Restrict the plugin to run only on `build` or `serve`. */
  apply?: 'build' | 'serve';
  /**
   * File to dump the transforms result for debugging purposes.
   */
  dumpFile?: string;
}

export const fasPreset: ExtractionOptions = {
  iconsPkg: '@fortawesome/free-solid-svg-icons',
  iconsExport: 'fas',
  extractor: 'useFAS',
  extractorPkg: '@xrnoz/vuetify-svg-icons',
};

export const farPreset: ExtractionOptions = {
  iconsPkg: '@fortawesome/free-regular-svg-icons',
  iconsExport: 'far',
  extractor: 'useFAR',
  extractorPkg: '@xrnoz/vuetify-svg-icons',
};

export const mdiPreset: ExtractionOptions = {
  iconsPkg: '@mdi/js',
  iconsExport: 'default',
  extractor: 'useMDI',
  extractorPkg: '@xrnoz/vuetify-svg-icons',
};

export const mdilPreset: ExtractionOptions = {
  iconsPkg: '@mdi/light-js',
  iconsExport: 'default',
  extractor: 'useMDIL',
  extractorPkg: '@xrnoz/vuetify-svg-icons',
};

export const hisPreset: ExtractionOptions = {
  iconsPkg: '@xrnoz/heroicons-js',
  iconsExport: 'his',
  extractor: 'useHIS',
  extractorPkg: '@xrnoz/vuetify-svg-icons',
};

export const hioPreset: ExtractionOptions = {
  iconsPkg: '@xrnoz/heroicons-js',
  iconsExport: 'hio',
  extractor: 'useHIO',
  extractorPkg: '@xrnoz/vuetify-svg-icons',
};

export const himPreset: ExtractionOptions = {
  iconsPkg: '@xrnoz/heroicons-js',
  iconsExport: 'him',
  extractor: 'useHIM',
  extractorPkg: '@xrnoz/vuetify-svg-icons',
};

const presets: { [key in Preset]: ExtractionOptions } = {
  fas: fasPreset,
  far: farPreset,
  mdi: mdiPreset,
  mdil: mdilPreset,
  hio: hioPreset,
  his: hisPreset,
  him: himPreset,
};

export default (options: IconEmbedOptions) => {
  const name = 'Icon embedding plugin';

  const targets = options.embed ?? ['fas'];
  const removeImports = options.removeImports ?? true;
  const showReplacements = options.showReplacements ?? false;

  const filter = options.include ? createFilter(options.include) : () => false;

  const plugin: PluginOption = {
    name,
    buildStart: async () => {
      if (!options.include) console.warn(`${c.magenta(name)}: ${c.yellow('`include` option was not provided.')}`);
    },
    transform: async (code, id) => {
      if (filter(id)) {
        const file = parse(id);
        if (showReplacements) console.info(`\n  [${c.dim(file.base)}] ${c.magenta(name)}:`);

        let transformed = code;

        const removed: string[] = [];

        for (let target of targets) {
          if (typeof target === 'string') {
            if (presets.hasOwnProperty(target)) {
              target = presets[target];
            } else {
              console.warn(`${c.magenta(name)}: ${c.yellow(`the preset '${target}' does not exist.`)}`);
              continue;
            }
          }

          const matches = file.ext.toLowerCase() === '.vue' ? [] : undefined;

          const { iconsPkg, iconsExport, extractor, extractorPkg } = target as ExtractionOptions;

          const icons = (await import(iconsPkg /* @vite-ignore */))[iconsExport];
          let extractorFn = (await import(extractorPkg /* @vite-ignore */))[extractor];
          if (typeof extractorFn !== 'function')
            extractorFn = (await import(extractorPkg /* @vite-ignore */))['default']?.[extractor];
          if (typeof extractorFn !== 'function') {
            console.warn(`${c.magenta(name)}: ${c.yellow(`'${extractor}' not found in '${extractorPkg}'.`)}`);
            continue;
          }

          const matcher = RegExp(`(?:\\$setup\\.)?${extractor}\\((\\S+)\\)`, 'gm');

          transformed = code.replace(matcher, useReplacer(showReplacements, extractorFn, icons, matches));

          if (removeImports) {
            const original = showReplacements ? transformed : '';

            const iconsPkgRemoved = removed.includes(iconsPkg);
            const extractorPkgRemoved = removed.includes(extractorPkg);

            transformed = stripImports(
              transformed,
              iconsPkgRemoved ? undefined : iconsPkg,
              extractorPkgRemoved ? undefined : extractorPkg,
            );

            if (!iconsPkgRemoved) removed.push(iconsPkg);
            if (!extractorPkgRemoved) removed.push(extractorPkg);

            transformed = transformed.replace(RegExp(`${extractorPkg},?`, 'm'), '');
            if (matches) for (const match of matches) transformed = transformed.replace(RegExp(`${match},?`, 'm'), '');

            if (showReplacements) console.info(difference(original, transformed));
          }
        }

        if (typeof options.dumpFile === 'string')
          await appendFile(options.dumpFile, `\n// ${id}\n${transformed}`, { encoding: 'utf8' });

        return transformed;
      }
    },
  };

  if (options.apply) plugin.apply = options.apply;

  return plugin;
};
