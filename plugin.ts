import { appendFile } from 'fs/promises';

import { createFilter, PluginOption, FilterPattern } from 'vite';
import c from 'picocolors';

import type { IconPack } from '@fortawesome/fontawesome-common-types';

import { faIconToString } from './index.js';
import { stripImports, truncate, difference } from './utils.js';

export interface PluginOptions {
  /** Plugin target files. */
  include: FilterPattern;
  /**
   * Package for icon extraction.
   * @default '@fortawesome/free-solid-svg-icons'
   */
  package?: string;
  /**
   * Remove the first import of `@xrnoz/vuetify-svg-icons` and of `options.package` from the target.
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
     * @default faIconToString
     */
    fn: Function;
    /**
     * Name of the function that on each call will be replaced with a string literal with the SVG data of the icon.
     * @default 'faIconToString'
     */
    name: string;
  };
  /** Restrict the plugin to run only on `build` or `serve`. */
  apply?: 'build' | 'serve';
  /**
   * File to dump the transform result for debugging purposes.
   */
  dumpFile?: string;
}

export default (options: PluginOptions) => {
  const name = 'Icon embedding plugin';
  const iconPackage = options.package ?? '@fortawesome/free-solid-svg-icons';
  const removeImports = options.removeImports ?? true;
  const showReplacements = options.showReplacements ?? false;
  const matcher = RegExp(`${options.extractor?.name ?? 'faIconToString'}\((\S+)\)`, 'gm');
  const extractor = options.extractor?.fn ?? faIconToString;

  let fas: IconPack;

  const replacer = (original: string, fullID: string) => {
    const icon = fullID.split('.').pop()!;
    return icon in fas ? `'${extractor(fas[icon]!)}'` : original;
  };

  const replacerShow = (original: string, icon: string) => {
    const result = replacer(original, icon);
    if (result === original) console.info(` > ${icon} -> ${c.yellow('Not found, not replaced.')}`);
    else console.info(`  - ${icon} -> ${c.dim(truncate(result))}`);
    return result;
  };

  const filter = options.include ? createFilter(options.include) : () => false;

  const plugin: PluginOption = {
    name,
    buildStart: async () => {
      if (options.include) ({ fas } = await import(iconPackage /* @vite-ignore */));
      else console.warn(`${c.magenta(name)}: ${c.yellow('`include` option was not provided.')}`);
    },
    transform: async (code, id) => {
      if (filter(id)) {
        if (showReplacements) console.info(`\n  ${c.magenta(name)}:`);

        let transformed = code.replace(matcher, showReplacements ? replacerShow : replacer);

        if (removeImports) {
          const original = showReplacements ? '' : transformed;
          transformed = stripImports(transformed, iconPackage);
          if (showReplacements) console.info(difference(original, transformed));
        }

        if (typeof options.dumpFile === 'string')
          await appendFile(options.dumpFile, `\n// File: ${id}\n${transformed}`, { encoding: 'utf8' });

        return transformed;
      }
    },
  };

  if (options.apply) plugin.apply = options.apply;

  return plugin;
};
