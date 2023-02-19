import { mergeProps, createVNode, toRefs, JSXComponent } from 'vue';
import { defineComponent, propsFactory } from 'vuetify/lib/util/index.mjs';
import { IconValue } from 'vuetify/lib/composables/icons.mjs';

import type { IconDefinition } from '@fortawesome/fontawesome-common-types';
import type { IconProps, IconSet } from 'vuetify';

export const faIconToString = (icon: IconDefinition) => `SVG;0 0 ${icon.icon[0]} ${icon.icon[1]};${icon.icon[4]}`;
export const fasEmbed = faIconToString;
export const farEmbed = faIconToString;

export const embedIcon = (icon: string) => icon;
export const mdiEmbed = embedIcon;
export const mdilEmbed = embedIcon;

export const hisToString = (icon: string) => `SVG;0 0 24 24;${icon};;;evenodd`;
export const hioToString = (icon: string) => `SVG;0 0 24 24;${icon};none;1.5`;
export const himToString = (icon: string) => `SVG;0 0 20 20;${icon}`;
export const hisEmbed = hisToString;
export const hioEmbed = hioToString;
export const himEmbed = himToString;

export const SVGIcon: JSXComponent<IconProps> = defineComponent({
  name: 'SVGIcon',
  inheritAttrs: false,
  props: propsFactory(
    {
      icon: {
        type: IconValue,
        required: true,
      },
      tag: {
        type: String,
        required: true,
      },
    },
    'icon',
  )(),
  setup(props: IconProps, _ref: { attrs: Record<string, unknown> }) {
    const { icon, tag } = toRefs(props);
    const { attrs } = _ref;

    const svgProps: Record<string, any> = {
      class: 'v-icon__svg',
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      role: 'img',
      'aria-hidden': 'true',
    };

    let d = icon?.value as string;

    if (d.startsWith?.('SVG;')) {
      const parts = d.split(';');
      svgProps['viewBox'] = parts[1] ?? '';
      d = parts[2] ?? '';

      if (typeof parts[3] === 'string') {
        svgProps['fill'] = parts[3];
        svgProps['style'] = `fill: ${parts[3]};`;
      }

      if (typeof parts[4] === 'string') {
        svgProps['stroke-width'] = parts[4];
        svgProps['stroke'] = 'currentColor';
      }

      if (typeof parts[5] === 'string') {
        svgProps['fill-rule'] = parts[5];
      }
    }

    return () => {
      return createVNode(
        tag.value,
        mergeProps(attrs, {
          style: null,
        }),
        {
          default: () => [createVNode('svg', svgProps, [createVNode('path', { d }, null)])],
        },
      );
    };
  },
});

export default <IconSet>{ component: SVGIcon };
