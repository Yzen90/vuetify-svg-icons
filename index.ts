import type { /* createFilter, */ PluginOption } from 'vite';

import type { IconDefinition } from '@fortawesome/fontawesome-common-types';

export const faIconToString = (icon: IconDefinition) => `SVG;0 0 ${icon.icon[0]} ${icon.icon[1]};${icon.icon[4]}`;

export default (): PluginOption => {
  //const filter = createFilter();
  return {
    name: 'SVG icons embedding',
    transform: async (context, file) => {
      if (/icons\.ts$/.test(file)) {
        console.log(file);
        const { fas } = await import('@fortawesome/free-solid-svg-icons');

        const embedded = context
          .replace(/faIconToString\((\S+)\)/gm, (_, icon: string) => `'${faIconToString(fas[icon]!)}'`)
          .replace(/^.*import.*@xrnoz\/vuetify-svg-icons.*$(?:\r?\n|\r)?/m, '');

        console.log(embedded);

        return embedded;
      }
    },
  };
};
