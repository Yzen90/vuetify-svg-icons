import { createFilter, PluginOption, FilterPattern } from 'vite';
import c from 'picocolors';

import type { IconPack } from '@fortawesome/fontawesome-common-types';

import { faIconToString } from './index.js';
import { stripImports, truncate } from './utils.js';

export interface PluginOptions {
  /** Target for transformation. */
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
   * Output replacement info.
   * @default false
   */
  showReplacements?: boolean;
}

export default (options: PluginOptions): PluginOption => {
  const name = 'Icon embedding plugin';
  const iconPackage = options.package ?? '@fortawesome/free-solid-svg-icons';
  const removeImports = options.removeImports ?? true;
  const showReplacements = options.showReplacements ?? false;

  let fas: IconPack;

  const replacer = (original: string, fullID: string) => {
    const icon = fullID.split('.').pop()!;
    return icon in fas ? `'${faIconToString(fas[icon]!)}'` : original;
  };

  const replacerShow = (original: string, icon: string) => {
    const result = replacer(original, icon);
    if (result === original) console.info(` > ${icon} -> ${c.yellow('Not found, not replaced.')}`);
    else console.info(`  - ${icon} -> ${c.dim(truncate(result))}`);
    return result;
  };

  const filter = options.include ? createFilter(options.include) : () => false;

  return {
    name,
    buildStart: async () => {
      if (options.include) ({ fas } = await import(iconPackage /* @vite-ignore */));
      else console.warn(`${c.magenta(name)}: ${c.yellow('`include` option was not provided.')}`);
    },
    transform: (code, id) => {
      if (filter(id)) {
        if (showReplacements) console.info(`\n  ${c.magenta(name)}:`);

        let transformed = code.replace(/faIconToString\((\S+)\)/gm, showReplacements ? replacerShow : replacer);

        if (removeImports) stripImports(transformed, iconPackage);

        return transformed;
      }
    },
  };
};
