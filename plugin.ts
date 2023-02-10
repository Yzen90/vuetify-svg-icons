import { appendFile } from 'fs/promises';
import { parse } from 'path';

import { createFilter, PluginOption, FilterPattern } from 'vite';
import c from 'picocolors';

import { mdiEmbed, mdilEmbed, fasEmbed, farEmbed } from './index.js';
import { stripImports, useReplacer, difference } from './utils.js';

export interface PluginOptions {
  /** Target files for the plugin. */
  include: FilterPattern;
  /**
   * Package for icon extraction.
   * @default '@fortawesome/free-solid-svg-icons'
   */
  package?: string;
  /**
   * Export of `options.package` that provides the icons.
   * @default 'fas'
   */
  iconsExport?: string;
  /**
   * Remove the first import of `options.extractor.package` (default: '@xrnoz/vuetify-svg-icons') and of `options.package` (default: '@fortawesome/free-solid-svg-icons') from the target.
   * @default true
   */
  removeImports?: boolean;
  /**
   * Show replacement information.
   * @default false
   */
  showReplacements?: boolean;
  /** Function that is used to turn the icon objects to a string with the svg data. */
  extractor?: {
    /**
     * Function to get the SVG data from the icon object as a string.
     * @default fasEmbed
     */
    fn: Function;
    /**
     * Name of the function that on each call will be replaced with a string literal with the SVG data of the icon.
     * @default 'fasEmbed'
     */
    name: string;
    /**
     * Package that exports the icon extractor as it is imported in the target, e.g.: `'./my-extractor'` or `'other-package'`
     * @default '@xrnoz/vuetify-svg-icons'
     */
    package: string;
  };
  /** Restrict the plugin to run only on `build` or `serve`. */
  apply?: 'build' | 'serve';
  /**
   * File to dump the transforms result for debugging purposes.
   */
  dumpFile?: string;
}

export default (options: PluginOptions) => {
  const name = 'Icon embedding plugin';
  const iconPackage = options.package ?? '@fortawesome/free-solid-svg-icons';
  const iconsExport = options.iconsExport ?? 'fas';
  const removeImports = options.removeImports ?? true;
  const showReplacements = options.showReplacements ?? false;
  const matcher = RegExp(`(?:\\$setup\\.)?${options.extractor?.name ?? 'fasEmbed'}\\((\\S+)\\)`, 'gm');
  const extractor = options.extractor?.fn ?? fasEmbed;
  const extractorPkg = options.extractor?.package ?? '@xrnoz/vuetify-svg-icons';

  let icons: Record<string, any>;

  const filter = options.include ? createFilter(options.include) : () => false;

  const plugin: PluginOption = {
    name,
    buildStart: async () => {
      if (options.include) icons = (await import(iconPackage /* @vite-ignore */))[iconsExport];
      else console.warn(`${c.magenta(name)}: ${c.yellow('`include` option was not provided.')}`);
    },
    transform: async (code, id) => {
      if (filter(id)) {
        const file = parse(id);
        if (showReplacements) console.info(`\n  [${c.dim(file.base)}] ${c.magenta(name)}:`);

        const matches = file.ext.toLowerCase() === '.vue' ? [] : undefined;
        let transformed = code.replace(matcher, useReplacer(showReplacements, extractor, icons, matches));

        if (removeImports) {
          const original = showReplacements ? transformed : '';

          transformed = stripImports(transformed, iconPackage, extractorPkg);
          transformed = transformed.replace(RegExp(`${options.extractor?.name ?? 'faIconToString'},?`, 'm'), '');

          if (matches) for (const match of matches) transformed = transformed.replace(RegExp(`${match},?`, 'm'), '');

          if (showReplacements) console.info(difference(original, transformed));
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

export const farPreset: Partial<PluginOptions> = {
  package: '@fortawesome/free-regular-svg-icons',
  iconsExport: 'far',
  extractor: {
    fn: farEmbed,
    name: 'farEmbed',
    package: '@xrnoz/vuetify-svg-icons',
  },
};

export const mdiPreset: Partial<PluginOptions> = {
  package: '@mdi/js',
  iconsExport: 'default',
  extractor: {
    fn: mdiEmbed,
    name: 'mdiEmbed',
    package: '@xrnoz/vuetify-svg-icons',
  },
};

export const mdilPreset: Partial<PluginOptions> = {
  package: '@mdi/light-js',
  iconsExport: 'default',
  extractor: {
    fn: mdilEmbed,
    name: 'mdilEmbed',
    package: '@xrnoz/vuetify-svg-icons',
  },
};
