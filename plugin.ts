import { createFilter, PluginOption, FilterPattern } from 'vite';
import c from 'picocolors';

import type { IconPack } from '@fortawesome/fontawesome-common-types';

import { faIconToString } from './index.js';

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
  const pkg = options.package ?? '@fortawesome/free-solid-svg-icons';
  const removeImports = options.removeImports ?? true;
  const showReplacements = options.showReplacements ?? false;

  let fas: IconPack;

  const truncate = (text: string) => (text.length > 50 ? text.slice(0, 49) + '…' : text);
  const replacer = (original: string, icon: string) => (icon in fas ? `'${faIconToString(fas[icon]!)}'` : original);
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
      if (options.include) ({ fas } = await import(pkg /* @vite-ignore */));
      else console.warn(`${c.magenta(name)}: ${c.yellow('`include` option was not provided.')}`);
    },
    transform: (code, id) => {
      if (filter(id)) {
        if (showReplacements) console.info(`\n  ${c.magenta(name)}:`);

        let transformed = code.replace(/faIconToString\((\S+)\)/gm, showReplacements ? replacerShow : replacer);

        if (removeImports) {
          transformed = transformed.replace(/^.*import.*@xrnoz\/vuetify-svg-icons.*$(?:\r?\n|\r)?/m, '');
          // TODO: Parse code to remove import of `pkg`
        }

        return transformed;
      }
    },
  };
};
