import { mergeProps, createVNode, JSXComponent } from 'vue';
import { defineComponent } from 'vuetify/lib/util/index.mjs';
import { makeIconProps } from 'vuetify/lib/composables/icons.mjs';

import type { IconDefinition } from '@fortawesome/fontawesome-common-types';
import type { IconProps, IconSet } from 'vuetify';

export const faIconToString = (icon: IconDefinition) => `SVG;0 0 ${icon.icon[0]} ${icon.icon[1]};${icon.icon[4]}`;
export const fasEmbed = faIconToString;
export const farEmbed = faIconToString;

export const embedIcon = (icon: string) => icon;
export const mdiEmbed = embedIcon;
export const mdilEmbed = embedIcon;

export const hisToString = (icon: string) => `SVG;;${icon};;;evenodd`;
export const hioToString = (icon: string) => `SVG;;${icon};none;1.5`;
export const himToString = (icon: string) => `SVG;0 0 20 20;${icon};;;evenodd`;
export const hisEmbed = hisToString;
export const hioEmbed = hioToString;
export const himEmbed = himToString;

export const SVGIcon: JSXComponent<IconProps> = defineComponent({
  name: 'SVGIcon',
  inheritAttrs: false,
  props: makeIconProps(),
  setup(props: IconProps, { attrs }: any) {
    return () => {
      const svgAttrs: Record<string, any> = {
        class: 'v-icon__svg',
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        role: 'img',
        'aria-hidden': 'true',
      };

      let d = props.icon as string;

      if (d.startsWith?.('SVG;')) {
        const parts = d.split(';');

        d = parts[2] ?? '';

        if (parts[1]?.length) svgAttrs['viewBox'] = parts[1];

        if (parts[3]?.length) {
          svgAttrs['fill'] = parts[3];
          svgAttrs['style'] = `fill: ${parts[3]};`;
        }

        if (parts[4]?.length) {
          svgAttrs['stroke-width'] = parts[4];
          svgAttrs['stroke'] = 'currentColor';
        }

        if (parts[5]?.length) svgAttrs['fill-rule'] = parts[5];
      }

      return createVNode(props.tag, mergeProps(attrs, { style: null }), {
        default: () => [createVNode('svg', svgAttrs, [createVNode('path', { d }, null)])],
      });
    };
  },
});

export default <IconSet>{ component: SVGIcon };
